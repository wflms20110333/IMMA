/* Copyright (C) 2020- IMMA Studio, LLC - All Rights Reserved
 * This file is subject to the terms and conditions defined in
 * file 'license.txt', which is part of this source code package.
 * You may not distribute, reproduce, or modify this code without written permission.
 */

/**
 * Returns the current time
 */
function getCurrentTime() {
    var d = new Date;
    return d.getTime();
}

/**
 * Generates a random UID
 */
function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(16);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

/**
 * Get whether there's mail from server that haven't read yet
 */
function getMail(callback, suppressServerWarning) {
    chrome.storage.sync.get(['lastMail'], function(result) {
        serverPOST('getMail', result, function(data) {
            callback(data['mail']);
        }, suppressServerWarning);
    });
}

/**
 * Cleans up any expired alarms
 */
function cleanExpiredAlarms() {
    chrome.alarms.getAll(function(activeAlarms) {
        for (var alarmIndex in activeAlarms) {
            var alarmTime = activeAlarms[alarmIndex]['scheduledTime'];
            if (getCurrentTime() > alarmTime) {
                console.log("Expired alarm cleaned")
                chrome.alarms.clear(activeAlarms[alarmIndex]['name']);
            }
        }
    });
}

/**
 * cleans alarms, ensures an alarm is running
 */
function cleaner() {
    cleanExpiredAlarms(); // Gets rid of any expired alarms

    // Check that if the extension is active, that there is at least one alarm running
    chrome.storage.sync.get(['immaActive'], function(result) {
        if (result['immaActive'] == true) { // If imma is active
            chrome.alarms.getAll(function(activeAlarms) {
                if (activeAlarms.length == 0) { // but no alarms running
                    console.log("No alarms running?")
                    setNextAlarm(); // then set an alarm
                }
            });
        }
    });
}

/**
 * Returns {"current_tabs": tabs in the current window}
 * @param {function} callback to run with the current tabs as input
 */
function findCurrentTabs(callback) {
    var tabInfo = { 'current_tabs': [] };
    var queryInfo = {}; // query parameters for finding tabs

    chrome.tabs.query(queryInfo, (tabs) => {
        for (var tabIndex in tabs) {
            var tabUrl = tabs[tabIndex]['url'];
            // Remove "http", keep only up to 1st /, limit to 50 characters
            tabUrl = tabUrl.split('//')
            if (tabUrl.length > 1) {
                tabUrl = tabUrl[1].split('/')[0].substring(0, 50);
            } else {
                tabUrl = tabUrl[0].substring(0, 50);
            }
            tabInfo['current_tabs'].push(tabUrl);
        }
        callback(tabInfo);
    });
}

/**
 * Updates last_tabs tracker
 */
function lastTabsUpdater(callback) {
    findCurrentTabs(function(openTabs) {
        chrome.storage.sync.get(['last_tabs'], function(result) {
            // First, get which tabs are open and get current time
            var tabList = openTabs['current_tabs'];
            var currentTime = getCurrentTime();

            // Load saved past tabs for comparison
            var lastTabs = result['last_tabs'];

            // Compare current tabs to saved past tabs
            var newTabs = {};
            for (var tabIndex in tabList) {
                var tabName = tabList[tabIndex];
                if (tabName in lastTabs) { // this tab was open before, so use the old opening time
                    newTabs[tabName] = lastTabs[tabName];
                } else { // this tab was just opened
                    newTabs[tabName] = currentTime;
                }
            }
            chrome.storage.sync.set({ 'last_tabs': newTabs });
            callback();
        });
    });
}

/**
 * Calls serverPOST to pick a good notification, then sends that notification
 */
function sendMessage() {
    console.log('in evaluateState');
    lastTabsUpdater(function(){
        // check if tab permission is enabled
        chrome.permissions.contains({ permissions: ['tabs'] }, function(result) {
            if (result) {
                // send site warning message
                chrome.storage.sync.get(['last_tabs', 'flagged_sites'], function(data){
                    var onFlagged = Object.keys(data['last_tabs']).filter(value => Object.keys(data['flagged_sites']).includes(value));
                    //.some(item => .includes(item));
                    if (onFlagged.length > 0) {
                        chrome.storage.sync.get(['imma_name', 'image_link'], function(data2){
                            sendNotification("Don't spend too much time on "+data['flagged_sites'][onFlagged]+"!", data2['imma_name'], data2['image_link']);
                        });
                    } else { sendNormalMessage(); }
                });
            } else {
                sendNormalMessage();
            }
        });
    });
}

function sendNormalMessage(){
    // send normal message
    chrome.storage.sync.get(['imma_name', 'image_link', 'custom_ratio', 'message_bank', 'mood', 'textingstyle', 'user_lang'], function(result) {
        // Use custom content
        if (Math.random() < parseFloat(result['custom_ratio']) && Object.keys(result['message_bank']).length > 0) {
            console.log("picking cc");
            pickFromMsgBank(true, result['imma_name'], result['image_link'], result['message_bank'], result['textingstyle']);
        } else { // Server request
            var msg_Bank = {}
            if (result['user_lang'] == 'zh'){ msg_Bank = msg_Bank_Zh; }
            else if (result['user_lang'] == 'es'){ msg_Bank = msg_Bank_Es; }
            else { msg_Bank = msg_Bank_En; }
            pickFromMsgBank(false, result['imma_name'], result['image_link'], msg_Bank, result['textingstyle']);
        }
    });
}

function pickFromMsgBank(usingCC, bbName, bbImgLink, bbBank, bbStyle){
    // TODO: add fancy smart personality mood code from server into this
    var keys = Object.keys(bbBank);
    var chosenMsgKey = keys[ keys.length * Math.random() << 0];
    var styledMsg = chosenMsgKey;
    if (usingCC == false) {
        styledMsg = stylize_string(chosenMsgKey, bbStyle); // stylize as long as not using cc
    }
    sendNotification(styledMsg, bbName, bbImgLink);
}

function stylize_string(msg, textstyle){
    var msg2 = msg;

    // First, extract any emojis
    var emoji = "";
    if (msg.includes('[') && msg.includes(']')) {
        emoji = msg2.match(/ *\[[^\]]*]/)[0];
        emoji = emoji.replace('[', '');
        emoji = emoji.replace(']', '');
        msg2 = msg2.replace(/ *\[[^\]]*]/, '');
    }
    console.log("EMOJITIME");
    console.log(emoji);
    console.log(msg2);

    // Capitalization
    if (textstyle['capitalization'] < 0.3) { msg2 = msg2.toLowerCase(); }
    else if (textstyle['capitalization'] > 0.8) { msg2 = msg2.toUpperCase(); }

    // Punctuation
    if (textstyle['punctuation'] < 0.3) { // don't have punctuation
        msg2 = msg2.replace('!', '').replace('?', '').replace(',', '').replace('.', '');
    } else if (textstyle['punctuation'] > 0.9) { // extra extra punctuation
        msg2 = msg2.replace('!', '!!!!').replace('?', '????');
    } else if (textstyle['punctuation'] > 0.5) { // extra punctuation
        msg2 = msg2.replace('!', '!!').replace('?', '??');
    } 
    
    // Re-add any emojis
    if (Math.random() < parseFloat(textstyle['emojis'])) {
        msg2 = msg2.concat(emoji);
    }
    console.log(msg2);

    return msg2;
}

/**
 * Calls serverPOST to pick a question, then sends that question & updates memory of last question stats
 */
function sendNewQuestion() {
    console.log('in sendNewQuestion');

    chrome.storage.sync.get(['imma_name', 'image_link', 'custom_ratio', 'question_bank', 'textingstyle', 'personality'], function(result) {
        serverPOST('getQuestion', result, function(data) {
            if (data['result'] == "qbank_empty") { // no questions to send
                sendMessage();
            } else {
                sendNotifQuestion(data['question'], result['imma_name'], result['image_link'], result['persist_notifs']);
                chrome.storage.sync.set({ 'last_q_weight': data['questionWeight'] });
            }
        });
    });
}

/**
 * Given answer to last question & those weights, update mood
 * @param {number} buttonIndex which response button was pressed for that question
 */
function updateWithAnswer(buttonIndex) {
    console.log('in updateWithAnswer');
    chrome.storage.sync.get(['mood', 'last_q_weight'], function(result) {
        var lastMood = result['mood'];
        var lastWeight = result['last_q_weight'].split(',').map(Number);
        // need to convert back to number array since it was json-ified

        var newMood = [];
        for (var index in lastMood) {
            newMood.push(lastMood[index] + (buttonIndex * lastWeight[index]))
        }
        chrome.storage.sync.set({ 'mood': newMood });
    });
}

/**
 * Calls serverPOST to load a character file
 * @param {string} redeemCode a character code to redeem
 */

function loadCharacterCode(redeemCode) {
    console.log('in loadCharacterCode');
    var jsonObj = { 'keycode': redeemCode }
    if (redeemCode == "default") {
        var defaultChar = {"information":{"name":"Browserbee","premade":true,"percentCustomQuotes":"0.1","imageS3Path":"https://imma-bucket.s3-us-west-2.amazonaws.com/browserbug_images/null_image.png","uid":"12345678901234567890"},"personality":["0.5","1","1"],"textstyle":{"emojis":"0.5","capitalization":"0.5","punctuation":"0.5"},"messageBank":{}};
        loadCharacterFromJson(defaultChar);
    } else {
        serverPOST('retrieveIMMA', jsonObj, function(data) {
            if (data['result'] == false) { // code invalid
                sendNotification("Invalid code was entered", 'IMMA', 'null_image.png');
            } else { // code valid
                loadCharacterFromJson(data);
            }
        });
    }
}

function loadCharacterFromJson(jsonData) {
    console.log('in loadCharacterFromJson');
    if (typeof jsonData === 'string' || jsonData instanceof String) {
        var data = JSON.parse(jsonData);
    } else {
        var data = jsonData;
    }

    chrome.storage.sync.set({ 'imma_name': data['information']['name'] });
    var image_path = data['information']['imageS3Path'];
    if (image_path != undefined && image_path.startsWith('browserbug_images/')) {
        image_path = S3_URL + image_path;
    } else if (image_path != undefined && image_path.startsWith(S3_URL)) {
        image_path = image_path;
    } else {
        image_path = NULL_IMAGE_URL;
    }
    chrome.storage.sync.set({ 'image_link': image_path });
    chrome.storage.sync.set({ 'personality': data['personality'] });
    chrome.storage.sync.set({ 'color1': data['information']['color1'] });
    chrome.storage.sync.set({ 'color2': data['information']['color2'] });
    chrome.storage.sync.set({ 'custom_ratio': data['information']['percentCustomQuotes'] });
    chrome.storage.sync.set({ 'message_bank': data['messageBank'] });
    chrome.storage.sync.set({ 'question_bank': {} });
    for (var key in data['textstyle']) {
        data['textstyle'][key] = parseFloat(data['textstyle'][key]);
    }
    chrome.storage.sync.set({ 'textingstyle': data['textstyle'] });
    chrome.storage.sync.set({ 'immaActive': true });
    // #TODO fix, the below code fails sometimes (especially on export page), maybe because popup isn't active in the extensions bar?
    //chrome.browserAction.setBadgeText({ "text": "ON" });
    //chrome.browserAction.setBadgeBackgroundColor({ "color": "#7057C9" });
};

/**
 * Sets an alarm to quickly give a setup message
 */

function setQuickAlarm() {
    console.log('in setQuickAlarm');
    var nextDelay = Date.now() + (1 * 800); // alarm in 0.8 second
    chrome.alarms.create("quickmessage", { when: nextDelay });
}

/**
 * Calls serverPOST to set an alarm to give the next message/question, and updates recent_message_ct
 */

function setNextAlarm() {
    console.log('in setNextAlarm');

    chrome.storage.sync.get(['recent_message_ct', 'alarm_spacing', 'question_ratio'], function(result) {
        var nextNotifType = "none";
        var lastMsgCt = parseInt(result['recent_message_ct']);
        var alarmSpc = parseFloat(result['alarm_spacing']);
        var qRatio = parseFloat(result['question_ratio']);

        if (qRatio >= lastMsgCt) {
            nextNotifType = "message";
            chrome.storage.sync.set({ 'recent_message_ct': lastMsgCt + 1 }); // will give message, increment counter
        } else {
            nextNotifType = "question";
            chrome.storage.sync.set({ 'recent_message_ct': 0 }); // will give a question, reset counter
        }
        
        var nextDelay = Date.now() + (alarmSpc * 1000); // seconds to milliseconds past epoch
        chrome.alarms.create(nextNotifType, { when: nextDelay });
    });
}

/**
 * Sends a notification to the user
 * @param {string} msg the message to display
 * https://developer.chrome.com/apps/notifications for more information
 */
function sendNotification(msg, immaName, immaFilename, persistNotifs, silencing) {
    chrome.notifications.clear('Notif_Question'); // avoid overlap
    chrome.notifications.clear('Notif_Message'); // avoid overlap

    console.log("DEBUG"+msg+"//"+immaName+"||"+immaFilename);

    chrome.notifications.create('Notif_Message', { // <= notification ID
        type: 'basic',
        iconUrl: immaFilename,
        title: immaName,
        message: msg,
        priority: 2,
        requireInteraction: (persistNotifs == 'true'),
        silent: silencing
    });
}

/**
 * Sends a notification to the user, & has answer buttons
 * @param {string} msg the question to display
 */
function sendNotifQuestion(msg, immaName, immaFilename, persistNotifs, silencing) {
    chrome.notifications.clear('Notif_Question'); // avoid overlap
    chrome.notifications.clear('Notif_Message'); // avoid overlap

    console.log("DEBUG"+msg+"//"+immaName+"||"+immaFilename);

    chrome.notifications.create('Notif_Question', { // <= notification ID
        type: 'basic',
        iconUrl: immaFilename,
        title: immaName,
        message: msg,
        buttons: [{ 'title': 'Yes' }, { 'title': 'No' }],
        priority: 2,
        requireInteraction: (persistNotifs == 'true'),
        silent: silencing
    });
}

/**
 * UNUSED
 * Fetches from an endpoint, then processes the results with the provided function
 * E.g. serverQuery('helloWorld') fetches from 'http://127.0.0.1:5000/helloWorld'
 * Assumes the response is in JSON form
 * @param {string} endpoint the endpoint after url (as defined in constants.js)
 * @param {function} f the function to process the JSON response from fetch()
 */
function serverQuery(endpoint, f, suppressServerWarning=false) {
    console.log("Fetching from " + endpoint + "...");
    timeout(500, fetch(SERVER_URL + endpoint).then(function(response) {
        // the response of a fetch() request is a Stream object, which means
        //  that when we call the json() method, a Promise is returned since
        //  the reading of the stream will happen asynchronously
        // thus, response.json() can only be called once!
        response.json().then(f);
    })).then(data => {}).catch(error => {
        if (suppressServerWarning == false) {
            alert("Server is currently down...");
        }
        console.log(error);
    });
}

/**
 * See above; function for POSTing with input JSON
 * @param {string} endpoint the endpoint after url (as defined in constants.js)
 * @param {Object} inputObject the input JSON object
 * @param {function} f the function to process the JSON response from fetch()
 */
function serverPOST(endpoint, inputObject, f, suppressServerWarning=false, timeoutMs=700) {
    console.log("Fetching from " + endpoint + "...");
    timeout(timeoutMs, fetch(SERVER_URL + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputObject),
    })).then(function(response) {
        // the response of a fetch() request is a Stream object, which means
        // that when we call the json() method, a Promise is returned since
        // the reading of the stream will happen asynchronously
        // thus, response.json() can only be called once!
        response.json().then(f);
    }).then(data => {}).catch(error => {
        if (suppressServerWarning == false) {
            alert("Server is currently down...");
        }
        console.log(error);
    });
}
function timeout(ms, promise) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
        reject(new Error("timeout"))
        }, ms)
        promise.then(resolve, reject)
    })
}


var msg_Bank_En = {
	"You can do this![ :D]": [0.8,0.3,0,1,1,1],
	"You've done well![ :O]": [0.8,0.2,0,1,1,1],
	"Good job![ :3]": [0.8,0.2,0,1,1,1],
	"Great work![ :3]": [0.8,0.2,0,1,1,1],
	"Keep it up!": [0.6,0.4,0.1,1,1,1],
	"You've been doing well![ :)]": [1.0,0.1,0,1,1,1],
	"You've got this![ :)]": [0.8,0.1,0.0,1,1,1],
	"You've worked hard![ :)]": [0.5,0,0.1,1,1,1],
	"You've been doing a good job![ :>]": [1.0,0.1,0,1,1,1],
	"You've been doing a great job![ :3]": [1.0,0.1,0,1,1,1],
	"Hope things are going well![ :>]": [0.5,0.3,0.3,1,1,1],
	"Hope you're doing okay![ :)]": [0.6,0.3,0.3,1,1,1],
	"You're getting better![ :)]": [0.7,0.2,0.1,1,1,1],
	"You're amazing![ XD]": [0.7,0.3,0.1,1,1,1],
	"How are you feeling?": [0.6,0.2,0.5,1,1,1],
	"You've leveled up a lot today![ ;)]": [0.5,0.2,0.1,1,1,1],
	"Remember to smile![ :)]": [0.6,0.4,0.3,1,1,1],
	"Thinking of you![ :)]": [0.6,0.2,0.0,1,1,1],
	"You're not alone![ :3]": [0.6,0.2,0.1,1,1,1],
	"It's okay to ask for help![ :)]": [0.5,0.3,0.1,1,1,1],
	"I'm cheering you on![ :D]": [0.7,0.4,0.0,1,1,1],
	"Don't give up![ :>]": [0.3,6,0,1,1,1],
	"Focus![ :>]": [0,0.9,0,1,1,1],
	"Concentrate!": [0,0.8,0,1,1,1],
	"Keep going![ :)]": [0.3,0.7,0,1,1,1],
	"Your work is important, keep at it![ :>]": [0.3,0.7,0,1,1,1],
	"Is that productivity I see?[ :O]": [0.2,0.8,0.1,1,1,1],
	"Don't get distracted![ :>]": [0.2,0.9,0.0,1,1,1],
	"Stay hydrated!": [0.3,0.1,0.8,1,1,1],
	"Be sure to rest your eyes![ :3]": [0.4,0,1.0,1,1,1],
	"Take a break?[ :)]": [0.4,0.2,0.9,1,1,1],
	"Let's take a quick break?[ :)]": [0.4,0.2,0.9,1,1,1],
	"Take a deep breath and recenter![ :)]": [0.7,0.4,0.8,1,1,1],
	"Rest your eyes, look at a distant object![ :)]": [0.3,0.1,1.0,1,1,1],
	"Don't forget to blink and rest your eyes![ ;)]": [0.2,0.1,0.9,1,1,1],
	"How long have you been sitting in this position?": [0.2,0.1,0.9,1,1,1],
	"A quick reminder to sit up straight![ :3]": [0.2,0.0,1.0,1,1,1]
}

var msg_Bank_Es = {
	"¡Puedes hacerlo![ :D]": [0.8,0.3,0,1,1,1],
	"¡Lo has hecho bien![ :O]": [0.8,0.2,0,1,1,1],
	"¡Buen trabajo![ :3]": [0.8,0.2,0,1,1,1],
	"¡Seguid así!": [0.6,0.4,0.1,1,1,1],
	"¡Lo has estado haciendo bien![ :)]": [1.0,0.1,0,1,1,1],
	"¡Has trabajado duro![ :)]": [0.5,0,0.1,1,1,1],
	"¡Has estado haciendo un buen trabajo![ :>]": [1.0,0.1,0,1,1,1],
	"¡Espero que las cosas vayan bien![ :>]": [0.5,0.3,0.3,1,1,1],
	"¡Espero que estés bien![ :)]": [0.6,0.3,0.3,1,1,1],
	"¡Estás mejorando![ :)]": [0.7,0.2,0.1,1,1,1],
	"¡Eres increíble![ XD]": [0.7,0.3,0.1,1,1,1],
	"¿Como te sientes!": [0.6,0.2,0.5,1,1,1],
	"¡Has subido mucho hoy![ ;)]": [0.5,0.2,0.1,1,1,1],
	"¡Recuerda sonreír![ :)]": [0.6,0.4,0.3,1,1,1],
	"¡Pensando en ti![ :)]": [0.6,0.2,0.0,1,1,1],
	"¡No estás solo![ :3]": [0.6,0.2,0.1,1,1,1],
	"¡Está bien pedir ayuda![ :)]": [0.5,0.3,0.1,1,1,1],
	"¡Te estoy animando![ :D]": [0.7,0.4,0.0,1,1,1],
	"¡No te rindas![ :>]": [0.3,0.6,0.0,1,1,1],
	"¡Enfoque![ :>]": [0.0,0.9,0.0,1,1,1],
	"¡Concentrado!": [0.0,0.8,0.0,1,1,1],
	"¡Continúa![ :)]": [0.3,0.7,0.0,1,1,1],
	"¡Su trabajo es importante, continúe![ :>]": [0.3,0.7,0.0,1,1,1],
	"¿Es esa la productividad que veo?[ :O]": [0.2,0.8,0.1,1,1,1],
	"¡No se distraiga![ :>]": [0.2,0.9,0.0,1,1,1],
	"¡Mantente hidratado!": [0.3,0.1,0.8,1,1,1],
	"¡Asegúrese de descansar los ojos![ :3]": [0.4,0.0,1.0,1,1,1],
	"¿Tomar un descanso?​[ :)]": [0.4,0.2,0.9,1,1,1],
	"¿Tomamos un descanso rápido?[ :)]": [0.4,0.2,0.9,1,1,1],
	"¡Respire hondo y vuelva a centrarse![ :)]": [0.7,0.4,0.8,1,1,1],
	"¡Descansa los ojos, mira un objeto distante![ :)]": [0.3,0.1,1.0,1,1,1],
	"¡No olvides parpadear y descansar los ojos![ ;)]": [0.2,0.1,0.9,1,1,1],
	"¿Cuánto tiempo has estado sentado en esta posición!": [0.2,0.1,0.9,1,1,1],
	"¡Un recordatorio rápido para sentarse derecho![ :3]": [0.2,0.0,1.0,1,1,1]
}

var msg_Bank_Zh = {
	"你可以做到[ :D]": [0.0,0.0,0.0,1,1,1],
	"干得好！[ :0]": [0.0,0.0,0.0,1,1,1],
	"太好了！[ :0]": [0.0,0.0,0.0,1,1,1],
	"你做得不错！[ :)]": [0.0,0.0,0.0,1,1,1],
	"你辛苦了！[ :)]": [0.0,0.0,0.0,1,1,1],
    "辛苦了，加油！[ :)]": [0.0,0.0,0.0,1,1,1],
	"你做得很棒！[ :0]": [0.0,0.0,0.0,1,1,1],
	"希望一切顺利！[ :>]": [0.0,0.0,0.0,1,1,1],
	"你好吗？希望你一切都好！[ :)]": [0.0,0.0,0.0,1,1,1],
	"你越来越好了！[ :)]": [0.0,0.0,0.0,1,1,1],
	"你真了不起！": [0.0,0.0,0.0,1,1,1],
	"你感觉怎么样？": [0.0,0.0,0.0,1,1,1],
	"你今天已经提高了很多！[ ;）]": [0.0,0.0,0.0,1,1,1],
	"记得微笑！[ :)]": [0.0,0.0,0.0,1,1,1],
	"想着你！[ :)]": [0.0,0.0,0.0,1,1,1],
	"你并不孤单！[ :0]": [0.0,0.0,0.0,1,1,1],
	"可以寻求帮助！[ :)]": [0.0,0.0,0.0,1,1,1],
	"我为你加油！[ :D]": [0.0,0.0,0.0,1,1,1],
	"不要放弃！[ :>]": [0.0,0.0,0.0,1,1,1],
	"集中思想！[ :>]": [0.0,0.0,0.0,1,1,1],
	"现在要集中思想！": [0.0,0.0,0.0,1,1,1],
    "继续努力！[ :)]": [0.0,0.0,0.0,1,1,1],
    "继续努力，你真棒！[ :)]": [0.0,0.0,0.0,1,1,1],
	"你的工作很重要，请继续努力！[ :>]": [0.0,0.0,0.0,1,1,1],
	"我看到你的效率很高。真不错啊！[ :O]": [0.0,0.0,0.0,1,1,1],
	"不要分心！[ :>]": [0.0,0.0,0.0,1,1,1],
	"要不要起来倒杯水？": [0.0,0.0,0.0,1,1,1],
	"请确保休息！[ :0]": [0.0,0.0,0.0,1,1,1],
	"要不要休息一下？[ :)]": [0.0,0.0,0.0,1,1,1],
	"让我们休息一下，好吗？[ :)]": [0.0,0.0,0.0,1,1,1],
    "请深呼吸一下！[ :)]": [0.0,0.0,0.0,1,1,1],
    "看看窗外！": [0.0,0.0,0.0,1,1,1],
	"休息一下眼睛，看着远处的物体！[ :)]": [0.0,0.0,0.0,1,1,1],
	"别忘了眨眨眼睛，休息一下！[ ;)]": [0.0,0.0,0.0,1,1,1],
	"你坐在这个位置多久了？": [0.0,0.0,0.0,1,1,1],
	"坐直了对你的健康有帮助！[ :0]": [0.0,0.0,0.0,1,1,1]
}