$(document).ready(function() {
    countSlotsAvail();
    populateBrowserbugs();

    $("#enteractivation").click(function() { // link purchases
        checkCode();
    });
});

// Redeem premium code
function checkCode() {
    chrome.storage.sync.get(['user_bbug_id'], function(result) {
        result['code'] = document.getElementById("activationcode").value;
        serverPOST('checkCode', result, function(data) {
            if (data['result'] == 'validCode') {
                chrome.storage.sync.set({ 'user_level': parseInt(data['number']) });
                alert("code entry successful! refresh to apply changes.");
            } else {
                alert("invalid code :(");
            }
        });
    });
}

// Show slots available
function countSlotsAvail() {
    chrome.storage.sync.get(['user_level'], function(result) {
        document.getElementById("bbugs-avail").textContent = result['user_level'];
    });
}

// Update list of browserbugs
function populateBrowserbugs() {
    chrome.storage.sync.get(['user_bbug_id'], function(result) {
        // update user id listed
        document.getElementById("uid-fill").textContent = result['user_bbug_id'].substring(0, 10);

        var getData = { 'uid': result['user_bbug_id'] };
        serverPOST('getListOfUserFiles', getData, function(data) {
            // Update number of slots used
            var numBbugs = Object.keys(data['characters']).length;
            document.getElementById("bbugs-used").textContent = numBbugs;
            // Add browserbugs to divs
            for (const [key, value] of Object.entries(data['characters'])) {
                var div = document.createElement("div");
                div.setAttribute('class', 'bbug-entry');

                var imgSpan = document.createElement('img');
                imgSpan.src = S3_URL + "browserbug_images/" + result['user_bbug_id'] + '/' + key + '.png'; // path to image
                div.appendChild(imgSpan);
                var nameSpan = document.createElement('span');
                nameSpan.textContent = key;
                nameSpan.setAttribute('class', 'namer');
                div.appendChild(nameSpan);
                var activeSpan = document.createElement('span');
                activeSpan.textContent = "Activate";
                activeSpan.setAttribute('class', 'activator');
                activeSpan.onclick = function() {
                    $.getJSON(value, "", function(data) {
                        loadCharacterFromJson(data);
                        alert(key + " activated!");
                    })
                }
                div.appendChild(activeSpan);
                var removeSpan = document.createElement('span');
                removeSpan.textContent = "Delete";
                removeSpan.setAttribute('class', 'remover');
                removeSpan.onclick = function() {
                    var removeData = { 'uid': result['user_bbug_id'], 'bbugname': key };
                    serverPOST('removeBug', removeData, function(data) {
                        if (data['result'] == 'success') {
                            location.reload();
                        } else {
                            alert("failed to delete bug");
                        }
                    });
                }
                div.appendChild(removeSpan);
                var viewSpan = document.createElement('span');
                viewSpan.textContent = "View";
                viewSpan.setAttribute('class', 'viewer');
                viewSpan.onclick = function() {
                    var j_uid = result['user_bbug_id'];
                    var j_name = key;
                    var j_url = encodeURIComponent(value);
                    var bbugPath = SERVER_URL + "getBbugFile?uid=" + j_uid + "&character_name=" + j_name + "&imgurl=" + j_url;
                    window.open(bbugPath);
                }
                div.appendChild(viewSpan);

                $('#bbug-list').append(div);
                console.log(key, value);
            }
        }, timeoutMs=2000);
    });
}