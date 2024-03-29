/* Copyright (C) 2020- IMMA Studio, LLC - All Rights Reserved
 * This file is subject to the terms and conditions defined in
 * file 'license.txt', which is part of this source code package.
 * You may not distribute, reproduce, or modify this code without written permission.
 */

 // Manage the silence checkbox
/*var silentswitch = document.getElementById('silent-switch');
chrome.storage.sync.get(['silence'], function (result) { // on initialization
    silentswitch.checked = (result['silence'] == 'true');
});
silentswitch.addEventListener('click', function() {
    chrome.storage.sync.set({'silence': silentswitch.checked});
});*/

$(document).ready(function() {
    chrome.storage.sync.get(['user_lang'], function (result) {
        $('.i18n-txt').each(function(index, element) { // translate text
            var ownId = this.id;
            $.getJSON("_locales/" + result['user_lang'] + "/messages.json", function(msgObj) {
                document.getElementById(ownId).textContent = msgObj[ownId]['message'];
                document.getElementById(ownId).value = msgObj[ownId]['message'];
            });
        });

    });
});

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
    setNextAlarm();
};

// Manage language chooser
var languageChooser = document.getElementById('lang-chooser');
chrome.storage.sync.get(['user_lang'], function (result) { // on initialization, select language
    for (var i = 0; i < languageChooser.options.length; i++) {
        if (languageChooser.options[i].value == result['user_lang']) {
            languageChooser.options[i].selected = true;
            return;
        }
    }
});
languageChooser.onchange = function() { // update language
    chrome.storage.sync.set({'user_lang': languageChooser.value});
    location.reload();
};

chrome.storage.sync.get(['user_bbug_id'], function(result) {
    // update user id listed
    document.getElementById("uid-fill").textContent = result['user_bbug_id'].substring(0, 10);
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
        iDiv.innerHTML = (flabel + " (" + fstats + ") ");
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
    var flabel = document.getElementById('flagcontent').value;
    var fstat1 = document.getElementById('flagname').value;
    // clear contents
    document.getElementById('flagname').value = "";
    document.getElementById('flagcontent').value = "";
    // create remove button
    var removeButton = document.createElement('button');
    removeButton.class = 'remove';
    removeButton.innerHTML = 'Remove';
    removeButton.onclick = function() {
        $(this).parent().remove();
        updateSiteFlags();
    };
    // export contents
    iDiv.value = [flabel, fstat1];
    iDiv.innerHTML = (flabel + " ("+fstat1+") ");
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

// Manage tabs permission for site flagging
var flagStatusText = document.getElementById('flagging-on');
var flagButton = document.getElementById('flagging-button');

// check if tab permission is enabled
chrome.permissions.contains({ permissions: ['tabs'] }, function(result) {
    if (result) { console.log("has tab permission!"); flagStatusText.textContent = "ON"; flagButton.textContent = "Disable site flagging"; }
    else { console.log("no tab permission!"); flagStatusText.textContent = "OFF"; flagButton.textContent = "Enable site flagging"; }
});

flagButton.addEventListener('click', function() { // change permissions for site flagging
    if (flagStatusText.textContent == "OFF") {
        // If turning permission from OFF to ON
        // add permission
        chrome.permissions.request({ permissions: ['tabs'], }, function(granted) {
            // The callback argument will be true if the user granted the permissions.
            if (granted) {
                flagStatusText.textContent = "ON"; flagButton.textContent = "Disable site flagging";
            }
        });
    } else {
        // If turning permission from ON to OFF
        // clear last tabs variable
        chrome.storage.sync.set({'last_tabs': {}});
        // remove permission
        chrome.permissions.remove({ permissions: ['tabs'] }, function(removed) {
            if (removed) { console.log("tabs successfully turned off"); }
            else { console.log("error! unable to remove permissions. please contact us!"); }
        });
        flagStatusText.textContent = "OFF"; flagButton.textContent = "Enable site flagging";
    }
});