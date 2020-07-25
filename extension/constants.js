//var SERVER_URL = 'http://127.0.0.1:5000/';
var SERVER_URL = 'http://ec2-35-161-78-68.us-west-2.compute.amazonaws.com/';
var S3_URL = 'https://imma-bucket.s3-us-west-2.amazonaws.com/';
var NULL_IMAGE_URL = 'https://imma-bucket.s3-us-west-2.amazonaws.com/browserbug_images/null_image.png';

// Increments in message frequency
// Maps to convert between 1-10 and actual quantities + text
// not the most efficient way to write welp but just getting it to work for now
var fDict = {
    1: [10, "every ~10 seconds"],
    2: [20, "every ~20 seconds"],
    3: [40, "every ~40 seconds"],
    4: [60, "every ~1 minute"],
    5: [120, "every ~2 minutes"],
    6: [300, "every ~5 minutes"],
    7: [600, "every ~10 minutes"],
    8: [900, "every ~15 minutes"],
    9: [1800, "every ~30 minutes"],
    10: [3600, "every ~1 hour"]
};
var bDict = {
    '10': [1, "every ~10 seconds"],
    '20': [2, "every ~20 seconds"],
    '40': [3, "every ~40 seconds"],
    '60': [4, "every ~1 minute"],
    '120': [5, "every ~2 minutes"],
    '300': [6, "every ~5 minutes"],
    '600': [7, "every ~10 minutes"],
    '900': [8, "every ~15 minutes"],
    '1800': [9, "every ~30 minutes"],
    '3600': [10, "every ~1 hour"]
};
var shortDict = {
    '10': [1, "10 sec"],
    '20': [2, "20 sec"],
    '40': [3, "40 sec"],
    '60': [4, "1 min"],
    '120': [5, "2 min"],
    '300': [6, "5 min"],
    '600': [7, "10 min"],
    '900': [8, "15 min"],
    '1800': [9, "30 min"],
    '3600': [10, "1 hr"]
};
var shortDict2 = {
    1: [10, "10 sec"],
    2: [20, "20 sec"],
    3: [40, "40 sec"],
    4: [60, "1 min"],
    5: [120, "2 min"],
    6: [300, "5 min"],
    7: [600, "10 min"],
    8: [900, "15 min"],
    9: [1800, "30 min"],
    10: [3600, "1 hr"]
};