/* Copyright (C) 2020- IMMA Studio, LLC - All Rights Reserved
 * This file is subject to the terms and conditions defined in
 * file 'license.txt', which is part of this source code package.
 * You may not distribute, reproduce, or modify this code without written permission.
 */

var en_text = {
	"translations_available": {"message": ""},

	"new": {"message": "New"},
	"fOpen": {"message": "Load local"},
	"export": {"message": "Download"},
	"uploadBbug": {"message": "Save to server"},

	"tHelp": {"message": "Help"},
	"acct": {"message": "Account"},
	"tSett": {"message": "Settings"},
	"tFForm": {"message": "Feedback Form"},
	"tFB": {"message": "FB"},
	"tTwitter": {"message": "Twitter"},
	"tKofi": {"message": "Buy us Ko-Fi!"},

	"categories": {"message": "Default messages"},
	"catToggle_T": {"message": "Experimental! Describe the typical attitude of your character."},

	"p11": {"message": "Serious"},
	"p12": {"message": "Cheerful"},
	"p21": {"message": "Laidback"},
	"p22": {"message": "Energetic"},
	"p31": {"message": "Productivity"},
	"p32": {"message": "Positivity"},

	"textingstyle": {"message": "Texting style"},
	"textToggle_T": {"message": "Choose how often your bug sends emojis :) or CAPITALIZES or uses punctuation!!!!"},

	"txt1": {"message": "Emojis"},
	"txt2": {"message": "Capitalization"},
	"txt3": {"message": "Punctuation"},

	"studWelcome": {"message": "Hello! Welcome to the Studio."},
	"stud1": {"message": "Hover over any"},
	"stud2": {"message": "to view tips."},
	"tipToggle_T": {"message": "Don't forget to activate when you're done customizing!"},

	"activate": {"message": "Activate changes"},

	"pName": {"message": "Name"},
	"nameToggle_T": {"message": "Pick a name!"},
	"pAvatar": {"message": "Avatar"},
	"imgToggle_T": {"message": "Pick an image!"},
	"imgLabelr": {"message": "Pick image"},

	"custMsgs": {"message": "Custom messages"},
	"ccToggle_T": {"message": "Create your own messages! (Texting style is not applied to these.)"},
	"proportion": {"message": "Proportion of custom messages"},
	"ratioToggle_T": {"message": "How often to use custom messages rather than default messages"},

	"ptCC": {"message": "% custom"},
	"ptDef": {"message": "% default"},

	"cm1": {"message": "Create message"},
	"cm2": {"message": "Stats"},
	"statToggle_T": {"message": "Grade this message! (0=no effect, 1=high effect)"},
	"cm3": {"message": "Happiness"},
	"m1Toggle_T": {"message": "Happiness: Reducing your stress and frustration"},
	"cm4": {"message": "Focus"},
	"m2Toggle_T": {"message": "Focus: Preventing boredom and distraction"},
	"cm5": {"message": "Wellbeing"},
	"m3Toggle_T": {"message": "Wellbeing: Helping you maintain healthy habits"},
	"cm6": {"message": "Custom messages"},
	"addMessage": {"message": "Add message"}
}

// Default messages, split into categories
var Wellness = {
	"Rest your eyes: look at a distant object![ :)]": true,
	"Don't forget to blink and rest your eyes![ ;)]": true,
	"Be sure to rest your eyes![ :)]": true,
	"How long have you been sitting in this position?": true,
	"Time for a quick stretch maybe?[ :)]": true,
	"A quick reminder to sit up straight![ :D]": true,
	"Stay hydrated!": true,
	"Don't forget to drink water![ :)]": true,
	"A reminder to drink some water![ :)]": true,
	"Is now a good time for a break?": true,
	"Don't forget to take a break once in a while!": true
}
var Focus = {
	"Keep it up!": true,
	"You can do this![ :D]": true,
	"You've got this![ :)]": true,
	"Don't give up![ :>]": true,
	"Focus![ :>]": true,
	"Concentrate!": true,
	"Keep going![ :)]": true,
	"Your work is important, keep at it![ :>]": true,
	"Is that productivity I see?[ :O]": true,
	"Don't get distracted![ :>]": true
}
var Kudos = {
	"You've been doing well![ :)]": true,
	"You've been doing a great job![ :D]": true,
	"You've done well![ :O]": true,
	"You've worked hard![ :)]": true,
	"You've leveled up a lot today![ :)]": true,
	"You're getting better![ :)]": true,
	"That looks interesting![ :)]": true,
	"Good job![ :)]": true,
	"Great work![ :D]": true,
	"You're amazing![ XD]": true,
	"I'm cheering you on![ :D]": true
}
var Support = {
	"Take a deep breath and recenter![ :)]": true,
	"Close your eyes for a few seconds: how are you feeling?[ :)]": true,
	"Time for a quick breather? Inhale, and slowly exhale.[ :)]": true,
	"How are you feeling right now?": true,
	"Remember to smile![ :)]": true,
	"Don't forget to think about the big picture![ :)]": true,
	"It's okay to ask for help![ :)]": true,
	"Hope you're doing okay![ :)]": true,
	"Are your muscles tense right now? Relax![ :)]": true
}

// mapping names of categories to the categories
var nameMap = {"Wellness": Wellness, "Focus": Focus, "Kudos": Kudos, "Support": Support}
var menuInFocus = "none";

// a blank browserbug
var blankBbug = {}; // empty object for "New" button
blankBbug.information = {
    name: "",
    imageS3Path: NULL_IMAGE_URL,
    percentCustomQuotes: 0.5
};
blankBbug.defaultBank = {Wellness, Focus, Kudos, Support}; // a full default bank
blankBbug.customBank = {}; // empty custom bank
blankBbug.textstyle = { 'emojis': 0.5, 'capitalization': 0.5, 'punctuation': 0.5 }; // default texting style

$(document).ready(function() {
	if ($(window).width() < 960) {
        alert("If you can, please enlarge your browser window so that the Studio can properly display! :)");
	}
	
    $('.i18n-txt').each(function(index, element) { // add text to page
		var ownId = this.id;
        document.getElementById(ownId).textContent = en_text[ownId]['message'];
        document.getElementById(ownId).value = en_text[ownId]['message'];
	});

	// Initially hide all category menus, & populate each with content
	for (var category in nameMap) {
		document.getElementById(category).style.display = "none";
		for (var key in nameMap[category]) { // populate menu
			// where to place next message
			var iDiv = document.createElement('div');
			iDiv.className = 'quoteBlock';
			// Extract any emojis
			var noEmoji = key;
			if (noEmoji.includes('[') && noEmoji.includes(']')) {
				noEmoji = noEmoji.replace(/ *\[[^\]]*]/, '');
			}
			iDiv.textContent = noEmoji;
			iDiv.value = key;
			document.getElementById(category).appendChild(iDiv);
	
			// creating checkbox element 
			var checkbox = document.createElement('input'); 
			checkbox.type = "checkbox"; 
			checkbox.checked = true;
			checkbox.className = category+'B';

			// export contents
			iDiv.appendChild(checkbox);
		}
	}

	// Show/hide all message category menus
	document.getElementById("showAllQuotes").addEventListener('click', function(){
		if (menuInFocus == "all") {
			for (var category in nameMap) {
				document.getElementById(category).style.display = "none";
			};
			this.textContent = "show all";
			menuInFocus = "none";
		} else {
			for (var category in nameMap) {
				document.getElementById(category).style.display = "block";
			};
			menuInFocus = "all";
			this.textContent = "hide all";
		}
	});
	
	// When a button is clicked, show the relevant menu
	document.querySelectorAll(".quoteButtons div").forEach(el => {
		el.addEventListener('click', function(){
			var elContent = el.textContent; // get which button was clicked
			if (menuInFocus == elContent) { // same button clicked twice
				document.getElementById(elContent).style.display = "none";
				menuInFocus = "none";
			} else if (menuInFocus == "none") { // new button clicked
				document.getElementById(elContent).style.display = "block";
				menuInFocus = elContent;
			} else if (menuInFocus == "all") {
				for (var category in nameMap) { document.getElementById(category).style.display = "none"; };
				document.getElementById(elContent).style.display = "block";
				menuInFocus = elContent;
				document.getElementById("showAllQuotes").textContent = "show all";
			} else { // unique click for a button, switch menu
				document.getElementById(menuInFocus).style.display = "none";
				document.getElementById(elContent).style.display = "block";
				menuInFocus = elContent;
			}
		});
	});

	// When a main checkbox is clicked, check or uncheck all messages
	document.querySelectorAll(".quoteButtons input").forEach(el => {
		el.addEventListener('click', function(){
			var category = this.id.slice(0, -1) + 'B';
			checkboxes = document.getElementsByClassName(category);
			for (var i in checkboxes) { checkboxes[i].checked = el.checked; }
		});
	});
});
