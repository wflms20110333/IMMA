$(document).ready(function() {
    $('.urlButton').each(function(index,element) { // link image-updating buttons
        $(this).click(function(){
            var urlBoxId = this.id + "-url";
            var newImgUrl = document.getElementById(urlBoxId).value;
            var imgBoxId = this.id + "-img";
            document.getElementById(imgBoxId).src = newImgUrl;
        });
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
        document.getElementById('msgstat1').value = 5;
        document.getElementById('msgstat2').value = 5;
        document.getElementById('msgstat3').value = 5;
        // create remove button
        var removeButton = document.createElement('button');
        removeButton.class = 'remove';
        removeButton.innerHTML = 'Remove';
        removeButton.onclick = function() {
            $(this).parent().remove();
        };
        // export contents
        iDiv.value = [flabel, [fstat1, fstat2, fstat3]];
        iDiv.innerHTML = (flabel + " (stats = " + fstat1 + ", " + fstat2 + ", " + fstat3 + ") ");
        iDiv.appendChild(removeButton);
    });

    $("#export").click(function() {
        var dict = {}; // empty object to fill then export
        dict.information = {
            name: document.getElementById('imma-name').value,
            premade: false
        };
        dict.personality = {
            productivity: document.getElementById('personality1').value,
            cheerful: document.getElementById('personality2').value,
            energized: document.getElementById('personality3').value
        };
        dict.textstyle = {
            emojis: document.getElementById('style1').value,
            capitalization: document.getElementById('style2').value,
            punctuation: document.getElementById('style3').value
        };
        dict.messageBank = {};
        $('.messageBlock').each(function(index,element) { // fill the message bank
            var messageName = element.value[0];
            dict.messageBank.messageName = element.value[1];
        });

        // next, actually export the file
        var jsonDict = JSON.stringify(dict);
        var file = new Blob([jsonDict], {
            type: "application/json"
        });
        url = URL.createObjectURL(file);
        var a = document.getElementById('export');
        a.href = url;
        a.download = dict.information.name + ".brbug";
    });
});

$(window).bind('beforeunload', function(){ // warns users of an unsaved model
    return 'Are you sure you want to leave?';
});