var temporary_i18n_messages = {
	"q0": {"message": "FREQUENTLY ASKED QUESTIONS"},

	"q1": {"message": "I'm concerned about my privacy!"},
	"a1_1": {"message": "We wouldn't want our information to be shared or sold without our permission, and we promise to treat you with that same respect."},
	"a1_2": {"message": "Your extension can only see which sites you're visiting if you enable that permission in"},
	"a1_3": {"message": "Options"},
	"a1_4": {"message": "- but that information is processed locally on your computer. From our side, we won't be able to see which sites you've visited."},
	"a1_5": {"message": "We've written up the details in our"},
	"a1_6": {"message": "Privacy Policy"},
	"a1_7": {"message": "if you'd like to read more!"},

	"q2": {"message": "Can I change how long messages stay on my screen?"},
	"a2_1": {"message": "Sure! Notification duration is controlled by your operating system. For example, on Windows 10, you can control this in Ease of Access >"},
	"a2_2": {"message": "Display"},
	"a2_3": {"message": "> Show notifications for."},

	"q3": {"message": "Can I customize my message layout?"},
	"a3_1": {"message": "Not yet! But if you'd be interested in setting a custom background color for your notifications, including GIFs or video, or doing other cool stuff, please help support us"},
	"a3_2": {"message": "here"},
	"a3_3": {"message": "so we can develop a desktop version of Browserbug!"},

	"q4": {"message": "Can I mute/change the sound of my notifications?"},
	"a4_1": {"message": "We're working on this! It's not much, but if you need to, you can mute all Chrome notifications in System >"},
	"a4_2": {"message": "Notifications & Actions"},
	"a4_3": {"message": "> Google Chrome."},

	"q5": {"message": "How does Browserbug make money?"},
	"a5_1": {"message": "At the moment, we're relying primarily on"},
	"a5_2": {"message": "Ko-Fi"},
	"a5_3": {"message": "donations and advertisements. We're working on adding in-app purchases with extra cool features that you can buy to support us, but in the meantime, we'd really appreciate any donations! :)"},

	"q6": {"message": "Who are you?"},
	"a6_1": {"message": "We're Michelle and Elizabeth, two college students! IMMA Studio, LLC is our side project, a way to make the Internet a happier place and a way to help pay for our tuition ;) Feel free to visit our"},
	"a6_2": {"message": "About"},
	"a6_3": {"message": "page to learn more about us!"},

	"t0": {"message": "TROUBLESHOOTING"},

	"t1": {"message": "I don't see the Browserbug icon in my extensions bar?"},
	"r1": {"message": "Click the puzzle piece icon or see if Browserbug might be hidden or minimized!"},

	"t2": {"message": "I'm not receiving my messages!"},
	"r2_1": {"message": "This is the most common issue users have! You can fix this in just a few seconds."},
	"r2_2": {"message": "For Windows 10 users:"},
	"r2_3": {"message": "Is Focus Assist turned on?"},
	"r2_4": {"message": "Open the Action Center to check! (Windows logo key + A)"},
	"r2_5": {"message": "Focus Assist will sometimes block notifications: if you want to use Browserbug during Focus Assist, you should add Google Chrome to your"},
	"r2_6": {"message": "priority list."},

	"r3_0": {"message": "Are your messages being kept in the Action Center?"},
	"r3_1": {"message": "Open the Action Center to check! (Windows logo key + A)"},
	"r3_2": {"message": "If your notifications are being saved to the Action Center instead of being shown on screen, you can disable this. Open System >"},
	"r3_3": {"message": "Notifications & Actions"},
	"r3_4": {"message": "> Google Chrome and uncheck 'Show notification in action center.'"},
	
	"r4_0": {"message": "Are notifications turned on?"},
	"r4_1": {"message": "Open System >"},
	"r4_2": {"message": "Notifications & Actions"},
	"r4_3": {"message": "To receive messages, notifications should be allowed, and Google Chrome notifications should be allowed."},

	"r5_0": {"message": "Is Chrome 'quieter messaging' turned on?"},
	"r5_1": {"message": "Open Notifications at"},
	"r5_2": {"message": "chrome://settings/content/notifications"},
	"r5_3": {"message": "Try turning off quieter messaging."},
	"r5_4": {"message": "To test if messages are now working, you can increase message frequency in"},
	"r5_5": {"message": "Options."},
	"r5_6": {"message": "If you haven't received a message in a while, opening the popup menu (click icon in extensions bar) will check for and replace any missed message timers."},
	"r5_7": {"message": "If you're using a different operating system or are still having problems receiving messages, feel free to reach out to us!"},

	"t6": {"message": "I have a problem that wasn't mentioned above, or I was unable to fix my problem :("},
	"r6_1": {"message": "Feel free to"},
	"r6_2": {"message": "email"},
	"r6_3": {"message": "or message us on"},
	"r6_4": {"message": "Facebook"},
	"r6_5": {"message": "or"},
	"r6_6": {"message": "Twitter,"},
	"r6_7": {"message": "or fill out a"},
	"r6_8": {"message": "Bug Report."},
	"r6_9": {"message": "We'll try to take a look!"}
}

$(document).ready(function() {
    $('.i18n-txt').each(function(index, element) { // translate text
		this.textContent = temporary_i18n_messages[this.id]['message'];
		this.value = temporary_i18n_messages[this.id]['message'];
	});
});
