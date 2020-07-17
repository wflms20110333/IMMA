$(document).ready(function() {
    $('.urlButton').each(function(index, element) { // link image-updating buttons
        $(this).click(function() {
            var urlBoxId = this.id + "-url";
            var newImgUrl = document.getElementById(urlBoxId).value;
            var imgBoxId = this.id + "-img";
            document.getElementById(imgBoxId).src = newImgUrl;
        });
    });

    $("#new").click(function() { // reload page
        location.reload();
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
        var removeButton = document.createElement('button');
        removeButton.class = 'removeButton';
        removeButton.innerHTML = 'Remove';
        removeButton.style.background = "#c18ced38";
        removeButton.style.fontFamily = ['Assistant', 'Segoe UI', 'sans-serif'];
        removeButton.style.fontSize = '13px';
        removeButton.style.borderRadius = '5px';
        removeButton.style.boxShadow = '1px 1px 1px rgba(0, 0, 0, 0.10)';
        removeButton.style.border = 'none';

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
        var imgx = document.getElementById('im0-img');
        imgx.src = URL.createObjectURL(this.files[0]);
    }, false);

    // process for activating imma files
    $("#activate").click(function() {
        //allowExternalURLs();
        // need to have these fields filled before save
        if (document.getElementById('imma-name').value == "") {
            alert("Don't forget to select a name for your Browserbug!")
        } else {
            var jsonDict = absorbToDict();
            loadCharacterFromJson(jsonDict);
            alert(document.getElementById('imma-name').value + " has been activated!")
        }
    });

    // process for exporting imma files (local download)
    $("#export").click(function() {
        // need to have these fields filled before save
        if (document.getElementById('imma-name').value == "") {
            alert("Don't forget to select a name for your Browserbug!")
        } else {
            var jsonDict = absorbToDict();
            var file = new Blob([jsonDict], {
                type: "application/json"
            });
            url = URL.createObjectURL(file);
            var a = document.getElementById('export');
            a.href = url;
            a.download = document.getElementById('imma-name').value + ".bbug";
        }
    });

    // process for exporting imma files (to server)
    $("#uploadBbug").click(function() {
        // need to have these fields filled before save
        if (document.getElementById('imma-name').value == "") {
            alert("Don't forget to select a name for your Browserbug!")
        } else {
            chrome.storage.sync.get(['user_bbug_id'], function(result) { // get user id and pass to server
                result = JSON.parse(JSON.stringify(result)); // weird workaround since result is naturally "Object", not dictionary
                var character_name = document.getElementById('imma-name').value;
                // upload image
                var image_file = document.getElementById('openImg').files[0];
                var image_path = "default";
                if (image_file != null) {
                    var image_file_extension = image_file.name.split('.').pop();
                    image_path = 'browserbug_images/' + result['user_bbug_id'] + '/' + character_name + '.' + image_file_extension;
                    uploadFile(image_file, image_path); // TODO: catch errors?
                }
                // upload bbug
                var bbug_path = 'browserbugs/' + result['user_bbug_id'] + '/' + character_name + '.bbug';
                var jsonDict = absorbToDict(character_name, image_path); // collect the customized browserbug
                uploadFile(jsonDict, bbug_path);
                //
                // result['bbug_data'] = jsonDict;
                // //alert(result);
                // serverPOST('uploadBbug', result, function(data) {
                //     //alert(data);
                //     console.log("debug ok");
                // });
            });
        }
    });
});

$(window).bind('beforeunload', function() { // warns users of an unsaved model
    return 'Are you sure you want to leave?';
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
    document.getElementById('im0-img').src = jDat.information.imageLink;
    document.getElementById('percentCustom').value = jDat.information.percentCustomQuotes;
    document.getElementById('personality1').value = jDat.personality[0];
    document.getElementById('personality2').value = jDat.personality[1];
    document.getElementById('personality3').value = jDat.personality[2];
    document.getElementById('style1').value = jDat.personality.emojis;
    document.getElementById('style2').value = jDat.personality.capitalization;
    document.getElementById('style3').value = jDat.personality.punctuation;
    $(".messageBlock").remove(); // clear messages
    for (var key in jDat.messageBank) { // import messages
        // where to place next message
        var iDiv = document.createElement('div');
        iDiv.className = 'messageBlock';
        document.getElementById('yourform').appendChild(iDiv);

        // create remove button
        var removeButton = document.createElement('button');
        removeButton.class = 'remove';
        removeButton.innerHTML = 'Remove';
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
}

function absorbToDict(character_name, image_path) {
    var dict = {}; // empty object to fill then export

    dict.information = {
        name: character_name,
        premade: false,
        imageLink: document.getElementById('im0-img').src,
        imageS3Path: image_path,
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

    // next, actually export the file
    var jsonDict = JSON.stringify(dict);
    return jsonDict;
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

// Texting style slider stuff!
chrome.storage.sync.get(['textingstyle'], function(result) { // on initialization
    document.getElementById('tsSlider1').value = result['textingstyle']['emojis'];
    document.getElementById('tsSlider2').value = result['textingstyle']['capitalization'];
    document.getElementById('tsSlider3').value = result['textingstyle']['punctuation'];
});

// Update on initialization
emojiUpdate();
capsUpdate();
punctUpdate();

// Update on change
document.getElementById('tsSlider1').oninput = function() { emojiUpdate(); }
document.getElementById('tsSlider2').oninput = function() { capsUpdate(); }
document.getElementById('tsSlider3').oninput = function() { punctUpdate(); }

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