// Manage the silence checkbox
/*var silentswitch = document.getElementById('silent-switch');
chrome.storage.sync.get(['silence'], function (result) { // on initialization
    silentswitch.checked = (result['silence'] == 'true');
});
silentswitch.addEventListener('click', function() {
    chrome.storage.sync.set({'silence': silentswitch.checked});
});*/

// Manage the message frequency slider
var fDict = {1: [12, "every 10-15 seconds"], 2: [22, "every 15-30 seconds"], 3: [37, "every 30-45 seconds"],
            4: [52, "every 45-60 seconds"], 5: [120, "every ~2 minutes"], 6: [300, "every ~5 minutes"],
            7: [600, "every ~10 minutes"], 8: [900, "every ~15 minutes"], 9: [1800, "every ~30 minutes"],
            10: [3600, "every ~1 hour"]}
var bDict = {'12': [1, "every 10-15 seconds"], '22': [2, "every 15-30 seconds"], '37': [3, "every 30-45 seconds"],
            '52': [4, "every 45-60 seconds"], '120': [5, "every ~2 minutes"], '300': [6, "every ~5 minutes"],
            '600': [7, "every ~10 minutes"], '900': [8, "every ~15 minutes"], '1800': [9, "every ~30 minutes"],
            '3600': [10, "every ~1 hour"]}
// Manage the message frequency slider
var freqslider = document.getElementById('frequency-slider');
var slidertext = document.getElementById('slider-text');
chrome.storage.sync.get(['alarm_spacing'], function (result) { // on initialization
    freqslider.value = bDict[result['alarm_spacing']][0];
    slidertext.textContent = bDict[result['alarm_spacing']][1];
});
freqslider.oninput = function() { // display text change
    slidertext.textContent = fDict[freqslider.value][1];    
};
freqslider.onchange = function() { // update actual options
    chrome.storage.sync.set({'alarm_spacing': fDict[freqslider.value][0]});
    chrome.alarms.clearAll();
    chrome.extension.getBackgroundPage().setNextAlarm();
};

// Manage the fade checkbox
var fadeswitch = document.getElementById('autofade-switch');
chrome.storage.sync.get(['persist_notifs'], function (result) { // on initialization
    fadeswitch.checked = (result['persist_notifs'] == 'true');
});
fadeswitch.addEventListener('click', function() {
    chrome.storage.sync.set({'persist_notifs': fadeswitch.checked});
});

// Manage site flagging
// #TODO on initialization: fill list of flagged sites with the ones already flagged
var addFlag = document.getElementById('add');
addFlag.addEventListener('click', function() { // process for <flagging sites>, almost same as adding custom messages
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
    iDiv.innerHTML = (flabel + " (stats = "+fstat1+", "+fstat2+", "+fstat3+", "+fstat4+", "+fstat5+") ");
    iDiv.appendChild(removeButton);

    // next, update site flags
    var flagSites = {};
    $('.messageBlock').each(function(index,element) { // fill the message bank
        var messageName = element.value[0];
        flagSites[messageName] = element.value[1];
    });
    chrome.storage.sync.set({'flagged_sites': flagSites});
});