var en_text = {
	"translations_available": {"message": ""},

	"w_A1": {"message": "Welcome"},
	"w_B1": {"message": "HOW TO USE"},
	"w_B2": {"message": "Welcome to Browserbug! We've already loaded a default character, \"Browserbee,\" for you to use :)"},

	"w_B3_1": {"message": "By now, you should have received a notification from it. (If not, check out our"},
	"w_B3_link": {"message": "Troubleshooting"},
	"w_B3_2": {"message": "section!)"},

	"w_B4_1": {"message": "When you're ready, visit the"},
	"w_B4_link": {"message": "Studio"},
	"w_B4_2": {"message": "and start designing your own character!"},

	"w_C1_1": {"message": "For more advanced settings (want to adjust how often you get messages?) visit the"},
	"w_C1_link": {"message": "Options"},
	"w_C1_2": {"message": "page."},

	"w_C2_bold": {"message": "Thanks for installing Browserbug!"},
	"w_C2_1": {"message": ":) Feel free to send us a"},
	"w_C2_link": {"message": "ko-fi"},
	"w_C2_2": {"message": "or rate our extension if you like it!"},

	"w_D1": {"message": "PRIVACY"},
	"w_D2": {"message": "To preserve your privacy, we keep information locally on your own computer whenever possible, minimizing what's visible to us."},

	"w_D3_1": {"message": "To preserve your privacy, we keep information locally on your own computer whenever possible. Check out our"},
	"w_D3_link": {"message": "Privacy Policy"},
	"w_D3_2": {"message": "for more details!"},

	"w_E1": {"message": "NEED HELP?"},
	"w_E1_2": {"message": "Can I change how long messages stay on my screen? Why am I missing certain notifications?"},

	"w_E2_1": {"message": "For answers to these and more, take a look at our"},
	"w_E2_link": {"message": "FAQ!"},
	"w_E2_2": {"message": ""},

	"w_E3_1": {"message": "We're also available to contact through"},
	"w_E3_link1": {"message": "email,"},
	"w_E3_link2": {"message": "Facebook,"},
	"w_E3_4": {"message": "or"},
	"w_E3_link3": {"message": "Twitter."},
	"w_E3_5": {"message": ""},

	"new": {"message": "New"},
	"fOpen": {"message": "Upload local"},
	"fServer": {"message": "Open from server"},
	"export": {"message": "Download local"},
	"uploadBbug": {"message": "Save to server"},

	"tHelp": {"message": "Help"},
	"acct": {"message": "Account"},
	"tSett": {"message": "Settings"},
	"tFForm": {"message": "Feedback Form"},
	"tFB": {"message": "FB"},
	"tTwitter": {"message": "Twitter"},
	"tKofi": {"message": "Buy us Ko-Fi!"},

	"personality": {"message": "Personality"},
	"persToggle_T": {"message": "Experimental! Describe the typical attitude of your character."},

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

	"activate": {"message": "Finished! Activate this Browserbug."},

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

$(document).ready(function() {
	// customizing fonts to language
	/*if (result['user_lang'] == 'es') {
		document.querySelectorAll("h1, h2, h3, .question").forEach(el => {
			el.style.fontFamily = 'Gochi Hand', 'Segoe UI', 'sans-serif'; // spanish: Mansalva
			el.style.fontWeight = 400;
		});
	} else if (result['user_lang'] == 'zh') {
		document.querySelectorAll(".i18n-txt").forEach(el => {
			el.style.fontFamily = 'Noto Sans SC', 'Segoe UI', 'sans-serif'; // chinese: Noto Sans SC
			el.style.fontWeight = 400;
		});
	}*/
	
	$('.i18n-txt').each(function(index, element) { // translate text
		var ownId = this.id;
		//$.getJSON("_locales/" + result['user_lang'] + "/messages.json", function(msgObj) {
		document.getElementById(ownId).textContent = en_text[ownId]['message'];
		document.getElementById(ownId).value = en_text[ownId]['message'];
		//});
	});

	// specify which welcome diagram to use
	//document.getElementById("popup-image").src = "/images/welcomediagram/welcome_" + result['user_lang'] + "2clear.png";

});