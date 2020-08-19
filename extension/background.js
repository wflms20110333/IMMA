/* Copyright (C) 2020- IMMA Studio, LLC - All Rights Reserved
 * This file is subject to the terms and conditions defined in
 * file 'license.txt', which is part of this source code package.
 * You may not distribute, reproduce, or modify this code without written permission.
 */

 // Things to do at the beginning of code
chrome.runtime.onInstalled.addListener(function () {
    // open startup page
    window.open("http://imma.studio/browserbug/welcome/");
    console.log("extension installed, welcome :)");

    chrome.storage.sync.set({'user_bbug_id': getRandomToken()}); // set a unique user ID
    chrome.storage.sync.set({'user_level': 3});
    chrome.storage.sync.set({'immaActive':true}); // set to be active
    chrome.browserAction.setBadgeText({"text":"ON"});
    chrome.browserAction.setBadgeBackgroundColor({"color": "#7057C9"});
    chrome.storage.sync.set({'lastMail':'000'}); // the last mail message viewed
    chrome.storage.sync.set({'user_lang': chrome.i18n.getMessage('@@ui_locale').split("_")[0]}); // set language to i18n by default

    chrome.storage.sync.set({'alarm_spacing': 40}); // needs to be valid value in constants.js
    chrome.storage.sync.set({'silence': 'false'});
    chrome.storage.sync.set({'persist_notifs': 'false'});
    chrome.storage.sync.set({'flagged_sites': {}});

    chrome.storage.sync.set({'recent_message_ct': '0'}); // count of messages given since last question given
    chrome.storage.sync.set({'last_tabs': {}}); // initialize as no tabs currently open
    chrome.storage.sync.set({'mood': [3.0, 3.0, 3.0]}); // initialize neutral mood
    chrome.storage.sync.set({'question_ratio': 0.2}); // ratio of questions

    loadCharacterCode("default"); // load first imma character from code
    setQuickAlarm(); // set first alarm for 0.8 second
});

// Whenever alarm fires
chrome.alarms.onAlarm.addListener(function (alarmInfo) {
    chrome.storage.sync.get(['immaActive', 'imma_name', 'image_link'], function (result) {
        if (result['immaActive'] == true){ // Active IMMA!!
            if (alarmInfo['name'] == "question") { // send a question to user
                sendMessage();
                // #TODO questions broken, fix
                //sendNewQuestion(); // contacts server for question, then sends notification
            } else if (alarmInfo['name'] == "quickmessage") { // send a message that imma is now activated
                sendNotification(result['imma_name'] + " has been loaded!", "Browserbug", result['image_link']);
            } else { // send a message to user
                sendMessage(); // gets current tabs open, contacts server for message, then sends notification
            }
            chrome.alarms.clearAll();
            setNextAlarm(); // set timer for another alarm
        }
    });
});

// Things to do when window loaded
chrome.runtime.onStartup.addListener(function () {
    console.log("Startup: running update, total clean");
    chrome.alarms.clearAll();
    setNextAlarm();
    cleaner();
});

// On window changes
chrome.windows.onFocusChanged.addListener(function () {
    console.log("Changed window: running light clean");
    cleaner();
});