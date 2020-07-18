// Code for enabling hyperlinks in popup, do this first
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

// Determine whether the mailbox flag should be up
chrome.extension.getBackgroundPage().getMail(mailAuthenticate);

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
    chrome.extension.getBackgroundPage().getMail(mailCallback);
});

function mailCallback(mailResponse) {
    if (mailResponse == "none") {
        alert("No unread messages!"); // #TODO make this look less sketchy
    } else {
        alert(mailResponse[1]);
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
        chrome.extension.getBackgroundPage().loadCharacterFromJson(JSON.parse(fileReader.result));
    }
    fileReader.readAsText(fileTobeRead);
}, false);

// Manage the activation switch
activeswitch.addEventListener('click', function() {
    if (activeswitch.checked == true) { // activate imma
        document.getElementById('bbug-active').textContent = "active"; // update text in popup
        chrome.storage.sync.set({ 'immaActive': true });
        chrome.extension.getBackgroundPage().setQuickAlarm();
    } else { // deactivate imma
        document.getElementById('bbug-active').textContent = "inactive"; // update text in popup
        chrome.storage.sync.set({ 'immaActive': false });
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

console.log("Popup: running alarm clean");
chrome.extension.getBackgroundPage().cleaner();