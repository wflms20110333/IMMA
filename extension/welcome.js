$(document).ready(function() {
	// customizing fonts to language
	chrome.storage.sync.get(['user_lang'], function (result) {
		if (result['user_lang'] == 'es') {
			document.querySelectorAll("h1, h2, h3, .question").forEach(el => {
				el.style.fontFamily = 'Gochi Hand', 'Segoe UI', 'sans-serif'; // spanish: Mansalva
				el.style.fontWeight = 400;
			});
		} else if (result['user_lang'] == 'zh') {
			document.querySelectorAll(".i18n-txt").forEach(el => {
				el.style.fontFamily = 'Noto Sans SC', 'Segoe UI', 'sans-serif'; // chinese: Noto Sans SC
				el.style.fontWeight = 400;
			});
		}
		
		$('.i18n-txt').each(function(index, element) { // translate text
			var ownId = this.id;
			$.getJSON("_locales/" + result['user_lang'] + "/messages.json", function(msgObj) {
				document.getElementById(ownId).textContent = msgObj[ownId]['message'];
				document.getElementById(ownId).value = msgObj[ownId]['message'];
			});
		});

	});
});