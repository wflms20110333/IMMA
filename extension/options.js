// Manage the silence checkbox
/*var silentswitch = document.getElementById('silent-switch');
chrome.storage.sync.get(['silence'], function (result) { // on initialization
    silentswitch.checked = (result['silence'] == 'true');
});
silentswitch.addEventListener('click', function() {
    chrome.storage.sync.set({'silence': silentswitch.checked});
});*/

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
// on initialization: fill list of flagged sites with the ones already flagged
$(".messageBlock").remove(); // clear messages
chrome.storage.sync.get(['flagged_sites'], function (result) { // on initialization
    for (var key in result['flagged_sites']) { // import messages
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
            updateSiteFlags();
        };
        var flabel = key;
        var fstats = result['flagged_sites'][key];
        // export contents
        iDiv.value = [flabel, fstats];
        iDiv.innerHTML = (flabel + " (stats = " + fstats[0] + ", " + fstats[1] + ", " + fstats[2] + ") ");
        iDiv.appendChild(removeButton);
    }
});

// site flagging functionality
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
    // clear contents
    document.getElementById('messagecontent').value = "";
    document.getElementById('msgstat1').value = 0;
    document.getElementById('msgstat2').value = 0;
    document.getElementById('msgstat3').value = 0;
    // create remove button
    var removeButton = document.createElement('button');
    removeButton.class = 'remove';
    removeButton.innerHTML = 'Remove';
    removeButton.onclick = function() {
        $(this).parent().remove();
        updateSiteFlags();
    };
    // export contents
    iDiv.value = [flabel, [fstat1, fstat2, fstat3]];
    iDiv.innerHTML = (flabel + " (stats = "+fstat1+", "+fstat2+", "+fstat3+") ");
    iDiv.appendChild(removeButton);

    updateSiteFlags();
});

function updateSiteFlags() {
    // next, update site flags
    var flagSites = {};
    $('.messageBlock').each(function(index,element) { // fill the message bank
        var messageName = element.value[0];
        flagSites[messageName] = element.value[1];
    });
    chrome.storage.sync.set({'flagged_sites': flagSites});
}