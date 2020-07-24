var imageSource = "userInput"; // either userInput or localLoaded


var blankBbug = { 'personality': [0.0, 0.0, 0.0], 'messageBank': {} }; // empty object for "New" button
blankBbug.information = {
    name: "",
    imageS3Path: NULL_IMAGE_URL,
    percentCustomQuotes: 0.5
};
blankBbug.textstyle = { 'emojis': 0.5, 'capitalization': 0.5, 'punctuation': 0.5 };

$(document).ready(function() {
    // Initialize studio with the current bug
    absorbMemoryToDict(openJsonDat);

    $('.urlButton').each(function(index, element) { // link image-updating buttons
        $(this).click(function() {
            var urlBoxId = this.id + "-url";
            var newImgUrl = document.getElementById(urlBoxId).value;
            var imgBoxId = this.id + "-img";
            document.getElementById(imgBoxId).src = newImgUrl;
        });
    });

    $("#new").click(function() { // reload page
        if (confirm("Start from scratch?")) {
            openJsonDat(blankBbug);
        }
    });

    $("#add").click(function() { // process for creating custom messages
        // where to place next message
        var iDiv = document.createElement('div');
        iDiv.className = 'messageBlock';
        document.getElementById('yourform').appendChild(iDiv);
        // get contents
        var flabel = document.getElementById('messagecontent').value;
        var fstat1 = document.getElementById('msgstat1').value;
        var fstat2 = document.getElementById('msgstat2').value;
        var fstat3 = document.getElementById('msgstat3').value;
        // clear contents
        document.getElementById('messagecontent').value = "";
        document.getElementById('msgstat1').value = 0;
        document.getElementById('msgstat2').value = 0;
        document.getElementById('msgstat3').value = 0;
        m1Update();
        m2Update();
        m3Update();
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

        removeButton.onclick = function() {
            $(this).parent().remove();
        };
        // export contents
        iDiv.value = [flabel, [fstat1, fstat2, fstat3]];
        iDiv.innerHTML = (flabel + " (stats = " + fstat1 + ", " + fstat2 + ", " + fstat3 + ") ");
        iDiv.appendChild(removeButton);

    });

    // process for importing imma files
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

    /*<!-- Old URL picker for images -->
    <!-- <input type="text" id="im0-url" class="imgUrlBox" autocomplete="off"><button id="im0" class="urlButton">+</button> -->
    <label for="open" class="custom-file-upload">Pick image</label>
    <input name="uploaded-img" type="file" id="openImg" accept="image/*"></input>*/

    // process for importing images
    var imgSelected = document.getElementById('openImg');
    imgSelected.addEventListener('change', function(e) { // an image is uploaded!!
        imageSource = "userInput";
        var imgx = document.getElementById('im0-img');
        imgx.src = URL.createObjectURL(this.files[0]);
    }, false);

    // process for activating imma files
    $("#activate").click(function() {
        // allowExternalURLs();
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

    // process for exporting imma files (local download)
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
                var a = document.getElementById('export');
                a.href = url;
                a.download = document.getElementById('imma-name').value + ".bbug";
            });
        }
    });

    // process for uploading imma files (to server)
    $("#uploadBbug").click(function() {
        // need to have these fields filled before save
        if (document.getElementById('imma-name').value == "") {
            alert("Don't forget to select a name for your Browserbug!");
        } else {
            exportBbug(true, function(jsonDict) {
                var j_uid = jsonDict['information']['uid'];
                var j_name = jsonDict['information']['name'];
                var j_url = encodeURIComponent(jsonDict['information']['imageS3Path']);
                var bbugPath = SERVER_URL + "getBbugFile?uid=" + j_uid + "&character_name=" + j_name + "&imgurl=" + j_url;
                window.open(bbugPath);
            });
        }
    });
});

$(window).bind('beforeunload', function() { // warns users of an unsaved model
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

function allowExternalURLs() {
    chrome.permissions.request({
        permissions: [] // #TODO work out optional image permissions, right now is required anyway? & only works for certain pictures!
    }, function(granted) {
        // The callback argument will be true if the user granted the permissions.
        if (granted == false) {
            alert("Please enable web permissions to use online image files");
        }
    });
}

function openJsonDat(jDat) {
    // load normal stuff
    document.getElementById('imma-name').value = jDat.information.name;
    document.getElementById('im0-img').src = jDat.information.imageS3Path;
    document.getElementById('percentCustom').value = jDat.information.percentCustomQuotes;
    document.getElementById('personality1').value = jDat.personality[0]; // big #TODO, need to actually use personality
    document.getElementById('personality2').value = jDat.personality[1];
    document.getElementById('personality3').value = jDat.personality[2];
    document.getElementById('tsSlider1').value = jDat.textstyle.emojis;
    document.getElementById('tsSlider2').value = jDat.textstyle.capitalization;
    document.getElementById('tsSlider3').value = jDat.textstyle.punctuation;
    $(".messageBlock").remove(); // clear messages
    for (var key in jDat.messageBank) { // import messages
        // where to place next message
        var iDiv = document.createElement('div');
        iDiv.className = 'messageBlock';
        document.getElementById('yourform').appendChild(iDiv);

        // create remove button
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
        removeButton.onclick = function() {
            $(this).parent().remove();
        };

        var flabel = key;
        var fstats = jDat.messageBank[key];

        // export contents
        iDiv.value = [flabel, fstats];
        iDiv.innerHTML = (flabel + " (stats = " + fstats[0] + ", " + fstats[1] + ", " + fstats[2] + ") ");
        iDiv.appendChild(removeButton);
    }

    // Text for sliders! Update on initialization
    emojiUpdate();
    capsUpdate();
    punctUpdate();
    ccRatioUpdate();
    //p1Update();
    //p2Update();
    //p3Update();
    e1Update();
    e2Update();
    e3Update();
    m1Update();
    m2Update();
    m3Update();
}

function absorbToDict() {
    var dict = {}; // empty object to fill then export

    dict.information = {
        name: document.getElementById('imma-name').value,
        premade: false,
        percentCustomQuotes: document.getElementById('percentCustom').value
    };

    dict.personality = [document.getElementById('personality1').value, document.getElementById('personality2').value, document.getElementById('personality3').value];

    dict.textstyle = {
        emojis: document.getElementById('tsSlider1').value,
        capitalization: document.getElementById('tsSlider2').value,
        punctuation: document.getElementById('tsSlider3').value
    };
    dict.messageBank = {};
    $('.messageBlock').each(function(index, element) { // fill the message bank
        var messageName = element.value[0];
        dict.messageBank[messageName] = element.value[1];
    });

    return dict;
}

function absorbMemoryToDict(callback) {
    chrome.storage.sync.get(['imma_name', 'image_link', 'custom_ratio', 'message_bank', 'textingstyle', 'personality'], function(result) {
        var dict = {}; // empty object to fill then export

        dict.information = {
            name: result['imma_name'],
            imageS3Path: result['image_link'],
            percentCustomQuotes: result['custom_ratio']
        };

        dict.personality = result['personality'];

        dict.textstyle = result['textingstyle'];
        dict.messageBank = result['message_bank'];

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
            uploadFile(JSON.stringify(jsonDict), bbug_path);
        }
        f(jsonDict);
    });
}

// Update on change
document.getElementById('tsSlider1').oninput = function() { emojiUpdate();
    e1Update(); }
document.getElementById('tsSlider2').oninput = function() { capsUpdate();
    e2Update(); }
document.getElementById('tsSlider3').oninput = function() { punctUpdate();
    e3Update(); }
document.getElementById('percentCustom').oninput = function() { ccRatioUpdate(); }
    //document.getElementById('personality1').oninput = function() { p1Update(); }
    //document.getElementById('personality2').oninput = function() { p2Update(); }
    //document.getElementById('personality3').oninput = function() { p3Update(); }
document.getElementById('msgstat1').oninput = function() { m1Update(); }
document.getElementById('msgstat2').oninput = function() { m2Update(); }
document.getElementById('msgstat3').oninput = function() { m3Update(); }

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

function p1Update() { document.getElementById('plabel1').textContent = document.getElementById('personality1').value; }

function p2Update() { document.getElementById('plabel2').textContent = document.getElementById('personality2').value; }

function p3Update() { document.getElementById('plabel3').textContent = document.getElementById('personality3').value; }

function e1Update() { document.getElementById('etext1').textContent = document.getElementById('tsSlider1').value; }

function e2Update() { document.getElementById('etext2').textContent = document.getElementById('tsSlider2').value; }

function e3Update() { document.getElementById('etext3').textContent = document.getElementById('tsSlider3').value; }

function m1Update() { document.getElementById('mtext1').textContent = document.getElementById('msgstat1').value; }

function m2Update() { document.getElementById('mtext2').textContent = document.getElementById('msgstat2').value; }

function m3Update() { document.getElementById('mtext3').textContent = document.getElementById('msgstat3').value; }

function ccRatioUpdate() {
    var scaleValue = Math.round(100 * document.getElementById('percentCustom').value);
    document.getElementById('cc-left-text').textContent = scaleValue;
    document.getElementById('cc-right-text').textContent = 100 - scaleValue;
}