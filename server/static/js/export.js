/* Copyright (C) 2020- IMMA Studio, LLC - All Rights Reserved
 * This file is subject to the terms and conditions defined in
 * file 'license.txt', which is part of this source code package.
 * You may not distribute, reproduce, or modify this code without written permission.
 */

// Put own URL in text area
document.getElementById("selfLink").textContent = document.URL;

// Link the image
var uid = document.getElementById("maindiv").dataset.uid;
var bbugName = document.getElementById("maindiv").dataset.name;
document.getElementById('char-icon').src = "https://imma-bucket.s3-us-west-2.amazonaws.com/browserbug_images/" + uid + '/' + bbugName + ".png";

// Display error if content script not injected (if browserbug is not installed)
// & user is trying to load the browserbug
var loadButton = document.getElementById('char-load');
//loadButton.addEventListener('click', alert("The Browserbug extension doesn't seem to be installed :( Try installing it first?"));

// Look up the url
var bbug_path = 'https://imma-bucket.s3-us-west-2.amazonaws.com/browserbugs/' + uid + '/' + bbugName + '.bbug';

// Show up to 10 messages of the browserbug
$.getJSON(bbug_path, "", function(data){
	var allMessages = Object.assign({}, data['customBank'], data['defaultBank']);
	// Pick 10 random messages
	const shuffled = Object.keys(allMessages).sort(() => 0.5 - Math.random());
	let selected = shuffled.slice(0, 10);

	for (var key in selected) { // import messages
        var iDiv = document.createElement('div');
		iDiv.className = 'messageBlock';
		iDiv.innerHTML = selected[key];
		iDiv.style.paddingBottom = "10px";
        document.getElementById('customMessageSpace').appendChild(iDiv);
    }
})

/*
// Update heart counts
fetch(SERVER_URL + "getHearts", { // todo use SERVER_URL constant instead
	method: 'POST',
	headers: {'Content-Type': 'application/json',},
	body: JSON.stringify({"pass in information here": "#TODO"}),
}).then(data => {}).catch(error => {
	console.error(error);
});
*/
// Click to increase heart counts
/*
heartButton = document.getElementById("hearts-up");
heartButton.addEventListener('click', function(e) {
	alert("Hearts not implemented yet)");
    /*fetch(SERVER_URL + "addHeart", { // todo use SERVER_URL constant instead
		method: 'POST',
		headers: {'Content-Type': 'application/json',},
		body: JSON.stringify({"pass in information here": "to do"}),
	}).then(data => {}).catch(error => {
		console.error(error);
	});
}, false);*/
