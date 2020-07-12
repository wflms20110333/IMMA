// Things to do at the beginning of code
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({'user_bbug_id': getRandomToken()}); // set a unique user ID
    chrome.storage.sync.set({'immaActive':true}); // set a unique user ID

    chrome.storage.sync.set({'alarm_spacing': 12}); // needs to be valid value in bDict in options.js
    chrome.storage.sync.set({'silence': 'false'});
    chrome.storage.sync.set({'persist_notifs': 'false'});
    chrome.storage.sync.set({'flagged_sites': {"www.youtube.com":[1.0,0.0,0.0,1.0,0.0],"www.facebook.com":[0.0,0.0,1.0,0.0,0.0]}});

    chrome.storage.sync.set({'recent_message_ct': '0'}); // count of messages given since last question given
    chrome.storage.sync.set({'last_tabs': {}}); // initialize as no tabs currently open
    chrome.storage.sync.set({'mood': [3.0, 3.0, 3.0, 3.0, 3.0]}); // initialize neutral mood
    chrome.storage.sync.set({'question_ratio': 0.2}); // ratio of questions

    loadCharacterCode("default"); // load first imma character from code
    lastTabsUpdater();
    setQuickAlarm(); // set first alarm for 0.8 second
});

// User responds to a question notification
chrome.notifications.onButtonClicked.addListener(function (notificationID, buttonIndex) {
    // Check if the notification type is that of a question
    if (notificationID == 'Notif_Question') {
        // If so, run the training procedure with feedback
        updateWithAnswer(-2*buttonIndex+1); // pass on feedback from which button was clicked (0 or 1) => (1 or -1)
        chrome.notifications.clear('Notif_Question');
    }
    sendMessage(); // instant message after question response
});

// Whenever alarm fires
chrome.alarms.onAlarm.addListener(function (alarmInfo) {
    chrome.storage.sync.get(['immaActive', 'imma_name', 'image_link'], function (result) {
        if (result['immaActive'] == true){ // Active IMMA!!
            if (alarmInfo['name'] == "question") { // send a question to user
                sendNewQuestion(); // contacts server for question, then sends notification
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
    console.log("Startup: running update, clean");
    lastTabsUpdater(); // update tabs, but not too often
    chrome.alarms.clearAll();
    setNextAlarm(); // set timer for one & only one alarm
    cleaner();
});

var tabsLastUpdated = getCurrentTime();

// Whenever tabs are updated, update last_tabs tracker
chrome.tabs.onUpdated.addListener(function () {
    if (getCurrentTime() - tabsLastUpdated > 2000) {
        console.log("Tab: running update");
        tabsLastUpdated = getCurrentTime();
        lastTabsUpdater(); // update tabs, but not too often
    }
});
