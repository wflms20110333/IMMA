// Put own URL in text area
document.getElementById("selfLink").textContent = document.URL;

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
