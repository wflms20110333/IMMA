var loadfunction = window.onload;

window.onload = function(event){
	// Get user id and bbug id (both strings)
	var uid = document.getElementById('char-id').textContent;
	var bbname = document.getElementById('char-name').textContent;
	// Look up this page's corresponding bbug url
	var bbug_path = S3_URL + 'browserbugs/' + uid + '/' + bbname + '.bbug';

	// Load the browserbug
	var bbugData = undefined;
	$.getJSON(bbug_path, "", function(data){
		bbugData = JSON.parse(data);
		
		// On click of "Load into extension button"
		// load that json data into the extension
		var loadButton = document.getElementById('char-load');
		loadButton.addEventListener('click', function() {
			loadCharacterFromJson(bbugData);
			alert(bbname+" activated!");
		});
	
		// Populate message menu
		customValues = {'-1': bbugData['customBank']}
		var allMessages = Object.assign({}, customValues, Object.values(bbugData['defaultBank']));
		// unnest the json
		var unnested = [];
		for (var key in allMessages) {
			for (var nestedkey in allMessages[key]) {
				unnested.push(stylize_string(nestedkey, bbugData['textstyle']));
			}
		}
		// Pick 10 random messages
		const shuffled = unnested.sort(() => 0.5 - Math.random());
		let selected = shuffled.slice(0, 10);
		
		for (var key in selected) { // import messages
			var iDiv = document.createElement('div');
			iDiv.className = 'messageBlock';
			iDiv.innerHTML = selected[key];
			iDiv.style.paddingBottom = "10px";
			document.getElementById('customMessageSpace').appendChild(iDiv);
		}
	})
	
	if(loadfunction) loadfunction(event);
}