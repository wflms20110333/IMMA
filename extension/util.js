/**
 * Returns the current time
 */
function getCurrentTime() {
    var d = new Date;
    return d.getTime();
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