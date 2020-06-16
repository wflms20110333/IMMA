/**
 * Returns the current time
 */
function getCurrentTime() {
    var d = new Date;
    return d.getTime();
}

/**
 * Returns {"current_tabs": tabs in the current window} & updates memory of last opened tabs
 * @param {function} callback to run with the current tabs as input
 */
function findCurrentTabs(callback) {
    var tabInfo = {"current_tabs": []};
    var queryInfo = { currentWindow: true }; // query parameters for finding tabs

    chrome.tabs.query(queryInfo, (tabs) => {
        for (var tabIndex in tabs) {
            var tabUrl = tabs[tabIndex]['url'];
            // Remove "http", keep only up to 1st /, limit to 50 characters
            tabUrl = tabUrl.split("//")[1].split("/")[0].substring(0, 50);
            tabInfo["current_tabs"].push(tabUrl);
        }
        chrome.storage.sync.set({'last_tabs': tabInfo["current_tabs"]});
        callback(tabInfo);
    });
}

/**
 * Calls serverPOST to pick a good notification, then sends that notification
 * @param {Object} currentTabs json of the current tabs open
 */
function sendMessage(currentTabs) {
    console.log('in evaluateState');

    chrome.storage.sync.get(['imma_name'], function (result) {
        currentTabs["imma_name"] = result['imma_name']; // append imma name information
        serverPOST('evaluateState', currentTabs, function(data) {
            sendNotification(data["message"], data['imma_name'], result['imma_name']);
        });
    });
}

/**
 * Calls serverPOST to pick a question, then sends that question & updates memory of last question stats
 */
function sendNewQuestion() {
    console.log('in sendNewQuestion');

    chrome.storage.sync.get(['imma_name'], function (result) {
        var immaName = {"imma_name": result['imma_name']}; // pass on imma name information
        serverPOST('getQuestion', immaName, function(data) {
            sendNotifQuestion(data["question"], data['imma_name'], result['imma_name']);
            chrome.storage.sync.set({'last_q_weight': data["questionWeight"]});
        });
    }); 
}

/**
 * Calls serverPOST to update using memory's last tabs and last question weights
 */
function updateWithAnswer(buttonIndex) {
    console.log('in updateWithAnswer');
    chrome.storage.sync.get(['last_tabs', 'last_q_weight'], function (result) {
        var qWeights = result['last_q_weight'];
        result['last_q_weight'] = qWeights.map(function(element) { // multiply by +1 or -1
            return element*buttonIndex;
        });
        serverPOST('processAnswer', result, null);
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
        iconUrl: '../images/character images/'+immaFilename+'.png',
        title: immaName + ":",
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
        iconUrl: '../images/character images/'+immaFilename+'.png',
        title: immaName + ":",
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
    console.log('Fetching from ' + endpoint + '...');
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
    console.log('Fetching from ' + endpoint + '...');
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
