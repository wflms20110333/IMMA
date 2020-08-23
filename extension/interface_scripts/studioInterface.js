/* Copyright (C) 2020- IMMA Studio, LLC - All Rights Reserved
 * This file is subject to the terms and conditions defined in
 * file 'license.txt', which is part of this source code package.
 * You may not distribute, reproduce, or modify this code without written permission.
 */

var imageSource = "userInput"; // either userInput or localLoaded

$(document).ready(function() {
    // Customizing fonts to language
    chrome.storage.sync.get(['user_lang'], function (result) {
        if (result['user_lang'] == 'es') {
            document.querySelectorAll("h1, h2, h3, .question, input").forEach(el => {
                el.style.fontFamily = 'Gochi Hand', 'Segoe UI', 'sans-serif'; // spanish: Mansalva
                el.style.fontWeight = 400;
            });
        } else if (result['user_lang'] == 'zh') {
            document.querySelectorAll(".i18n-txt").forEach(el => {
                el.style.fontFamily = 'Noto Sans SC', 'Segoe UI', 'sans-serif'; // chinese: Noto Sans SC
                el.style.fontWeight = 400;
            });
            document.querySelectorAll(".chn25px").forEach(el => { el.style.fontSize = 25; });
            document.querySelectorAll(".chn20px").forEach(el => { el.style.fontSize = 20; });
        }
    });

    // Initialize studio with the current bug
    absorbMemoryToDict(openJsonDat);

    // Reload page
    $("#new").click(function() {
        if (confirm("Start from scratch?")) {
            openJsonDat(blankBbug);
        }
    });

    // Add custom message
    $("#add").click(function() {
        // place the next message
        var iDiv = document.createElement('div');
        iDiv.className = 'messageBlock';
        document.getElementById('yourform').appendChild(iDiv);

        // get contents then clear contents
        iDiv.innerHTML = document.getElementById('messagecontent').value;
        iDiv.value = document.getElementById('messagecontent').value;
        document.getElementById('messagecontent').value = "";

        // add remove button
        var removeButton = document.createElement('button');
        removeButton.class = 'removeButton';
        removeButton.innerHTML = 'Remove';
        removeButton.style.background = "white";
        removeButton.style.fontFamily = ['Assistant', 'Segoe UI', 'sans-serif'];
        removeButton.style.fontSize = '13px';
        removeButton.style.color = 'black';
        removeButton.style.borderRadius = '5px';
        removeButton.style.border = 'none';
        removeButton.style.marginBottom = '5px';
        removeButton.onclick = function() { $(this).parent().remove(); };
        iDiv.appendChild(removeButton);
    });

    // Open local BBug file
    var fileSelected = document.getElementById('openBbug');
    fileSelected.addEventListener('change', function(e) {
        var fileTobeRead = fileSelected.files[0];
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
            imageSource = "localLoaded";
            openJsonDat(JSON.parse(fileReader.result));
        }
        fileReader.readAsText(fileTobeRead);
    }, false);

    // Control image uploader button
    var imgSelected = document.getElementById('openImg');
    imgSelected.addEventListener('change', function(e) { // an image is uploaded!!
        imageSource = "userInput";
        var imgx = document.getElementById('im0-img'); // find image previewer
        imgx.src = URL.createObjectURL(this.files[0]);
    }, false);

    // Activate BBug
    $("#activate").click(function() {
        // need to have these fields filled before save
        if (document.getElementById('imma-name').value == "") {
            alert("Don't forget to select a name for your Browserbug!");
        } else {
            exportBbug(false, function(jsonDict) {
                loadCharacterFromJson(jsonDict);
                alert(document.getElementById('imma-name').value + " has been activated!");
            });
        }
    });

    // Locally download BBug file
    $("#export").click(function() {
        // need to have these fields filled before save
        if (document.getElementById('imma-name').value == "") {
            alert("Don't forget to select a name for your Browserbug!");
        } else {
            exportBbug(false, function(jsonDict) {
                var strJson = JSON.stringify(jsonDict);
                var file = new Blob([strJson], {
                    type: "application/json"
                });
                url = URL.createObjectURL(file);
                var a = document.getElementById('exporter');
                a.href = url;
                a.download = document.getElementById('imma-name').value + ".bbug";
                a.click();
            });
        }
    });

    // Upload BBug file to server
    $("#uploadBbug").click(function() {
        // need to have these fields filled before save
        if (document.getElementById('imma-name').value == "") {
            alert("Don't forget to select a name for your Browserbug!");
        } else {
            chrome.storage.sync.get(['user_bbug_id', 'user_level'], function(result) {
                var getData = { 'uid': result['user_bbug_id'] };
                serverPOST('getListOfUserFiles', getData, function(data) {
                    // Get number of bbugs already made
                    var numBbugs = Object.keys(data['characters']).length;
                    
                    var openAccount = false;

                    if (numBbugs >= parseInt(result['user_level'])) {
                        openAccount = confirm("You don't have enough save slots left! Check your account?");
                    } else {
                        exportBbug(true, function(jsonDict) {
                            var j_uid = jsonDict['information']['uid'];
                            var j_name = jsonDict['information']['name'];
                            var bbugPath = SERVER_URL + "getBbugFile?uid=" + j_uid + "&character_name=" + j_name;
                            window.open(bbugPath);
                        });
                    }

                    if (openAccount == true) { // open new tab to see browserbugs
                        window.open("http://imma.studio/browserbug/my_bbugs/", "blank");
                    }
                });
            });
        }
    });
});

// Warning before leaving studio
$(window).bind('beforeunload', function() {
    return 'Are you sure you want to leave?';
});

// When adding a message, pressing enter key clicks the #add button
document.getElementById("messagecontent").addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("add").click();
    }
});

function openJsonDat(jDat) {
    // load normal stuff
    document.getElementById('imma-name').value = jDat.information.name;
    document.getElementById('im0-img').src = jDat.information.imageS3Path;
    
    document.getElementById('tsSlider1').value = jDat.textstyle.emojis;
    document.getElementById('tsSlider2').value = jDat.textstyle.capitalization;
    document.getElementById('tsSlider3').value = jDat.textstyle.punctuation;

    // Manage default messages
    // Initially clear & hide all category menus, but populate each with content
	for (var category in jDat.defaultBank) {
        document.getElementById(category).innerHTML = "";
        document.getElementById(category).style.display = "none";
        for (var key in jDat.defaultBank[category]) { // populate menu
            if (jDat.defaultBank[category][key] == true) {
                // where to place next message
                var iDiv = document.createElement('div');
                iDiv.className = 'quoteBlock';
                iDiv.value = category;
                iDiv.textContent = key;
                document.getElementById(category).appendChild(iDiv);

                // creating checkbox element 
                var checkbox = document.createElement('input'); 
                checkbox.type = "checkbox"; 
                checkbox.checked = true;
                checkbox.className = category+'B';

                // export contents
                iDiv.appendChild(checkbox);
            }
		}
    }
    
    // Manage custom messages
    $(".messageBlock").remove(); // clear messages
    document.getElementById('percentCustom').value = jDat.information.percentCustomQuotes;
    for (var key in jDat.customBank) { // import messages
        // where to place next message
        var iDiv = document.createElement('div');
        iDiv.className = 'messageBlock';
        document.getElementById('yourform').appendChild(iDiv);

        // create remove button
        var removeButton = document.createElement('button');
        removeButton.class = 'removeButton'; removeButton.innerHTML = 'Remove';
        removeButton.style.background = "white"; removeButton.style.fontFamily = ['Assistant', 'Segoe UI', 'sans-serif'];
        removeButton.style.fontSize = '13px'; removeButton.style.color = 'black';
        removeButton.style.borderRadius = '5px'; removeButton.style.border = 'none';
        removeButton.style.marginBottom = '5px'; removeButton.onclick = function() { $(this).parent().remove(); };

        // export contents
        iDiv.innerHTML = key;
        iDiv.value = key;
        iDiv.appendChild(removeButton);
    }

    // Text for sliders! Update on initialization
    emojiUpdate(); e1Update();
    capsUpdate(); e2Update();
    punctUpdate(); e3Update();
    ccRatioUpdate();
}

function absorbToDict() {
    var dict = {}; // empty object to fill then export

    dict.information = {
        name: document.getElementById('imma-name').value,
        premade: false,
        percentCustomQuotes: document.getElementById('percentCustom').value
    };

    dict.defaultBank = {"Vision": {}, "Posture": {}, "Care": {}, "Focus": {}, "Hydration": {}, "Support": {}};
    $('.quoteBlock').each(function(index, element) { // fill the message bank
        var qCategory = element.children[0].className.slice(0, -1);
        if (element.children[0].checked == true) { // only record if true
            dict.defaultBank[qCategory][element.textContent] = element.children[0].checked;
        }
    });

    dict.textstyle = {
        emojis: document.getElementById('tsSlider1').value,
        capitalization: document.getElementById('tsSlider2').value,
        punctuation: document.getElementById('tsSlider3').value
    };

    dict.customBank = {};
    $('.messageBlock').each(function(index, element) { // fill the message bank
        dict.customBank[element.value] = true;
    });

    return dict;
}

function absorbMemoryToDict(callback) {
    chrome.storage.sync.get(['imma_name', 'image_link', 'custom_ratio', 'default_bank', 'custom_bank', 'textingstyle'], function(result) {
        var dict = {}; // empty object to fill then export

        dict.information = {
            name: result['imma_name'],
            imageS3Path: result['image_link'],
            percentCustomQuotes: result['custom_ratio']
        };
        dict.defaultBank = result['default_bank'];
        dict.textstyle = result['textingstyle'];
        dict.customBank = result['custom_bank'];

        callback(dict);
    });
}

function uploadFile(file, path) {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    fetch(SERVER_URL + '/uploadFile', {
        method: 'POST',
        body: formData,
    }).then(function(response) {
        response.json();
    }).then(data => {}).catch(error => {
        console.error(error);
    });
}

function exportBbug(saveToServer, f = function(jsonDict) {}) {
    console.log('in exportBbug');
    // need to have these fields filled before save
    if (document.getElementById('imma-name').value == "") {
        alert("Don't forget to select a name for your Browserbug!");
        return;
    }
    chrome.storage.sync.get(['user_bbug_id'], function(result) { // get user id and pass to server
        var uid = JSON.parse(JSON.stringify(result))['user_bbug_id']; // weird workaround since result is naturally "Object", not dictionary
        var jsonDict = absorbToDict(); // collect the customized browserbug
        var character_name = jsonDict['information']['name'];

        // upload image
        var image_file = document.getElementById('openImg').files[0];
        var image_path = "default";
        if (imageSource == "userInput" && image_file != null) {
            image_path = 'browserbug_images/' + uid + '/' + character_name + '.png';
            uploadFile(image_file, image_path); // TODO: catch errors?
            image_path = S3_URL + image_path;
        } else { // localLoaded
            image_path = document.getElementById('im0-img').src;
        }

        // update values
        jsonDict['information']['imageS3Path'] = image_path;
        jsonDict['information']['uid'] = uid;
        // upload bbug
        var bbug_path = 'browserbugs/' + uid + '/' + character_name + '.bbug';
        if (saveToServer == true) {
            jsonDict["dateMade"] = new Date().toLocaleDateString();
            jsonDict["timeStamp"] = new Date().toUTCString();
            jsonDict["hearts"] = 0;
            uploadFile(JSON.stringify(jsonDict), bbug_path);
        }
        f(jsonDict);
    });
}

// Update on change
document.getElementById('tsSlider1').oninput = function() {
    emojiUpdate();
    e1Update();
}
document.getElementById('tsSlider2').oninput = function() {
    capsUpdate();
    e2Update();
}
document.getElementById('tsSlider3').oninput = function() {
    punctUpdate();
    e3Update();
}
document.getElementById('percentCustom').oninput = function() { ccRatioUpdate(); }

function emojiUpdate() {
    var scaleValue = document.getElementById('tsSlider1').value;
    if (scaleValue < 0.05) { document.getElementById('tsLabel1').textContent = "No emojis"; } else if (scaleValue < 0.33) { document.getElementById('tsLabel1').textContent = "Low likelihood of emojis"; } else if (scaleValue < 0.67) { document.getElementById('tsLabel1').textContent = "Medium likelihood of emojis"; } else if (scaleValue < 0.95) { document.getElementById('tsLabel1').textContent = "High likelihood of emojis :)"; } else { document.getElementById('tsLabel1').textContent = "So many emojis! XD"; }
}

function capsUpdate() {
    var scaleValue = document.getElementById('tsSlider2').value;
    if (scaleValue < 0.3) { document.getElementById('tsLabel2').textContent = "no capitalization"; } else if (scaleValue < 0.8) { document.getElementById('tsLabel2').textContent = "Normal capitalization"; } else { document.getElementById('tsLabel2').textContent = "ALWAYS CAPITALIZATION"; }
}

function punctUpdate() {
    var scaleValue = document.getElementById('tsSlider3').value;
    if (scaleValue < 0.3) { document.getElementById('tsLabel3').textContent = "No punctuation"; } else if (scaleValue <= 0.5) { document.getElementById('tsLabel3').textContent = "Normal punctuation!"; } else if (scaleValue <= 0.9) { document.getElementById('tsLabel3').textContent = "More punctuation!!"; } else { document.getElementById('tsLabel3').textContent = "Unnecessary punctuation!!!!"; }
}

function e1Update() { document.getElementById('etext1').textContent = document.getElementById('tsSlider1').value; }

function e2Update() { document.getElementById('etext2').textContent = document.getElementById('tsSlider2').value; }

function e3Update() { document.getElementById('etext3').textContent = document.getElementById('tsSlider3').value; }

function ccRatioUpdate() {
    var scaleValue = Math.round(100 * document.getElementById('percentCustom').value);
    document.getElementById('cc-left-text').textContent = scaleValue;
    document.getElementById('cc-right-text').textContent = 100 - scaleValue;
}