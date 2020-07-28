$(document).ready(function() {
    $('.i18n-txt').each(function(index, element) { // translate text
		this.textContent = chrome.i18n.getMessage(this.id);
		this.value = chrome.i18n.getMessage(this.id);
	});
	countSlotsAvail();
	populateBrowserbugs();

	$("#purchaseBoost1").click(function() { // link purchases
		statusDiv.text("Purchasing boost 1...");
		google.payments.inapp.buy({parameters: {'env': "prod"},
		'sku': "pBOOST1",'success': onPurchase, 'failure': onPurchaseFailed });
	});
	$("#purchaseBoost2").click(function() { // link purchases
		statusDiv.text("Purchasing boost 2...");
		google.payments.inapp.buy({parameters: {'env': "prod"},
		'sku': "pBOOST2",'success': onPurchase, 'failure': onPurchaseFailed });
	});
	$("#purchaseBoost3").click(function() { // link purchases
		statusDiv.text("Purchasing subscription...");
		google.payments.inapp.buy({parameters: {'env': "prod"},
		'sku': "pBOOST3",'success': onPurchase, 'failure': onPurchaseFailed });
	});
	$("#enteractivation").click(function() { // link purchases
		checkCode();
    });
});

// Check premium code
function checkCode() {
	chrome.storage.sync.get(['user_bbug_id'], function(result) {
		result['code'] = document.getElementById("activationcode").value;
		serverPOST('checkCode', result, function(data) {
			if (data['result'] == 'validCode') {
				chrome.storage.sync.set({'user_level': 'premium'});
				alert("code entry successful! refresh to apply changes.");
			} else {
				alert("invalid code :(");
			}
        });
    });
}

// Show slots available
function countSlotsAvail(){
	chrome.storage.sync.get(['user_level'], function(result) {
		if (result['user_level'] == 'premium') {
			document.getElementById("bbugs-avail").textContent = "∞";
		}
    });
}

// Update list of browserbugs
function populateBrowserbugs() {
	chrome.storage.sync.get(['user_bbug_id'], function(result) {
		// update user id listed
		document.getElementById("uid-fill").textContent = result['user_bbug_id'].substring(0, 10);

        serverPOST('getListOfUserFiles', result, function(data) {
			// Update number of slots used
			var numBbugs = Object.keys(data['characters']).length;
			document.getElementById("bbugs-used").textContent = numBbugs;
			// Add browserbugs to divs
			for (const [key, value] of Object.entries(data['characters'])) {
				var div = document.createElement("div");
				div.setAttribute('class', 'bbug-entry');

				var imgSpan = document.createElement('img'); imgSpan.src=value;
				div.appendChild(imgSpan);
				var nameSpan = document.createElement('span'); nameSpan.textContent = key; nameSpan.setAttribute('class', 'namer');
				div.appendChild(nameSpan);
				var activeSpan = document.createElement('span'); activeSpan.textContent = "Activate"; activeSpan.setAttribute('class', 'activator');
				activeSpan.onclick = function() {
					var removeData = {'uid': result['user_bbug_id'], 'bbugname': key};
					var bbug_path = S3_URL + 'browserbugs/' + uid + '/' + character_name + '.bbug';
					alert("unimplemented!!!!");
					// #TODO!!!!!!!!!!!!!!!!!!!!!!!!!!
					//openJsonDat(JSON.parse(fileReader.result));
				}
				div.appendChild(activeSpan);
				var removeSpan = document.createElement('span'); removeSpan.textContent = "Delete"; removeSpan.setAttribute('class', 'remover');
				removeSpan.onclick = function() {
					var removeData = {'uid': result['user_bbug_id'], 'bbugname': key};
					serverPOST('removeBug', removeData, function(data) {
						if (data['result'] == 'success') {
							location.reload();
						} else {
							alert("failed to delete bug");
						}
					});
				}
				div.appendChild(removeSpan);
				var viewSpan = document.createElement('span'); viewSpan.textContent = "View"; viewSpan.setAttribute('class', 'viewer');
				viewSpan.onclick = function() {
					var j_uid = result['user_bbug_id'];
					var j_name = key;
					var j_url = encodeURIComponent(value);
					var bbugPath = SERVER_URL + "getBbugFile?uid=" + j_uid + "&character_name=" + j_name + "&imgurl=" + j_url;
					window.open(bbugPath);
				}
				div.appendChild(viewSpan);

				$('#bbug-list').append(div);
				console.log(key, value);
			}
        });
    });
}

/*****************************************************************************
* Get the list of purchased products from the Chrome Web Store
*****************************************************************************/
var statusDiv = $("#statusDiv");
var purchaseInfo = $("#purchaseInfo");

function getLicenses() {
  console.log("google.payments.inapp.getPurchases");
  statusDiv.text("Retreiving list of purchased products...");
  google.payments.inapp.getPurchases({
    'parameters': {env: "prod"},
    'success': onLicenseUpdate,
    'failure': onLicenseUpdateFailed
  });
}

function onLicenseUpdate(response) {
  console.log("onLicenseUpdate", response);
  var licenses = response.response.details;
  var count = licenses.length;
  purchaseInfo.append("licenses");
  for (var i = 0; i < count; i++) {
    var license = licenses[i];
    purchaseInfo.append(license);
  }
  purchaseInfo.append("done");
  statusDiv.text("");
}

function onLicenseUpdateFailed(response) {
  console.log("onLicenseUpdateFailed", response);
  statusDiv.text("Error retreiving list of purchased products.");
}

/*****************************************************************************
* Purchase an item
*****************************************************************************/
function onPurchase(purchase) {
  console.log("onPurchase", purchase);
  var jwt = purchase.jwt;
  var cartId = purchase.request.cardId;
  var orderId = purchase.response.orderId;
  statusDiv.text("Purchase completed. Order ID: " + orderId);
  getLicenses();
}

function onPurchaseFailed(purchase) {
  console.log("onPurchaseFailed", purchase);
  var reason = purchase.response.errorType;
  statusDiv.text("Purchase failed. " + reason);
}

/*****************************************************************************
* Update/handle the user interface actions
*****************************************************************************/
function addLicenseDataToProduct(license) {
  var butAction = $("#" + prodButPrefix + license.sku);
  butAction
    .text("View license")
    .removeClass("btn-success")
    .removeClass("btn-default")
    .addClass("btn-info")
    .data("license", license);
}
function onActionButton(evt) {
  console.log("onActionButton", evt);
  var actionButton = $(evt.currentTarget);
  if (actionButton.data("license")) {
    showLicense(actionButton.data("license"));
  } else {
    var sku = actionButton.data("sku");
    buyProduct(sku);
  }
}
function showLicense(license) {
  console.log("showLicense", license);
  var modal = $("#modalLicense");
  modal.find(".license").text(JSON.stringify(license, null, 2));
  modal.modal('show');
}
