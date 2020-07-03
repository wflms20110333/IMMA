// Manage the message frequency slider
var freqslider = document.getElementById('frequency-slider');
var slidertext = document.getElementById('slider-text');
updateMessageFrequency(freqslider.value, slidertext);
freqslider.oninput = function() {
    updateMessageFrequency(freqslider.value, slidertext);
};

// Manage the fade checkbox
var fadeswitch = document.getElementById('autofade-switch');
fadeswitch.checked = true; // active by default
fadeswitch.addEventListener('click', function() {
    updateAutoDelete(fadeswitch.checked);
});

/**
 * Update the user's preferred message frequency
 * @param {number} xScale x-position of slider, between 0 and 20
 * @param {string} sliderText text alongside the slider to label with amount
 */
function updateMessageFrequency(xScale, sliderText) {
    console.log('in updateMessageFrequency');

    // First third of the slider: 5 seconds to 60 seconds
    // Second third of the slider: 1 minute to 5 minutes
    // Last third of the slider: 5 minutes to 20 minutes

    var intScale = Math.ceil(xScale/2);
    var answer = null;
    switch (intScale) {
        case 1:answer = [7, "every 10-15 seconds"];break;
        case 2:answer = [12, "every 15-30 seconds"];break;
        case 3:answer = [17, "every 30-45 seconds"];break;
        case 4:answer = [22, "every 45-60 seconds"];break;
        case 5:answer = [32, "every ~2 minutes"];break;
        case 6:answer = [60, "every ~5 minutes"];break;
        case 7:answer = [120, "every ~10 minutes"];break;
        case 8:answer = [300, "every ~15 minutes"];break;
        case 9:answer = [600, "every ~30 minutes"];break;
        case 10:answer = [1200, "every ~1 hour"];break;
    }
    sliderText.textContent = answer[1];

    // #TODO Update usersettings file to have this message frequency
}

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