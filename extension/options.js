/**
 * Update the user's preferred message frequency
 * @param {number} xScale x-position of slider, between 0 and 10
 */
function updateMessageFrequency(xScale) {
    console.log('in updateMessageFrequency');

    // First third of the slider: 5 seconds to 60 seconds
    // Second third of the slider: 1 minute to 5 minutes
    // Last third of the slider: 5 minutes to 20 minutes

    var intScale = Math.ceil(xScale);
    var answer = null;
    switch (intScale) {
        case 1:
            answer = [7, "every 5-10 seconds"];
        case 2:
            answer = [12, "every 10-15 seconds"];
        case 3:
            answer = [17, "every 15-20 seconds"];
        case 4:
            answer = [22, "every 20-30 seconds"];
        case 5:
            answer = [32, "every 30-45 seconds"];
        case 6:
            answer = [60, "every ~1 minute"];
        case 7:
            answer = [120, "every ~2 minutes"];
        case 8:
            answer = [300, "every ~5 minutes"];
        case 9:
            answer = [600, "every ~10 minutes"];
        case 10:
            answer = [1200, "every ~20 minutes"];
    }

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