/* Copyright (C) 2020- IMMA Studio, LLC - All Rights Reserved
 * This file is subject to the terms and conditions defined in
 * file 'license.txt', which is part of this source code package.
 * You may not distribute, reproduce, or modify this code without written permission.
 */

var imageSource = "userInput"; // either userInput or localLoaded

// Default messages, split into categories
var Wellness = {
	"Rest your eyes: look at a distant object![ :)]": true,
	"Don't forget to blink and rest your eyes![ ;)]": true,
	"Be sure to rest your eyes![ :)]": true,
	"How long have you been sitting in this position?": true,
	"Time for a quick stretch maybe?[ :)]": true,
	"A quick reminder to sit up straight![ :D]": true,
	"Stay hydrated!": true,
	"Don't forget to drink water![ :)]": true,
	"A reminder to drink some water![ :)]": true,
	"Is now a good time for a break?": true,
	"Don't forget to take a break once in a while!": true
}
var Focus = {
	"Keep it up!": true,
	"You can do this![ :D]": true,
	"You've got this![ :)]": true,
	"Don't give up![ :>]": true,
	"Focus![ :>]": true,
	"Concentrate!": true,
	"Keep going![ :)]": true,
	"Your work is important, keep at it![ :>]": true,
	"Is that productivity I see?[ :O]": true,
	"Don't get distracted![ :>]": true
}
var Kudos = {
	"You've been doing well![ :)]": true,
	"You've been doing a great job![ :D]": true,
	"You've done well![ :O]": true,
	"You've worked hard![ :)]": true,
	"You've leveled up a lot today![ :)]": true,
	"You're getting better![ :)]": true,
	"That looks interesting![ :)]": true,
	"Good job![ :)]": true,
	"Great work![ :D]": true,
	"You're amazing![ XD]": true,
	"I'm cheering you on![ :D]": true
}
var Support = {
	"Take a deep breath and recenter![ :)]": true,
	"Close your eyes for a few seconds: how are you feeling?[ :)]": true,
	"Time for a quick breather? Inhale, and slowly exhale.[ :)]": true,
	"How are you feeling right now?": true,
	"Remember to smile![ :)]": true,
	"Don't forget to think about the big picture![ :)]": true,
	"It's okay to ask for help![ :)]": true,
	"Hope you're doing okay![ :)]": true,
	"Are your muscles tense right now? Relax![ :)]": true
}

// mapping names of categories to the categories
var nameMap = {"Wellness": Wellness, "Focus": Focus, "Kudos": Kudos, "Support": Support}

// a blank browserbug
var blankBbug = {}; // empty object for "New" button
blankBbug.information = {
    name: "",
    imageS3Path: NULL_IMAGE_URL,
    percentCustomQuotes: 0.5
};
blankBbug.defaultBank = {Wellness, Focus, Kudos, Support}; // a full default bank
blankBbug.customBank = {}; // empty custom bank
blankBbug.textstyle = { 'emojis': 0.5, 'capitalization': 0.5, 'punctuation': 0.5 }; // default texting style

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
        document.getElementById(category+'C').checked = true; // keep category box checked until find unchecked child
        for (var key in nameMap[category]) { // populate menu
            // where to place next message
            var iDiv = document.createElement('div');
            iDiv.className = 'quoteBlock';
            iDiv.value = category;
            // Extract any emojis
            var noEmoji = key;
            if (noEmoji.includes('[') && noEmoji.includes(']')) {
                noEmoji = noEmoji.replace(/ *\[[^\]]*]/, '');
            }
            iDiv.textContent = noEmoji;
            iDiv.value = key;
            document.getElementById(category).appendChild(iDiv);

            // creating checkbox element 
                // creating checkbox element 
            // creating checkbox element 
            var checkbox = document.createElement('input'); 
                var checkbox = document.createElement('input'); 
            var checkbox = document.createElement('input'); 
            checkbox.type = "checkbox"; 
                checkbox.type = "checkbox"; 
            checkbox.type = "checkbox"; 
            checkbox.checked = (key in jDat.defaultBank[category]);
            checkbox.className = category+'B';

            // export contents
            iDiv.appendChild(checkbox);

            if (!(key in jDat.defaultBank[category])) {
                // message not selected. thus uncheck the main category box
                document.getElementById(category+'C').checked = false;
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

    dict.defaultBank = {"Wellness": {}, "Focus": {}, "Kudos": {}, "Support": {}};
    $('.quoteBlock').each(function(index, element) { // fill the message bank
        var qCategory = element.children[0].className.slice(0, -1);
        if (element.children[0].checked == true) { // only record if true
            dict.defaultBank[qCategory][element.value] = element.children[0].checked;
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