/* Copyright (C) 2020- IMMA Studio, LLC - All Rights Reserved
 * This file is subject to the terms and conditions defined in
 * file 'license.txt', which is part of this source code package.
 * You may not distribute, reproduce, or modify this code without written permission.
 */

// Code for enabling hyperlinks in popup, do this first
/*
var links = document.getElementsByTagName("a");
for (var i = 0; i < links.length; i++) {
    (function() {
        var ln = links[i];
        var location = ln.href;
        ln.onclick = function() {
            chrome.tabs.create({ active: true, url: location });
        };
    })();
}
*/

// Determine whether the mailbox flag should be up
getMail(mailAuthenticate);

function mailAuthenticate(mailResponse) {
    var mailbox = document.getElementById('mailFlag');
    if (mailResponse != "none") {
        mailbox.src = "/images/icons/openmail.png";
        mailbox.style.opacity = "inherit";
    }
}

// Mailbox functionality
var mailbox = document.getElementById('mailFlag');
mailbox.addEventListener('click', function() {
    getMail(mailCallback);
});

function mailCallback(mailResponse) {
    if (mailResponse == "none") {
        chrome.runtime.getBackgroundPage(function(backgroundPage){
            backgroundPage.alert("No unread messages!");
        }); // #TODO make this look less sketchy
    } else {
        chrome.runtime.getBackgroundPage(function(backgroundPage){
            backgroundPage.alert(mailResponse[1]);
        });
        chrome.storage.sync.set({ 'lastMail': mailResponse[0] });
        mailbox.src = "/images/icons/openmail.png"; // #TODO adding coloring to the open mailbox when there's a new message?
        mailbox.style.opacity = "1";
        location.reload();
    }
}

// Update displayed IMMA information in the popup menu
chrome.storage.sync.get(['image_link', 'imma_name'], function(data) {
    var image_link = data['image_link'];
    console.log('image_link: ' + image_link);
    if (image_link == undefined)
        image_link = NULL_IMAGE_URL;
    console.log('new image_link: ' + image_link);
    document.getElementById('immaicon').src = image_link;
    document.getElementById('charactername').textContent = data['imma_name'];
});

// Update the activation switch to the activation state
console.log("updating toggle switch-");
var activeswitch = document.getElementById('activeswitch');
chrome.storage.sync.get(['immaActive'], function(data) {
    activeswitch.checked = data['immaActive'];
    if (data['immaActive'] == 'true' || data['immaActive'] == true) { document.getElementById('bbug-active').textContent = "active"; } else { document.getElementById('bbug-active').textContent = "inactive"; }
});

// Manage character loading (similar to "open" code in studio.js)
var fileSelected = document.getElementById('loader');
fileSelected.addEventListener('change', function(e) {
    var fileTobeRead = fileSelected.files[0];
    var fileReader = new FileReader();
    fileReader.onload = function(e) {
        loadCharacterFromJson(JSON.parse(fileReader.result));
    }
    fileReader.readAsText(fileTobeRead);
}, false);

// Manage the activation switch
activeswitch.addEventListener('click', function() {
    if (activeswitch.checked == true) { // activate imma
        document.getElementById('bbug-active').textContent = "active"; // update text in popup
        chrome.storage.sync.set({ 'immaActive': true });
        chrome.browserAction.setBadgeText({"text":"ON"});
        chrome.browserAction.setBadgeBackgroundColor({"color": "#764fff"});
        setQuickAlarm();
    } else { // deactivate imma
        document.getElementById('bbug-active').textContent = "inactive"; // update text in popup
        chrome.storage.sync.set({ 'immaActive': false });
        chrome.browserAction.setBadgeText({"text":"OFF"});
        chrome.browserAction.setBadgeBackgroundColor({"color": "#636363"});
        chrome.alarms.clearAll();
        // clear all existing notifications
        chrome.notifications.getAll((items) => {
            if (items) {
                for (let key in items) {
                    chrome.notifications.clear(key);
                }
            }
        });
    }
});

// Initialization: update frequency quantity to that in memory
console.log("updating frequency text-");
var freqText = document.getElementById('msg-freq');
chrome.storage.sync.get(['alarm_spacing'], function(data) {
    freqText.textContent = shortDict[data['alarm_spacing']][1];
});

// Manage the frequency buttons
document.getElementById('freq-LEFT').addEventListener('click', function() {changeFreq(-1);});
document.getElementById('freq-RIGHT').addEventListener('click', function() {changeFreq(1);});

// Modifies message frequency with input +1 or -1
function changeFreq(direction){
    chrome.storage.sync.get(['alarm_spacing'], function(data) {
        var freqIndex = shortDict[data['alarm_spacing']][0]; // frequency on 1-10 scale
        freqIndex = parseInt(freqIndex);
        freqIndex += direction;
        if (freqIndex <= 0) {freqIndex = 1;} // bounds
        if (freqIndex >= 11) {freqIndex = 10;}
        freqText.textContent = shortDict2[freqIndex][1];
        chrome.storage.sync.set({'alarm_spacing': shortDict2[freqIndex][0]});
        // clear alarms
        chrome.alarms.clearAll();
        setNextAlarm();
    });
}

console.log("Popup: running alarm clean");
cleaner();