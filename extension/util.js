/**
 * Returns the current time
 */
function getCurrentTime() {
    var d = new Date;
    return d.getTime();
}

/**
 * Returns {"current_tabs": tabs in the current window}
 * @param {function} callback to run with the current tabs as input
 */
function findCurrentTabs(callback) {
    var tabInfo = {'current_tabs': []};
    var queryInfo = { currentWindow: true }; // query parameters for finding tabs

    chrome.tabs.query(queryInfo, (tabs) => {
        for (var tabIndex in tabs) {
            var tabUrl = tabs[tabIndex]['url'];
            // Remove "http", keep only up to 1st /, limit to 50 characters
            tabUrl = tabUrl.split('//')[1].split('/')[0].substring(0, 50);
            tabInfo['current_tabs'].push(tabUrl);
        }
        callback(tabInfo);
    });
}

/**
 * Updates last_tabs tracker
 */
function lastTabsUpdater() {
    findCurrentTabs(function (openTabs) {
        chrome.storage.sync.get(['last_tabs'], function (result) {
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
            chrome.storage.sync.set({'last_tabs': newTabs});
        });
    });
}

/**
 * Calls serverPOST to pick a good notification, then sends that notification
 */
function sendMessage() {
    console.log('in evaluateState');
    chrome.storage.sync.get(['imma_name', 'image_link', 'custom_ratio', 'last_tabs', 'message_bank', 'user_setting', 'mood'], function (result) {
        serverPOST('evaluateState', result, function(data) {
            sendNotification(data['message'], result['imma_name'], result['image_link']);
        });
    });
}

/**
 * Calls serverPOST to pick a question, then sends that question & updates memory of last question stats
 */
function sendNewQuestion() {
    console.log('in sendNewQuestion');

    chrome.storage.sync.get(['imma_name', 'image_link', 'custom_ratio', 'question_bank'], function (result) {
        serverPOST('getQuestion', result, function(data) {
            sendNotifQuestion(data['question'], result['imma_name'], result['image_link']);
            chrome.storage.sync.set({'last_q_weight': data['questionWeight']});
        });
    }); 
}

/**
 * Given answer to last question & those weights, update mood
 * @param {number} buttonIndex which response button was pressed for that question
 */
function updateWithAnswer(buttonIndex) {
    console.log('in updateWithAnswer');
    chrome.storage.sync.get(['mood', 'last_q_weight'], function (result) {
        var lastMood = result['mood'];
        var lastWeight = result['last_q_weight'].split(',').map(Number);
        // need to convert back to number array since it was json-ified

        var newMood = [];
        for (var index in lastMood) {
            newMood.push(lastMood[index] + (buttonIndex * lastWeight[index]))
        }
        chrome.storage.sync.set({'mood': newMood});
    });
}

/**
 * Calls serverPOST to load a character file
 * @param {string} redeemCode a character code to redeem
 */

function loadCharacterCode(redeemCode) {
    console.log('in loadCharacterCode');
    var jsonObj = {'keycode': redeemCode}
    serverPOST('retrieveIMMA', jsonObj, function(data) {
        if (data['success'] == false) { // code invalid
            sendNotification("Invalid code was entered", 'IMMA', 'null_image.png');
        } else { // code valid
            chrome.storage.sync.set({'imma_name': data['information']['name']});
            chrome.storage.sync.set({'image_link': data['information']['imageLink']});
            chrome.storage.sync.set({'custom_ratio': data['information']['percentCustomQuotes']});
            chrome.storage.sync.set({'message_bank': data['messageBank']});
            chrome.storage.sync.set({'question_bank': data['questionBank']});
            chrome.storage.sync.set({'question_ratio': data['personality']['questioning']});
            //sendNotification("New IMMA successfully loaded!", data['information']['name'], data['information']['imageLink']); #TODO put this back in once have implemented timers to space out messages
        } 
    });
}

/**
 * Sets an alarm to quickly give a message, and updates recent_message_ct
 */

function setQuickAlarm() {
    console.log('in setQuickAlarm');
    
    chrome.storage.sync.get(['recent_message_ct'], function (result) {
        lastMessageCt = parseInt(result['recent_message_ct'])
        chrome.storage.sync.set({'recent_message_ct': lastMessageCt + 1}); // will give a message, increment counter

        var nextDelay = Date.now() + (1 * 1000); // seconds to milliseconds past epoch
        chrome.alarms.create("message", {when: nextDelay});
    });
}

/**
 * Calls serverPOST to set an alarm to give the next message/question, and updates recent_message_ct
 */

function setNextAlarm() {
    console.log('in setNextAlarm');
    
    chrome.storage.sync.get(['recent_message_ct', 'user_setting', 'question_ratio'], function (result) {
        serverPOST('getAlarm', result, function(data) {
            if (data['mType'] == "question") {
                chrome.storage.sync.set({'recent_message_ct': 0}); // will give a question, reset counter
            } else {
                lastMessageCt = parseInt(result['recent_message_ct'])
                chrome.storage.sync.set({'recent_message_ct': lastMessageCt + 1}); // will give a message, increment counter
            }

            var nextDelay = Date.now() + (data['mDuration'] * 1000); // seconds to milliseconds past epoch
            chrome.alarms.create(data['mType'], {when: nextDelay});
        });
    });
}

/**
 * Sends a notification to the user
 * @param {string} msg the message to display
 * https://developer.chrome.com/apps/notifications for more information
 */
function sendNotification(msg, immaName, immaFilename) {
    chrome.notifications.create('Notif_Message', { // <= notification ID
        type: 'basic',
        iconUrl: "../images/character images/"+immaFilename,
        title: immaName,
        message: msg,
        priority: 2,
        requireInteraction: true // #TODO make this a user preference
    });
}

/**
 * Sends a notification to the user, & has answer buttons
 * @param {string} msg the question to display
 */
function sendNotifQuestion(msg, immaName, immaFilename) {
    chrome.notifications.create('Notif_Question', { // <= notification ID
        type: 'basic',
        iconUrl: "../images/character images/"+immaFilename,
        title: immaName,
        message: msg,
        buttons: [{'title': 'Yes'}, {'title': 'No'}],
        priority: 2,
        requireInteraction: true
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
    }).then(data => {});
}
