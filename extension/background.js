// Things to do at the beginning of code
chrome.runtime.onInstalled.addListener(function () {
    /* available options (codes are just placeholders) (needs manual server restart)
    temp_code_dict = {
        'snapsnapsnap': '001_ironman',
        'horanghae': '002_hoshi',
        'lazybear': '003_rilakkuma',
        'justDOit': '004_shia',
        'waterwater': '005_moana'
    }
     */

    chrome.storage.sync.set({'user_setting': "server/model/001.usersetting"});
    chrome.storage.sync.set({'recent_message_ct': '0'}); // count of messages given since last question given
    chrome.storage.sync.set({'last_tabs': {}}); // initialize as no tabs currently open
    chrome.storage.sync.set({'mood': [3.0, 3.0, 3.0, 3.0, 3.0]}); // initialize neutral mood
    loadCharacterCode("horanghae"); // load first imma character from code
    lastTabsUpdater();
    setQuickAlarm(); // set first alarm
});

// User responds to a question notification
chrome.notifications.onButtonClicked.addListener(function (notificationID, buttonIndex) {
    // Check if the notification type is that of a question
    if (notificationID == 'Notif_Question') {
        // If so, run the training procedure with feedback
        updateWithAnswer(-2*buttonIndex+1); // pass on feedback from which button was clicked (0 or 1) => (1 or -1)
        chrome.notifications.clear('Notif_Question');
    }
});

// Whenever alarm fires
chrome.alarms.onAlarm.addListener(function (alarmInfo) {
    if (alarmInfo['name'] == "question") { // send a question to user
        sendNewQuestion(); // contacts server for question, then sends notification
        setNextAlarm(); // set timer for another alarm immediately
    } else { // send a message to user
        sendMessage(); // gets current tabs open, contacts server for message, then sends notification
        setNextAlarm(); // set timer for another alarm immediately
    }    
});

// Whenever tabs are updated, update last_tabs tracker
chrome.tabs.onUpdated.addListener(function () {
    lastTabsUpdater();
});