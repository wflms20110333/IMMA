/**
 * Get tabs in the current window
 * @param {* #TODO} callback 
 */

function findCurrentTabs(callback) {
    var queryInfo = { currentWindow: true }; // query parameters
    chrome.tabs.query(queryInfo, (tabs) => { return tabs; });
}

/**
 * Initialize an experience buffer to storage (~an array, intended to record the last ~20 URLs/events)
 * Should be able to key in to ['experience'] with indices, e.g. {"5": "google.com"}, with at max 20 indices (#note idk if better way to do this)
 */

/*
function initBuffer() {
    var currentTime = getCurrentTime(); // records time as ms, might want to process this? #todo
    var expBuff = { 'EXPBUFF': { 'experience': { "0": { "window_start": currentTime } }, 'last_index': 0, 'maxsize': 20, 'last_entry_time': currentTime } };
    // #note: currently saving everything to one experience buffer key, & loading the entire thing every time
    // but should prob save the separate keys separately? but then things were buggy when I did that so idk, #todo
    chrome.storage.sync.set(expBuff);
    console.log("Experience buffer initialized successfully"); // #todo add a debug mode?
}
*/

/**
 * Save the specified entity to the experience buffer
 * @param {* #TODO} bufferObj 
 */

/*
function saveToBuffer(bufferObj) {
    var currentTime = getCurrentTime();

    chrome.storage.sync.get(['EXPBUFF'], function (items) { // load the experience buffer from storage
        var expIndex = items['EXPBUFF']['last_index'];
        var expSize = items['EXPBUFF']['maxsize'];

        var itemCopy = items; // make copy of the experience buffer to alter

        expIndex++; // increment the index to write to
        if (expIndex > expSize) {
            expIndex = 0;
        }

        itemCopy['EXPBUFF']['experience'][expIndex] = { bufferObj: currentTime }; // add object and time to experience buffer
        itemCopy['EXPBUFF']['last_index'] = expIndex;
        chrome.storage.sync.set(itemCopy); // save
    });
}
*/

// Things to do at the beginning of code
chrome.runtime.onInstalled.addListener(function () {
    // initBuffer(); // Initializes an experience buffer in storage
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

