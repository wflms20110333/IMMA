// Update colors of the popup menu
chrome.storage.sync.get(['color1', 'color2'], function(data) {
    //document.getElementById('clearbox').style.backgroundColor = data['color2'];
    //document.getElementById('clearbox').style.opacity = 0.75;
    //document.getElementById('characterpicker').style.backgroundColor = data['color2'];
    //document.getElementById('footerbar').style.backgroundColor = data['color1'];
  });

// Update displayed IMMA information in the popup menu
chrome.storage.sync.get(['image_link', 'imma_name'], function(data) {
    document.getElementById('immaicon').src = "/images/character images/" + data['image_link'];
    document.getElementById('charactername').textContent = data['imma_name'];
});

// Update the activation switch to the activation state
console.log("updating toggle switch-");
var activeswitch = document.getElementById('activeswitch');
chrome.storage.sync.get(['immaActive'], function(data) {
    activeswitch.checked = data['immaActive'];
});

// Manage the activation switch
var activeswitch = document.getElementById('activeswitch');
activeswitch.checked = true; // active by default
activeswitch.addEventListener('click', function() {
    if(activeswitch.checked == true){ // activate imma
        chrome.storage.sync.set({'immaActive': true});
        chrome.extension.getBackgroundPage().setQuickAlarm();
    }else{ // deactivate imma
        chrome.storage.sync.set({'immaActive': false});
        chrome.alarms.clearAll();
        // clear all existing notifications
        chrome.notifications.getAll((items) => {
            if ( items ) {
                for (let key in items) {
                    chrome.notifications.clear(key);
                }
            }
        });
    }
});

// Code for enabling hyperlinks in popup
var links = document.getElementsByTagName("a");
for (var i = 0; i < links.length; i++) {
    (function () {
        var ln = links[i];
        var location = ln.href;
        ln.onclick = function () {
            chrome.tabs.create({active: true, url: location});
        };
    })();
}
