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

    loadCharacterCode("horanghae");
    
    findCurrentTabs(sendMessage); // gets current tabs open, contacts server for message, then sends notification
    //sendNewQuestion(); // contacts server for question, then sends notification
});

// User responds to a question notification
chrome.notifications.onButtonClicked.addListener(function (notificationID, buttonIndex) {
    // Check if the notification type is that of a question
    if (notificationID == 'Notif_Question') {
        // If so, run the training procedure with feedback
        updateWithAnswer(-2*buttonIndex+1); // pass on which button was clicked (0 or 1) => (1 or -1)
        chrome.notifications.clear('Notif_Question');
    }
});

// Whenever user goes to a new site #todo or when 1 minute elapsed since last update
chrome.tabs.onUpdated.addListener(function () {
    // First, save the opened urls to experience buffer
    //var openTabs = findCurrentTabs();

    /*
    chrome.history.search(queryItem, (hist) => {
        return hist;
        // do server things??????????????????????????????????????????????????????????????????????????
    })
    */

    // If >10 seconds elapsed from lastEntryRead
    /*chrome.storage.sync.get(['EXPBUFF'], function (result) {
        var lastEntryTime = result['EXPBUFF']['last_entry_time'];
        if (currentTime - lastEntryTime > 10000) {
            console.log(lastEntryTime); // debug
            // query the server for result
            // aaaaaaaaaaAAAAAAAAAAAAAAAAAAAAAAAAA how to???
            // if result is positive, display notification, update experience buffer
            sendNotification(); // debug
        }
    });*/

    // update lastEntryRead to current time
    //var currentTime = getCurrentTime();
    //chrome.storage.sync.set({ 'last_entry_time': currentTime }); // #note idk if this is okay in terms of asynchronous things??
});

