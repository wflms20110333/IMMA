/* Copyright (C) 2020- IMMA Studio, LLC - All Rights Reserved
 * This file is subject to the terms and conditions defined in
 * file 'license.txt', which is part of this source code package.
 * You may not distribute, reproduce, or modify this code without written permission.
 */

// Put own URL in text area
document.getElementById("selfLink").textContent = document.URL;

// Display error if content script not injected (if browserbug is not installed)
// & user is trying to load the browserbug
var loadButton = document.getElementById('char-load');
loadButton.addEventListener('click', alert("The Browserbug extension doesn't seem to be installed :( Try installing it first?"));

/*
// Update heart counts
heartButton = document.getElementById("hearts-up");
fetch(SERVER_URL + "getHearts", { // todo use SERVER_URL constant instead
	method: 'POST',
	headers: {'Content-Type': 'application/json',},
	body: JSON.stringify({"pass in information here": "#TODO"}),
}).then(data => {}).catch(error => {
	console.error(error);
});

// Click to increase heart counts
heartButton.addEventListener('change', function(e) {
    fetch(SERVER_URL + "addHeart", { // todo use SERVER_URL constant instead
		method: 'POST',
		headers: {'Content-Type': 'application/json',},
		body: JSON.stringify({"pass in information here": "to do"}),
	}).then(data => {}).catch(error => {
		console.error(error);
	});
}, false);
*/
