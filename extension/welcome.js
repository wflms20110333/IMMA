$(document).ready(function() {
    $('.i18n-txt').each(function(index, element) { // translate text
		this.textContent = chrome.i18n.getMessage(this.id);
		this.value = chrome.i18n.getMessage(this.id);
	});
});
