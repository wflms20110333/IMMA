/**
 * Returns the current time
 */
function getCurrentTime() {
    var d = new Date;
    return d.getTime();
}

/**
 * Fetches from an endpoint, printing the results to console
 * E.g. fetchResponse('helloWorld') fetches from 'http://127.0.0.1:5000/helloWorld'
 * Assumes the response is in JSON form
 * @param {string} endpoint the endpoint after url (as defined in constants.js)
 */
function fetchResponse(endpoint) {
    console.log('Fetching from ' + endpoint + '...');
    var SERVER_URL = 'http://127.0.0.1:5000/'; // #todo move back to constants.js & fix importing
    fetch(SERVER_URL + endpoint)
        .then(function(response) {
            // the response of a fetch() request is a Stream object, which means
            //  that when we call the json() method, a Promise is returned since
            //  the reading of the stream will happen asynchronously
            // thus, response.json() can only be called once!
            response.json().then(function(data) {
                // prints each key-value pair in teh returned json
                for (var propName in data) {
                    sendNotification(propName + "..." + data[propName]);
                }
            });
        })
        .then(data => {});
}