// Gets tabs in the current window
function findCurrentTabs(callback) {
  var queryInfo = {currentWindow: true}; // query parameters
  chrome.tabs.query(queryInfo, (tabs) => {return tabs;}); // #note idk how this returning/callback/?? syntax works
}

// Initialize an experience buffer to storage (~an array, intended to record the last ~20 URLs/events)
// Should be able to key in to ['experience'] with indices, e.g. {"5": "google.com"}, with at max 20 indices (#note idk if better way to do this)
function initBuffer() {
  var d = new Date;
  var currentTime = d.getTime(); // records time as ms, might want to process this? #todo
  var expBuff = {'EXPBUFF': {'experience': {"0": {"window_start": currentTime}}, 'last_index': 0, 'maxsize': 20, 'last_entry_time': currentTime}};
  // #note: currently saving everything to one experience buffer key, & loading the entire thing every time
  // but should prob save the separate keys separately? but then things were buggy when I did that so idk, #todo
  chrome.storage.sync.set(expBuff);
  console.log("Experience buffer initialized successfully"); // #todo add a debug mode?
}

// Save the specified entity to the experience buffer
function saveToBuffer(bufferObj) {
  /* chrome.storage.sync.get(null, function(items) { // for debug
    var allKeys = Object.keys(items);
    alert(allKeys);
  }); */

  var d = new Date;
  var currentTime = d.getTime();
  
  chrome.storage.sync.get(['EXPBUFF'], function(items) { // load the experience buffer from storage
    var expIndex = items['EXPBUFF']['last_index'];
    var expSize = items['EXPBUFF']['maxsize'];

    var itemCopy = items; // make copy of the experience buffer to alter

    expIndex++; // increment the index to write to
    if (expIndex > expSize) {
      expIndex = 0;
    }

    itemCopy['EXPBUFF']['experience'][expIndex] = {bufferObj: currentTime}; // add object and time to experience buffer
    itemCopy['EXPBUFF']['last_index'] = expIndex;
    chrome.storage.sync.set(itemCopy); // save
  });
}

// Sends a placeholder notification (need to turn off focus mode to see pop-up)
function sendNotification() {
  chrome.notifications.create('mozzarella', {
    type: 'basic',
    iconUrl: 'images/ironman_clear.PNG',
    title: 'this imma says',
    message: 'time to take a nap',
    //buttons: [{'title': 'yas'}, {'title': 'nah'}],
    requireInteraction: true
  });
}

// Things to do at the beginning of code
chrome.runtime.onInstalled.addListener(function() {
  initBuffer(); // Initializes an experience buffer in storage
});

// Whenever user goes to a new site #todo or when 1 minute elapsed since last update
chrome.tabs.onUpdated.addListener(function() {
  // First, save the opened urls to experience buffer
  var openTabs = findCurrentTabs();
  saveToBuffer(openTabs);

  // If >10 seconds elapsed from lastEntryRead
  chrome.storage.sync.get(['EXPBUFF'], function(result) {
    var lastEntryTime = result['EXPBUFF']['last_entry_time'];
    if (currentTime - lastEntryTime > 10000) {
      console.log(lastEntryTime); // debug
      // query the server for result
      // aaaaaaaaaaAAAAAAAAAAAAAAAAAAAAAAAAA how to???
      // if result is positive, display notification, update experience buffer
      sendNotification(); // debug
    }
  });
  
  // update lastEntryRead to current time
  var d = new Date;
  var currentTime = d.getTime();
  chrome.storage.sync.set({'last_entry_time': currentTime}); // #note idk if this is okay in terms of asynchronous things??
});

