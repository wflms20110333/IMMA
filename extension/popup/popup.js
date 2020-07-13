// Code for enabling hyperlinks in popup, do this first
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

// Determine whether the mailbox flag should be up
chrome.extension.getBackgroundPage().getMail(mailAuthenticate);

function mailAuthenticate(mailResponse){
    var mailbox = document.getElementById('mailFlag');
    if (mailResponse != "none") {
        mailbox.src="/images/icons/openmail.png";
    }
}

// Mailbox functionality
var mailbox = document.getElementById('mailFlag');
mailbox.addEventListener('click', function() {
    chrome.extension.getBackgroundPage().getMail(mailCallback);
});

function mailCallback(mailResponse){
    if (mailResponse == "none") {
        alert("No unread messages!"); // #TODO make this look less sketchy
    } else {
        alert(mailResponse[1]);
        chrome.storage.sync.set({'lastMail': mailResponse[0]});
        mailbox.src="/images/icons/openmail.png"; // #TODO adding coloring to the open mailbox when there's a new message?
        location.reload();
    }
}

// Update colors of the popup menu
chrome.storage.sync.get(['color1', 'color2'], function(data) {
    //document.getElementById('clearbox').style.backgroundColor = data['color2'];
    //document.getElementById('clearbox').style.opacity = 0.75;
    //document.getElementById('characterpicker').style.backgroundColor = data['color2'];
    //document.getElementById('footerbar').style.backgroundColor = data['color1'];
  });

// Update displayed IMMA information in the popup menu
chrome.storage.sync.get(['image_link', 'imma_name'], function(data) {
    document.getElementById('immaicon').src = data['image_link'];
    document.getElementById('charactername').textContent = data['imma_name'];
});

// Update the activation switch to the activation state
console.log("updating toggle switch-");
var activeswitch = document.getElementById('activeswitch');
chrome.storage.sync.get(['immaActive'], function(data) {
    activeswitch.checked = data['immaActive'];
});

// Manage character loading (similar to "open" code in studio.js)
var fileSelected = document.getElementById('loader');
fileSelected.addEventListener('change', function (e) { 
    var fileTobeRead = fileSelected.files[0];
    var fileReader = new FileReader(); 
    fileReader.onload = function (e) { 
        chrome.extension.getBackgroundPage().loadCharacterFromJson(JSON.parse(fileReader.result));
    }
    fileReader.readAsText(fileTobeRead);
}, false);

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

console.log("Popup: running alarm clean");
chrome.extension.getBackgroundPage().cleaner();