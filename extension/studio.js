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
        var fstat4 = document.getElementById('msgstat4').value;
        var fstat5 = document.getElementById('msgstat5').value;
        // clear contents
        document.getElementById('messagecontent').value = "";
        document.getElementById('msgstat1').value = 0;
        document.getElementById('msgstat2').value = 0;
        document.getElementById('msgstat3').value = 0;
        document.getElementById('msgstat4').value = 0;
        document.getElementById('msgstat5').value = 0;
        // create remove button
        var removeButton = document.createElement('button');
        removeButton.class = 'remove';
        removeButton.innerHTML = 'Remove';
        removeButton.onclick = function() {
            $(this).parent().remove();
        };
        // export contents
        iDiv.value = [flabel, [fstat1, fstat2, fstat3, fstat4, fstat5]];
        iDiv.innerHTML = (flabel + " (stats = " + fstat1 + ", " + fstat2 + ", " + fstat3 + ", " + fstat4 + ", " + fstat5 + ") ");
        iDiv.appendChild(removeButton);
    });

    // process for importing imma files
    var fileSelected = document.getElementById('open');
    fileSelected.addEventListener('change', function(e) {
        var fileTobeRead = fileSelected.files[0];
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
            openJsonDat(JSON.parse(fileReader.result));
        }
        fileReader.readAsText(fileTobeRead);
    }, false);

    // process for exporting imma files
    $("#save").click(function() {
        //allowExternalURLs();
        // need to have these fields filled before save
        if (document.getElementById('imma-name').value == "") {
            alert("Don't forget to select a name for your Browserbug!")
        } else if (document.getElementById('im0-url').value == "") {
            alert("Don't forget to select an avatar for your Browserbug!")
        } else {
            var jsonDict = absorbToDict();
            loadCharacterFromJson(jsonDict);
            alert(document.getElementById('imma-name').value + " has been activated!")
        }
    });

    // process for exporting imma files
    $("#export").click(function() {
        // need to have these fields filled before save
        if (document.getElementById('imma-name').value == "") {
            alert("Don't forget to select a name for your Browserbug!")
        } else if (document.getElementById('im0-url').value == "") {
            alert("Don't forget to select an avatar for your Browserbug!")
        } else {
            var jsonDict = absorbToDict();
            var file = new Blob([jsonDict], {
                type: "application/json"
            });
            url = URL.createObjectURL(file);
            var a = document.getElementById('export');
            a.href = url;
            a.download = document.getElementById('imma-name').value + ".brbug";
        }
    });

    $('#uid').val(getUID());
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
    document.getElementById('im0-url').value = jDat.information.imageLink;
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
        iDiv.innerHTML = (flabel + " (stats = " + fstats[0] + ", " + fstats[1] + ", " + fstats[2] + ", " + fstats[3] + ", " + fstats[4] + ") ");
        iDiv.appendChild(removeButton);
    }
}

function absorbToDict() {
    var dict = {}; // empty object to fill then export
    dict.information = {
        name: document.getElementById('imma-name').value,
        premade: false,
        imageLink: document.getElementById('im0-url').value,
        percentCustomQuotes: document.getElementById('percentCustom').value
    };

    dict.personality = [document.getElementById('personality1').value, document.getElementById('personality2').value, document.getElementById('personality3').value];

    dict.textstyle = {
        emojis: document.getElementById('style1').value,
        capitalization: document.getElementById('style2').value,
        punctuation: document.getElementById('style3').value
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