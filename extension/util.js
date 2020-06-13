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
    var tabInfo = {"hist_for_init":["goo","fb","okok","fb","fb","goo","fb"],"current_tabs":[]};

    var queryInfo = { currentWindow: true }; // query parameters for finding tabs

    chrome.tabs.query(queryInfo, (tabs) => {
        for (var tabIndex in tabs) {
            var tabUrl = tabs[tabIndex]['url'];
            // Remove "http", keep only up to 2nd /, get rid of any ? arguments, limit to 100 characters
            tabUrl = tabUrl.split("//")[1].split("/", 2).join("/").split("?", 1)[0].substring(0, 100);
            tabInfo["current_tabs"].push(tabUrl);
        }
        callback(tabInfo);
    });
}

/**
 * Calls serverPOST to send a notification based on the current state
 * @param {Object} currentTabs the current tabs open
 */
function pickMessage(currentTabs) {
    console.log('in evaluateState');
    var data = serverPOST('evaluateState', currentTabs, function(data) {
        sendNotification('../images/ironman_clear.PNG', data["message"]);
    });
}

/**
 * Sends a placeholder notification (need to turn off focus mode to see pop-up)
 * @param {string} iconPath the relative path to the icon to display
 * @param {string} msg the message to display
 */
function sendNotification(iconPath, msg) {
    chrome.notifications.create('mozzarella', {
        type: 'basic',
        iconUrl: iconPath,
        title: 'this imma says',
        message: msg,
        //buttons: [{'title': 'yas'}, {'title': 'nah'}],
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
    var SERVER_URL = 'http://127.0.0.1:5000/'; // copied over since still invisible? #todo fix
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
 */
function serverPOST(endpoint, inputObject, f) {
    console.log('Fetching from ' + endpoint + '...');
    var SERVER_URL = 'http://127.0.0.1:5000/'; // copied over since still invisible? #todo fix
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
