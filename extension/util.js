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
function getMail(callback) {
    chrome.storage.sync.get(['lastMail'], function(result) {
        serverPOST('getMail', result, function(data) {
            callback(data['mail']);
        });
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
    var queryInfo = { currentWindow: true }; // query parameters for finding tabs

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
function lastTabsUpdater() {
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
        });
    });
}

/**
 * Calls serverPOST to pick a good notification, then sends that notification
 */
function sendMessage() {
    console.log('in evaluateState');
    // TODO: original: chrome.storage.sync.get(['imma_name', 'image_link', 'custom_ratio', 'last_tabs', 'message_bank', 'flagged_sites', 'mood', 'textingstyle', 'personality', 'persist_notifs', 'silence'], function(result) {
    chrome.storage.sync.get(['imma_name', 'image_link', 'custom_ratio', 'last_tabs', 'message_bank', 'flagged_sites', 'mood', 'textingstyle', 'user_lang'], function(result) {
        serverPOST('evaluateState', result, function(data) {
            sendNotification(data['message'], result['imma_name'], result['image_link'], result['persist_notifs']);
            chrome.storage.sync.set({ 'mood': data['predictedState'] }); // update with any clipping that was done
        });
    });
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
    serverPOST('retrieveIMMA', jsonObj, function(data) {
        if (data['result'] == false) { // code invalid
            sendNotification("Invalid code was entered", 'IMMA', 'null_image.png');
        } else { // code valid
            loadCharacterFromJson(data);
        }
    });
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
function serverQuery(endpoint, f) {
    console.log("Fetching from " + endpoint + "...");
    fetch(SERVER_URL + endpoint).then(function(response) {
        // the response of a fetch() request is a Stream object, which means
        //  that when we call the json() method, a Promise is returned since
        //  the reading of the stream will happen asynchronously
        // thus, response.json() can only be called once!
        response.json().then(f);
    }).then(data => {});
}

/**
 * See above; function for POSTing with input JSON
 * @param {string} endpoint the endpoint after url (as defined in constants.js)
 * @param {Object} inputObject the input JSON object
 * @param {function} f the function to process the JSON response from fetch()
 */
function serverPOST(endpoint, inputObject, f) {
    console.log("Fetching from " + endpoint + "...");
    fetch(SERVER_URL + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputObject),
    }).then(function(response) {
        // the response of a fetch() request is a Stream object, which means
        // that when we call the json() method, a Promise is returned since
        // the reading of the stream will happen asynchronously
        // thus, response.json() can only be called once!
        response.json().then(f);
    }).then(data => {}).catch(error => {
        console.error(error);
    });;
}