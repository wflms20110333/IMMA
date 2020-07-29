// On click of "Load into extension button"
// Obtains user id and bbug id
// Using that to load the browserbug json data from URL
// And then load that json data into the extension

var loadButton = document.getElementById('char-load');
loadButton.removeEventListener('click', alert); // Remove the default error message
loadButton.addEventListener('click', function() {
	// Get user id and bbug id (both strings)
	var uid = document.getElementById('char-id').textContent;
	var bbname = document.getElementById('char-name').textContent;
	// Look up the url
	var bbug_path = S3_URL + 'browserbugs/' + uid + '/' + bbname + '.bbug';
	// Load the browserbug into the extension
	$.getJSON(bbug_path, "", function(data){
		loadCharacterFromJson(data);
		alert(bbname+" activated!");
	})
});
