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
            console.log(tabUrl);
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
    // check if tab permission is enabled
    chrome.permissions.contains({ permissions: ['tabs'] }, function(result) {
        if (result) {
            lastTabsUpdater(function(){
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
            });
        } else {
            sendNormalMessage();
        }
    });
}

function sendNormalMessage(){
    // send normal message
    chrome.storage.sync.get(['imma_name', 'image_link', 'custom_ratio', 'default_bank', 'custom_bank', 'textingstyle', 'user_lang'], function(result) {
        // Use custom content
        if (Math.random() < parseFloat(result['custom_ratio']) && Object.keys(result['custom_bank']).length > 0) {
            console.log("picking cc");
            pickFromMsgBank(true, result['imma_name'], result['image_link'], result['custom_bank'], result['textingstyle']);
        } else { // Server request
            var flattened = {};
            for (var i in result['default_bank']) {
                for (var j in result['default_bank'][i]) {
                    flattened[j] = true;
                }
            }
            pickFromMsgBank(false, result['imma_name'], result['image_link'], flattened, result['textingstyle']);
        }
    });
}

function pickFromMsgBank(usingCC, bbName, bbImgLink, bbBank, bbStyle){
    var keys = Object.keys(bbBank);
    if (keys.length == 0) { // no keys available
        sendNotification("Error: no available messages", bbName, bbImgLink);
    } else {
        var chosenMsgKey = keys[ keys.length * Math.random() << 0];
        var styledMsg = chosenMsgKey;
        if (usingCC == false) {
            styledMsg = stylize_string(chosenMsgKey, bbStyle); // stylize as long as not using cc
        }
        sendNotification(styledMsg, bbName, bbImgLink);
    }
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
    // Capitalization
    if (textstyle['capitalization'] < 0.3) { msg2 = msg2.toLowerCase(); }
    else if (textstyle['capitalization'] > 0.8) { msg2 = msg2.toUpperCase(); }

    // Punctuation
    if (textstyle['punctuation'] < 0.3) { // don't have punctuation
        msg2 = msg2.replace('!', '').replace('?', '').replace(',', '').replace('.', '');
    } else if (textstyle['punctuation'] > 0.9) { // extra extra punctuation
        msg2 = msg2.replace('!', '!!!!').replace('?', '???').replace('¡', '¡¡¡¡').replace('¿', '¿¿¿').replace('！', '！！！！').replace('？', '？？？');
    } else if (textstyle['punctuation'] > 0.5) { // extra punctuation
        msg2 = msg2.replace('!', '!!').replace('?', '??').replace('¡', '¡¡').replace('¿', '¿¿').replace('！', '！！').replace('？', '？？');
    } 
    
    // Re-add any emojis
    if (Math.random() < parseFloat(textstyle['emojis'])) {
        msg2 = msg2.concat(emoji);
    }

    return msg2;
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

function loadCharacterFromJson(jsonData) {
    console.log('in loadCharacterFromJson');

    chrome.storage.sync.remove(['default_bank','custom_bank']);

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
    chrome.storage.sync.set({ 'custom_ratio': data['information']['percentCustomQuotes'] });

    for (var key in data['textstyle']) {
        data['textstyle'][key] = parseFloat(data['textstyle'][key]);
    }
    chrome.storage.sync.set({ 'textingstyle': data['textstyle'] });
    chrome.storage.sync.set({ 'immaActive': true });

    chrome.storage.sync.set({ 'default_bank': data['defaultBank'] });
    chrome.storage.sync.set({ 'custom_bank': data['customBank'] });

    // #TODO fix, the below code fails sometimes (especially on export page), maybe because popup isn't active in the extensions bar?
    //chrome.browserAction.setBadgeText({ "text": "ON" });
    //chrome.browserAction.setBadgeBackgroundColor({ "color": "#7057C9" });
};

/**
 * Calls serverPOST to load a character file
 * @param {string} redeemCode a character code to redeem
 */
// Default messages, split into categories
var Wellness = {
	"Rest your eyes: look at a distant object![ :)]": true,
	"Don't forget to blink and rest your eyes![ ;)]": true,
	"Be sure to rest your eyes![ :)]": true,
	"How long have you been sitting in this position?": true,
	"Time for a quick stretch maybe?[ :)]": true,
	"A quick reminder to sit up straight![ :D]": true,
	"Stay hydrated!": true,
	"Don't forget to drink water![ :)]": true,
	"A reminder to drink some water![ :)]": true,
	"Is now a good time for a break?": true,
	"Don't forget to take a break once in a while!": true
}
var Focus = {
	"Keep it up!": true,
	"You can do this![ :D]": true,
	"You've got this![ :)]": true,
	"Don't give up![ :>]": true,
	"Focus![ :>]": true,
	"Concentrate!": true,
	"Keep going![ :)]": true,
	"Your work is important, keep at it![ :>]": true,
	"Is that productivity I see?[ :O]": true,
	"Don't get distracted![ :>]": true
}
var Kudos = {
	"You've been doing well![ :)]": true,
	"You've been doing a great job![ :D]": true,
	"You've done well![ :O]": true,
	"You've worked hard![ :)]": true,
	"You've leveled up a lot today![ :)]": true,
	"You're getting better![ :)]": true,
	"That looks interesting![ :)]": true,
	"Good job![ :)]": true,
	"Great work![ :D]": true,
	"You're amazing![ XD]": true,
	"I'm cheering you on![ :D]": true
}
var Support = {
	"Take a deep breath and recenter![ :)]": true,
	"Close your eyes for a few seconds: how are you feeling?[ :)]": true,
	"Time for a quick breather? Inhale, and slowly exhale.[ :)]": true,
	"How are you feeling right now?": true,
	"Remember to smile![ :)]": true,
	"Don't forget to think about the big picture![ :)]": true,
	"It's okay to ask for help![ :)]": true,
	"Hope you're doing okay![ :)]": true,
	"Are your muscles tense right now? Relax![ :)]": true
}

function loadCharacterCode(redeemCode) {
    console.log('in loadCharacterCode');
    var jsonObj = { 'keycode': redeemCode }
    if (redeemCode == "default") {
        var defaultChar = {"information":{"name":"Browserbee","premade":true,"percentCustomQuotes":"0.1","imageS3Path":"https://imma-bucket.s3-us-west-2.amazonaws.com/browserbug_images/null_image.png","uid":"12345678901234567890"},"defaultBank":{"Wellness": Wellness, "Focus": Focus, "Kudos": Kudos, "Support": Support},"textstyle":{"emojis":"0.5","capitalization":"0.5","punctuation":"0.5"},"customBank":{}};
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
function serverPOST(endpoint, inputObject, f, suppressServerWarning=false, timeoutMs=1500) {
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
