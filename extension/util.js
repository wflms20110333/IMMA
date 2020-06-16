/**
 * Returns the current time
 */
function getCurrentTime() {
    var d = new Date;
    return d.getTime();
}

/**
 * Get tabs in the current window
 * @param {function} callback to run with the current tabs as input
 */
function findCurrentTabs(callback) {
    // using placeholder history-for-initializing right now
    var tabInfo = {"current_tabs": []};

    var queryInfo = { currentWindow: true }; // query parameters for finding tabs

    chrome.tabs.query(queryInfo, (tabs) => {
        for (var tabIndex in tabs) {
            var tabUrl = tabs[tabIndex]['url'];
            // Remove "http", keep only up to 1st /, limit to 50 characters
            tabUrl = tabUrl.split("//")[1].split("/")[0].substring(0, 50);
            tabInfo["current_tabs"].push(tabUrl);
        }
        callback(tabInfo);
    });
}

/**
 * Calls serverPOST to send a notification based on the current state
 * @param {Object} currentTabs json of the current tabs open
 */
function sendMessage(currentTabs) {
    console.log('in evaluateState');
    var data = serverPOST('evaluateState', currentTabs, function(data) {
        sendNotification(data["message"]);
    });
}

/**
 * Calls serverPOST to get a question to ask the user
 */
function sendNewQuestion() {
    console.log('in sendNewQuestion');
    var nullJSON = {"empty": "empty"};
    var data = serverPOST('getQuestion', nullJSON, function(data) {
        sendNotifQuestion(data["question"]);
    });
}

/**
 * Calls serverPOST to update using question weights
 * @param {Array} currentTabs list of the current tabs open
 * @param {Array} lastQuestionWeights array of the last given question's weights
 */
function updateWithAnswer(lastTabs, lastQuestionWeights) {
    console.log('in updateWithAnswer');
    var json_obj = {"current_tabs": lastTabs, "last_question_score": lastQuestionWeights};
    var data = serverPOST('processAnswer', json_obj, null);
}

/**
 * Sends a notification to the user
 * @param {string} msg the message to display
 * https://developer.chrome.com/apps/notifications for more information
 */
function sendNotification(msg) {
    chrome.notifications.create('Notif_Message', { // <= notification ID
        type: 'basic',
        iconUrl: '../images/ironman_clear.png',
        title: '#TODO LOAD FROM CHROME MEMORY INSTEAD',
        message: msg,
        priority: 2,
        requireInteraction: true // #TODO make this a user preference
    });
}

/**
 * Sends a notification to the user, & has answer buttons
 * @param {string} msg the question to display
 */
function sendNotifQuestion(msg) {
    chrome.notifications.create('Notif_Question', { // <= notification ID
        type: 'basic',
        iconUrl: '../images/ironman_clear.png',
        title: '#TODO LOAD FROM CHROME MEMORY INSTEAD',
        message: msg,
        buttons: [{'title': 'Yes'}, {'title': 'No'}],
        priority: 2,
        requireInteraction: true
    });
}

/**
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
        //  that when we call the json() method, a Promise is returned since
        //  the reading of the stream will happen asynchronously
        // thus, response.json() can only be called once!
        response.json().then(f);
    }).then(data => {});
}
