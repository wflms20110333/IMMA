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
};

// Manage the fade checkbox
var fadeswitch = document.getElementById('autofade-switch');
fadeswitch.checked = true; // active by default
fadeswitch.addEventListener('click', function() {
    updateAutoDelete(fadeswitch.checked);
});

/**
 * Updates whether to auto-delete messages
 * @param {boolean} toDelete whether to fade messages without user input
 */
function updateAutoDelete(toDelete) {
    console.log('in updateAutoDelete');
    // #TODO Update usersettings file
}

/**
 * Allows user to enable/disable questions
 * @param {boolean} toEnable whether to allow questions
 */
function updateQuestions(toDelete) {
    console.log('in updateQuestions');
    // #TODO Update usersettings file
}