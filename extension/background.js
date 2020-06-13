function helloWorld() {
    console.log('in helloWorld');
    var data = serverQuery('helloWorld', function(data) {
        // prints each key-value pair in the returned json
        for (var propName in data) {
            sendNotification('../images/ironman_clear.PNG', propName + '... '+ data[propName]);
        }
    });
}

function pickMessage() {
    console.log('in evaluateState');
    var testInput = {"hist_for_init":["goo","fb","okok","fb","fb","goo","fb"],"current_tabs":["github","fb"]};
    var data = serverPOST('evaluateState', testInput, function(data) {
        sendNotification('../images/ironman_clear.PNG', data["message"]);
    });
}

// Things to do at the beginning of code
chrome.runtime.onInstalled.addListener(function () {
    pickMessage();
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

