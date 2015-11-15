var CURRENCY = "$";

var cards = [];
var blankCard;
var blankCardPointer;
var anonAnimals = ["alligator", "anteater", "armadillo", "auroch", "axolotl", "badger", "banana slug", "bat", "beaver", "buffalo", "camel", "chameleon", "cheetah", "chipmunk", "chinchilla", "chupacabra", "cormorant", "coyote", "crow", "dingo", "dinosaur", "dolphin", "duck", "elephant", "ferret", "fox", "frog", "giraffe", "gopher", "grizzly", "hedgehog", "hippo", "hyena", "jackal", "ibex", "ifrit", "iguana", "koala", "kraken", "lemur", "leopard", "liger", "llama", "manatee", "mink", "monkey", "narwhal", "nyan cat", "orangutan", "otter", "panda", "parrot", "penguin", "platypus", "python", "quagga", "rabbit", "raccoon", "rhino", "sheep", "shrew", "skunk", "sloth", "squirrel", "turtle", "tiger", "walrus", "wolf", "wolverine", "wombat"];
var anonAnimalsReference = {};
var notificationsExpanded = false;
var overflowExpanded = false;

var itemsToLoad = 0;

var socket;

window.onload = function () {
	
	var _element = document.createElement("div");
	_element.className = "auctionItem";
	_element.style.boxShadow = "0px 0px 0px 0px rgb(0, 0, 0)";
	_element.style.backgroundColor = "transparent";
	_element.id = "blankCard";
	_element.dom = _element;
	blankCard = _element;

	document.onmouseup = function() {
		for (var i = 0; i < cards.length; i++) {
			cards[i].mouseDown = false;
		}
	}
	
	socket = io.connect("https://" + window.location.hostname + ":22846");
	// socket = io.connect("https://75.4.22.77:22846");
	socket.on('get auction items', function(items) {
		itemsToLoad = items.length;

		for (var i = items.length - 1; i >= 0; i--) {
			cards[i] = {};
			cards[i].index = i;
			cards[i].ID = items[i]._id;
			cards[i].image = items[i].image;
			cards[i].name = items[i].name;
			cards[i].artist = items[i].artist;
			cards[i].description = items[i].description;
			cards[i].bidHistory = items[i].bidHistory;
			for (var j = 0; j < cards[i].bidHistory.length; j++) {
				cards[i].bidHistory[j][0] = parseFloat(cards[i].bidHistory[j][0]);
			}
			var container = document.getElementById("auctionItems");

			var auctionItem = document.createElement("div");
			auctionItem.className = "auctionItem";
			cards[i].mouseDown = false;
			auctionItem.onclick = createClickHandeler(i);
			auctionItem.onmousedown = createMouseDownHandeler(cards[i], false);
			auctionItem.onmouseenter = createMouseDownHandeler(cards[i], true);
			auctionItem.onmouseup = createMouseUpHandeler(cards[i], false);
			auctionItem.onmouseleave = createMouseUpHandeler(cards[i], true);
			auctionItem.id = "card" + (items.length - 1 - i);
			
				var info = document.createElement("div");
				info.className = "info";
				auctionItem.insertBefore(info, auctionItem.firstChild);

					var description = document.createElement("div");
					description.className = "description";
					description.innerHTML = cards[i].description;
					info.insertBefore(description, info.firstChild);

					var artist = document.createElement("div");
					artist.className = "artist";
					artist.innerHTML = cards[i].artist;
					info.insertBefore(artist, info.firstChild);

					var name = document.createElement("div");
					name.className = "name";
					name.innerHTML = cards[i].name;
					info.insertBefore(name, info.firstChild);

				var picture = document.createElement("img");
				picture.className = "picture";
				picture.style.backgroundImage = "url(" + cards[i].image + ")";
				auctionItem.insertBefore(picture, auctionItem.firstChild);
			
			cards[i].dom = container.insertBefore(auctionItem, container.firstChild);
			cards[i].front = cards[i].dom.innerHTML;
			cards[i].posFixed = [];
			cards[i].posFixed[0] = cards[i].dom.offsetLeft + container.offsetLeft - 20;
			cards[i].posFixed[1] = cards[i].dom.offsetTop + container.offsetTop - 20 - window.pageYOffset;
			cards[i].posFixed[2] = window.innerWidth - (cards[i].posFixed[0] + cards[i].dom.offsetWidth) - 55;
			cards[i].posFixed[3] = window.innerHeight - (cards[i].posFixed[1] + cards[i].dom.offsetHeight) - 40 + window.pageYOffset;
			cards[i].calculateDefaultBid = function() {
				var defaultBid = (this.bidHistory.length > 1) ? Math.ceil(parseFloat(this.bidHistory[this.bidHistory.length - 1][0]) + (this.bidHistory[this.bidHistory.length - 1][0] - this.bidHistory[this.bidHistory.length - 2][0])) : Math.ceil(parseFloat(this.bidHistory[this.bidHistory.length - 1][0]) + 1);
				defaultBid = (defaultBid - parseFloat(this.bidHistory[this.bidHistory.length - 1][0]) < 1) ? Math.ceil(parseFloat(this.bidHistory[this.bidHistory.length - 1][0]) + 1) : defaultBid;
				return defaultBid;
			};
			cards[i].calculateDefaultBid();
			var _image = document.createElement("img");
			_image.src = cards[i].image;
			_image.onload = createImageLoadHandeler(_image, i);
		}
	});
	socket.emit('get auction items', "");

	socket.on('new bid', function(text) {
		if (text.itemID != null) {
			msg = {};
			msg.id = text.itemID;
			msg.bid = text.bid;
			msg.bidder = text.bidder;
			cards[msg.id].bidHistory[cards[msg.id].bidHistory.length] = {};
			cards[msg.id].bidHistory[cards[msg.id].bidHistory.length - 1].bid = parseFloat(msg.bid);
			cards[msg.id].bidHistory[cards[msg.id].bidHistory.length - 1].bidder = msg.bidder;
			cards[msg.id].bidHistory[cards[msg.id].bidHistory.length - 1][0] = parseFloat(msg.bid);
			cards[msg.id].bidHistory[cards[msg.id].bidHistory.length - 1][1] = msg.bidder;
			if (cards[msg.id].dom.innerHTML != cards[msg.id].front) {
				var bidList = document.getElementById("bidHistory");
				var _element = document.createElement("div");
				_element.className = "bidPrice";
				_element.style.backgroundColor = ((cards[msg.id].bidHistory.length - 1) % 2 == 0) ? "rgb(255, 255, 255)" : "rgb(230, 230, 230)";
				_element.innerHTML = parseFloat(cards[msg.id].bidHistory[cards[msg.id].bidHistory.length - 1].bid).formatCurrency() + "<span class=\"bidderName\">Anonymous " + decideAnonAnimal(cards[msg.id].bidHistory[cards[msg.id].bidHistory.length - 1][1]) + "</span>";
				bidList.insertBefore(_element, bidList.firstChild);
				document.getElementById("dollarAmount").value = cards[msg.id].calculateDefaultBid();
			}
		}
		else {
			if (text == "failed to authenticate bid")
				logout();
			else
				alert(text);
		}
	});
	socket.on('outbid notification', function(msg) {
		console.log("THE BEST DEBUGGING CODE");
		if (localStorage["showNotifications"] == null)
			localStorage["showNotifications"] = "true";
		if (localStorage["showNotifications"] === "true") {
			if (document.getElementById("notificationCount").innerHTML == 0)
				document.getElementById("notificationCount").style.display = "block";
			document.getElementById("notificationCount").innerHTML++;
			var notificationsShade = document.getElementById("notificationsShade");
			var _element = document.createElement("div");
			_element.className = "notification";
			_element.id = "notification" + (notificationsShade.childNodes.length - 5);
			_element.style.backgroundColor = ((notificationsShade.childNodes.length) % 2 == 0) ? "rgb(255, 255, 255)" : "rgb(230, 230, 230)";
			_element.innerHTML = "<core-icon class=\"clear\" icon=\"clear\" onclick=\"dismissNotification(" + (notificationsShade.childNodes.length - 5) + ");\"></core-icon><div>You were outbid by an anon. " + decideAnonAnimal(msg.bidder) + "</div><div>The new high bid for item " + convertDBidToLocalID(msg.item) + " is " + parseFloat(msg.price).formatCurrency() + "</div>";
			_element.onclick = createClickHandeler(convertDBidToLocalID(msg.item));
			notificationsShade.insertBefore(_element, notificationsShade.lastChild);

			animLength = 0.6;
			notificationsIcon = document.getElementById("notificationsIcon");
			if (document.getElementById("header").style.transform == "matrix(1, 0, 0, 1, 0, -60)") {
				TweenLite.to(notificationsIcon, animLength, {transform: "translateY(50px)", onComplete: function() {
					TweenLite.to(notificationsIcon, animLength / 5, {transform: "translateY(50px) rotate(30deg)", onComplete: function() {
						TweenLite.to(notificationsIcon, animLength / 5, {transform: "translateY(50px) rotate(-30deg)", onComplete: function() {
							TweenLite.to(notificationsIcon, animLength / 5, {transform: "translateY(50px) rotate(30deg)", onComplete: function() {
								TweenLite.to(notificationsIcon, animLength / 5, {transform: "translateY(50px) rotate(0deg)", onComplete: function() {
									TweenLite.to(notificationsIcon, animLength, {transform: "translateY(0px)", onComplete: function() {
										
									}});
								}});
							}});
						}});
					}});
				}});
			}
			else {
				TweenLite.to(notificationsIcon, animLength / 5, {transform: "rotate(30deg)", onComplete: function() {
					TweenLite.to(notificationsIcon, animLength / 5, {transform: "rotate(-30deg)", onComplete: function() {
						TweenLite.to(notificationsIcon, animLength / 5, {transform: "rotate(30deg)", onComplete: function() {
							TweenLite.to(notificationsIcon, animLength / 5, {transform: "rotate(0deg)", onComplete: function() {

							}});
						}});
					}});
				}});
			}
		}
	});
	socket.on('create account', function(msg) {
		var animLength = 0.5;
		if (msg == "username already taken") {
			var username = document.getElementById("createUsername");
			TweenLite.to(username, animLength, {backgroundColor:"rgb(255, 220, 220)"});
			TweenLite.to(username, animLength, {border:"2px solid rgb(255, 100, 100)"});
		}
		else if (msg == "invalid email") {
			var email = document.getElementById("createEmail");
			TweenLite.to(email, animLength, {backgroundColor:"rgb(255, 220, 220)"});
			TweenLite.to(email, animLength, {border:"2px solid rgb(255, 100, 100)"});
		}
	});
	socket.on('login', function(msg) {
		if (msg.authKey != null) {
			localStorage.setItem("authKey", msg.authKey);
			localStorage.setItem("ID", msg.id);
			localStorage.setItem("username", msg.username);
			document.getElementById("usernameDisplay").innerHTML = localStorage["username"];
			document.getElementById("avatar").src = "https://unicornify.appspot.com/avatar/" + localStorage["ID"] + "?s=128";
			openPreload();
		}
		else {
			localStorage.setItem("authKey", "");
			localStorage.setItem("ID", "");
			showWrongCreds();
			if (msg == "You've failed too many times.") {
				alert("You've failed too many times.");
				console.log("You've failed too many times.");
			}
		}
	});
	socket.on('reconnect', function(msg) {
		if (msg == "rejoined session" || msg.id == localStorage["ID"]) {
			document.getElementById("usernameDisplay").innerHTML = localStorage["username"];
			document.getElementById("avatar").src = "https://unicornify.appspot.com/avatar/" + localStorage["ID"] + "?s=128";
			openPreload();
		}
		else {
			localStorage.setItem("authKey", "");
			localStorage.setItem("ID", "");
			localStorage.setItem("username", "");
			openLogin();
		}
	});
	socket.on('change email', function(msg) {
		if (msg == "Successfully changed email.") {
			closeAccountSettings();
		}
		else {
			var email = document.getElementById("newEmail");
			email.error = msg;
			email.invalid = true;
		}
	});
	socket.on('change password', function(msg) {
		if (msg == "Successfully changed password.") {
			closeAccountSettings();
		}
		else {
			if (msg == "The old password was incorrect.") {
				var password = document.getElementById("oldPassword");
				password.error = msg;
				password.invalid = true;
			}
			else {
				var password = document.getElementById("newPassword");
				password.error = msg;
				password.invalid = true;
				password = document.getElementById("newPasswordAgain");
				password.error = msg;
				password.invalid = true;
			}
		}
	});
};

function createClickHandeler(i) {
	return function() {
		enlargeCard(i);
	};
}

function createMouseDownHandeler(card, entering) {
	return function() {
		if (card.mouseDown == false && !entering) {
			var animLength = 0.3;
			card.dom.style.boxShadow = "0px 25px 41px -5px rgba(0, 0, 0, 0.4)";
			card.mouseDown = true;
		}
	};
}

function createMouseUpHandeler(card, leaving) {
	return function() {
		if (card.mouseDown == true) {
			var animLength = 0.3;
			card.dom.style.boxShadow = "0px 8px 13px -5px rgba(0, 0, 0, 0.5)";
			if (leaving == false)
				card.mouseDown = false;
		}
	};
}

function createImageLoadHandeler(image, i) {
	return function() {
		itemsToLoad--;
		if (itemsToLoad <= 0) {
			if (!rejoinSession())
				openLogin();
		}

		var colorThief = new ColorThief();
		cards[i].averageColor = colorThief.getColor(image);
		cards[i].back = buildCardBack(cards[i]);
	}
}

function decideAnonAnimal (ID) {
	ID = "a" + ID;
	if (anonAnimalsReference[ID] == null) {
		var i = 0;
		anonAnimalsReference[ID] = anonAnimals[Object.keys(anonAnimalsReference).length];
	}
	return anonAnimalsReference[ID];
}

function convertDBidToLocalID(ID) {
	for (var i = 0; i < cards.length; i++) {
		if (cards[i].ID == ID)
			return cards[i].index;
	}
	return -1;
}

function buildCardBack(card) {
	var bidHistory = "";
	for (var i = card.bidHistory.length - 1; i >= 0; i--) {
		bidHistory += "<div class=\"bidPrice\" style=\"background-color:" + ((i % 2 == 0) ? "rgb(255, 255, 255)" : "rgb(230, 230, 230)") + ";\">" + parseFloat(card.bidHistory[i].bid).formatCurrency() + "<span class=\"bidderName\">" + ((card.bidHistory[i].bidder == localStorage["ID"]) ? "You" : ("Anonymous " + decideAnonAnimal(card.bidHistory[i][1]))) + "</span></div>";
	}
	
	return  "<div class=\"cardBack\" style=\"background-color:rgb(" + card.averageColor[0] + "," + card.averageColor[1] + "," + card.averageColor[2] + ");\">" +
				"<div class=\"cardNavBar\">" +
					"<paper-icon-button class=\"backArrow\" icon=\"arrow-back\" id=\"paper_icon_button\" onclick=\"shrinkCards();\"></paper-icon-button>" +
				"</div>" +
				"<div class=\"picture\" style=\"background-image:url(" + card.image + ");\" ></div>" +
				"<div class=\"info\">" +
					"<div class=\"name\">" + card.name + "</div>" +
					"<div class=\"artist\">" + card.artist + "</div>" +
					"<div class=\"description\">" + card.description + "</div>" +
					"<div id=\"bidInfo\">" +
						"<form id=\"placeBidForm\" action=\"#\" method=\"POST\" enctype=\"multipart/form-data\">" +
							"<input type=\"number\" class=\"textbox\" id=\"dollarAmount\" name=\"dollarAmount\" placeholder=\"0.00\" value=\"" + card.calculateDefaultBid() + "\" onchange=\"parseFloat(this.value).formatCurrency()\"/>" +
							"<input id=\"placeBidButton\" type=\"submit\" class=\"submitButton\" value=\"Place bid\" onclick=\"placeBid(\'" + card.index + "\'); return false;\" />" +
						"</form>" +
						"<div id=\"bidHistory\">" +
							bidHistory +
						"</div>" +
					"</div>" +
				"</div>" +
				/*"<div class=\"background\" style=\"background-image:url(" + card.image + ")\">" + */
				"<div class=\"background\">" + 
			"</div>";
}

function rejoinSession() {
	if (localStorage["ID"] != "" && localStorage["authKey"] != "" && localStorage["ID"] != null && localStorage["authKey"] != null) {
		console.log("attempting to rejoin");
		socket.emit('reconnect to session', {id: localStorage["ID"], authKey: localStorage["authKey"]});
		return true;
	}
	else return false;
}

function login() {
	socket.emit('login', {username: document.getElementById("username").value, password: document.getElementById("password").value});
}

function logout() {
	socket.emit('logout', {ID: localStorage["ID"], authKey: localStorage["authKey"]});
	localStorage.clear();
	location.reload();
}

function createAccount() {
	socket.emit('create account', {username: document.getElementById("createUsername").value, email: document.getElementById("createEmail").value, password: document.getElementById("createPassword").value});
}

function openPreload() {
	var animLength = 0.5;
	var loaderIconRing = document.getElementById("loaderIconRing");
	TweenLite.to(loaderIconRing, animLength / 2, {opacity: 0});
	var backLeft = document.getElementById("loaderBackLeft");
	TweenLite.to(backLeft, animLength, {left:window.innerWidth + 278/2});
	var backRight = document.getElementById("loaderBackRight");
	TweenLite.to(backRight, animLength, {right:("100%")});
	var loginTools = document.getElementById("loginTools");
	TweenLite.to(loginTools, animLength / 2, {opacity: 0, onComplete:function(){loginTools.style.display = "none";}});
	var createAccountTools = document.getElementById("createAccountTools");
	TweenLite.to(createAccountTools, animLength / 2, {opacity: 0, onComplete:function(){createAccountTools.style.display = "none";}});
	var icon = document.getElementById("loaderIcon");
	TweenLite.to(icon, animLength, {left:(window.innerWidth/2 + 278/2), onComplete:function(){document.getElementById("loader").style.display = "none";}});
}

function openLogin() {
	var icon = document.getElementById("loaderIcon");
	TweenLite.to(icon, 1, {top:(-(window.innerHeight/2 - 270))});
	var loaderIconRing = document.getElementById("loaderIconRing");
	TweenLite.to(loaderIconRing, 1, {opacity: 0});
	var loginTools = document.getElementById("loginTools");
	loginTools.style.display = "block";
	loginTools.style.position = "absolute";
	loginTools.style.left = window.innerWidth/2 - loginTools.offsetWidth/2;
	loginTools.style.top = window.innerHeight/2 - loginTools.offsetHeight/2 - 100;
	TweenLite.to(loginTools, 1, {opacity: 1});
	TweenLite.to(loginTools, 1, {top: window.innerHeight/2 + 20, onComplete:function(){loginTools.style.zIndex = "102";}});
}

function openNewUser() {
	var animLength = 0.5;
	var loginTools = document.getElementById("loginTools");
	var createAccountTools = document.getElementById("createAccountTools");
	createAccountTools.style.top = loginTools.offsetTop;
	loginTools.style.left = "auto";
	loginTools.style.right = window.innerWidth / 2 - loginTools.offsetWidth / 2;
	TweenLite.to(loginTools, animLength, {right: "100%", ease:Cubic.easeIn, onComplete:function(){loginTools.style.display = "none";}});
	TweenLite.to(createAccountTools, animLength, {left: window.innerWidth / 2 - createAccountTools.offsetWidth / 2, ease:Cubic.easeOut, onComplete:function(){createAccountTools.style.zIndex = "102";}});
}

function showWrongCreds() {
	var animLength = 0.5;
	var username = document.getElementById("username");
	var password = document.getElementById("password");
	TweenLite.to(username, animLength, {backgroundColor:"rgb(255, 220, 220)"});
	TweenLite.to(password, animLength, {backgroundColor:"rgb(255, 220, 220)"});
	TweenLite.to(username, animLength, {border:"2px solid rgb(255, 100, 100)"});
	TweenLite.to(password, animLength, {border:"2px solid rgb(255, 100, 100)"});
}

function openAccountSettings() {
	if (notificationsExpanded)
		expandNotifications();
	if (overflowExpanded)
		expandOverflow();

	if (localStorage["showNotifications"] == null)
		localStorage["showNotifications"] = "true";
	document.getElementById("receiveAlerts").checked = localStorage["showNotifications"] === "true";

	var animLength = 0.2;
	var accountSettings = document.getElementById("accountSettings");
	accountSettings.style.display = "block";
	TweenLite.to(accountSettings, animLength, {opacity: 1});
	TweenLite.to(accountSettings, animLength, {transform: "scale(1)"});
}

function closeAccountSettings() {
	var animLength = 0.2;
	var accountSettings = document.getElementById("accountSettings");
	TweenLite.to(accountSettings, animLength, {opacity: 0});
	TweenLite.to(accountSettings, animLength, {transform: "scale(0.5)", onComplete: function() {
		accountSettings.style.display = "none";
		document.getElementById("oldPassword").value = "";
		document.getElementById("newEmail").value = "";
		document.getElementById("newPassword").value = "";
		document.getElementById("newPasswordAgain").value = "";
	}});
}

function cancelAccountSettings() {
	closeAccountSettings();
}

function saveAccountSettings() {
	if (document.getElementById("oldPassword").value != "") {
		if (document.getElementById("newEmail").value != "")
			updateEmail();
		if (document.getElementById("newPassword").value != "" && document.getElementById("newPassword").value == document.getElementById("newPasswordAgain").value)
			updatePassword();
		if (document.getElementById("receiveAlerts").checked != (localStorage["showNotifications"] === "true"))
			updateNotifications(document.getElementById("receiveAlerts").checked);
		if (document.getElementById("newPassword").value != document.getElementById("newPasswordAgain").value) {
			var password = document.getElementById("newPassword");
			password.error = "Passwords do not match";
			password.invalid = true;
			password = document.getElementById("newPasswordAgain");
			password.error = "Passwords do not match";
			password.invalid = true;
		}
	} else {
		document.getElementById("oldPassword").error = "Please enter password";
		document.getElementById("oldPassword").invalid = true;
		document.getElementById("oldPassword").focus();
	}
}

function expandNotifications() {
	if (overflowExpanded)
		expandOverflow();

	var animLength = 0.1;
	var nb = document.getElementById("notificationsShade");
	if (notificationsExpanded) {
		TweenLite.to(nb, animLength, {height: "0px"});
		TweenLite.to(nb, animLength, {width: "100px"});
	} else {
		TweenLite.to(nb, animLength, {height: "400px"});
		TweenLite.to(nb, animLength, {width: "400px"});
	}
	notificationsExpanded = !notificationsExpanded;
}

function dismissNotification (ID) {
	var animLength = 0.3;
	if (ID == -1) {
		var notifications = document.getElementById("notificationsShade").childNodes;
		document.getElementById("notificationCount").innerHTML = 0;
		for (var i = 0; i < notifications.length; i++) {
			if (notifications[i].id != null && notifications[i].id.indexOf("notification") != -1) {
				console.log(document.getElementById(notifications[i].id));
				TweenLite.to(document.getElementById(notifications[i].id), animLength, {transform: "translate(400px, 0px)", onComplete: dismissNotificationHadenler(notifications, i)});
				// i--;
			}
		}
	} else {
		document.getElementById("notificationCount").innerHTML--;
		TweenLite.to(document.getElementById("notification" + ID), animLength, {transform: "translate(400px, 0px)", onComplete: function(){
			document.getElementById("notificationsShade").removeChild(document.getElementById("notification" + ID));
		}});
	}
	if (document.getElementById("notificationCount").innerHTML == 0)
		document.getElementById("notificationCount").style.display = "none";
}

function dismissNotificationHadenler (notifications, i) {
	return function() {
		console.log(i);
		console.log("we need to remove " + notifications[i].id);
		document.getElementById("notificationsShade").removeChild(document.getElementById(notifications[i].id));
	};
}

function expandOverflow() {
	if (notificationsExpanded)
		expandNotifications();

	var animLength = 0.1;
	var nb = document.getElementById("overflowShade");
	if (overflowExpanded) {
		TweenLite.to(nb, animLength, {height: "0px"});
		TweenLite.to(nb, animLength, {width: "100px"});
	} else {
		TweenLite.to(nb, animLength, {height: "128px"});
		TweenLite.to(nb, animLength, {width: "250px"});
	}
	overflowExpanded = !overflowExpanded;
}

function searchItems(token) {
	token = token.toLowerCase();
	if (token.length == 0) {
		for(var i = 0; i < cards.length; i++) {
			cards[i].dom.style.display = "inline-block";
		}
		return;
	}
	for(var i = 0; i < cards.length; i++) {
		cards[i].dom.style.display = "none";
	}
	for(var i = 0; i < cards.length; i++) {
		if ((cards[i].name.toLowerCase().indexOf(token) > -1) || (cards[i].artist.toLowerCase().indexOf(token) > -1) || (cards[i].description.toLowerCase().indexOf(token) > -1))
			cards[i].dom.style.display = "inline-block";
	}
}

function enlargeCard(id) {
	if (notificationsExpanded)
		expandNotifications();
	if (overflowExpanded)
		expandOverflow();

	var card = cards[id];
	card.back = buildCardBack(card);
	var container = document.getElementById("auctionItems");
	card.posFixed[0] = card.dom.offsetLeft + container.offsetLeft - 20;
	card.posFixed[1] = card.dom.offsetTop + container.offsetTop - 20 - window.pageYOffset;
	card.posFixed[2] = window.innerWidth - (card.posFixed[0] + card.dom.offsetWidth) - 55;
	card.posFixed[3] = window.innerHeight - (card.posFixed[1] + card.dom.offsetHeight) - 40 - window.pageYOffset;
	var animLength = 0.3;
	card.dom.style.position = "fixed";
	card.dom.style.width = "auto";
	card.dom.style.height = "auto";
	card.dom.style.zIndex = 1000;
	card.dom.style.cursor = "pointer";
	card.dom.style.left = card.posFixed[0];
	card.dom.style.top = card.posFixed[1];
	card.dom.style.right = card.posFixed[2];
	card.dom.style.bottom = card.posFixed[3];
	card.dom.onclick = null;
	blankCardPointer = document.getElementById("auctionItems").insertBefore(blankCard, card.dom);
	TweenLite.to(card.dom, animLength, {left: "-20px"});
	TweenLite.to(card.dom, animLength, {right: "-20px"});
	TweenLite.to(card.dom, animLength, {bottom: "-20px"});
	TweenLite.to(card.dom, animLength, {top: "-20px"});
	TweenLite.to(card.dom, animLength, {borderRadius: "0px"});
	
	TweenLite.to(document.getElementById("header"), animLength, {transform: "translate(0px, -60px)"});
	TweenLite.to(card.dom, animLength / 2, {transform: "rotateY(90deg)", onComplete:function(){
		card.dom.innerHTML = card.back;
		card.dom.style.transform = "rotateY(-90deg)";
		document.getElementById("placeBidButton").onclick = function() {
			socket.emit('new bid', {itemID: id, _id: cards[id].ID, bid: document.getElementById("dollarAmount").value, bidder: localStorage["ID"], authKey: localStorage["authKey"]});
			return false;
		};
		TweenLite.to(card.dom, animLength / 2, {transform: "rotateY(0deg)"});
	}});
}

function shrinkCard(id) {
	var card = cards[id].dom;
	var animLength = 0.3;
	if (card.innerHTML != cards[id].front) {
		cards[id].back = cards[id].dom.innerHTML;
		TweenLite.to(card, animLength, {left: cards[id].posFixed[0]});
		TweenLite.to(card, animLength, {top: cards[id].posFixed[1]});
		TweenLite.to(card, animLength, {right: cards[id].posFixed[2]});
		TweenLite.to(card, animLength, {bottom: cards[id].posFixed[3], onComplete:function(){
			document.getElementById("auctionItems").removeChild(blankCardPointer);
			card.style.position = "relative";
			card.style.width = "200";
			card.style.height = "280";
			card.style.zIndex = "auto";
			card.style.cursor = "hand";
			card.style.left = "auto";
			card.style.top = "auto";
			card.style.right = "auto";
			card.style.bottom = "auto";
			card.onclick = function(){enlargeCard(id);};
		}});
		TweenLite.to(card, animLength, {borderRadius: "5px"});
		TweenLite.to(card, animLength / 2, {transform: "rotateY(90deg)", onComplete:function(){
			card.innerHTML = cards[id].front;
			TweenLite.to(card, animLength / 2, {transform: "rotateY(0deg)"});
		}});
	}
}

function shrinkCards() {
	TweenLite.to(document.getElementById("header"), 0.3, {transform: "translate(0px, 0px)"});
	// var card = document.getElementById("auctionItems").childNodes;
	for (var i = 0; i < cards.length; i++) {
		shrinkCard(i);
	}
}

function updateEmail() {
	socket.emit('change email', {ID: localStorage["ID"], authKey: localStorage["authKey"], username: localStorage["username"], password: document.getElementById("oldPassword").value, email: document.getElementById("newEmail").value});
}

function updatePassword() {
	socket.emit('change password', {ID: localStorage["ID"], authKey: localStorage["authKey"], username: localStorage["username"], password: document.getElementById("oldPassword").value, newPassword: document.getElementById("newPassword").value});
}

function updateNotifications (showNotifications) {
	localStorage["showNotifications"] = showNotifications;
	closeAccountSettings();
}













Number.prototype.formatCurrency = function(){
	var num = this;
	num += ((num + "").split(".").length == 2) ? 0 : ".00";
	num = ((num + "").split(".")[1].length == 1) ? (num + "").split(".")[0] + "." + (num + "").split(".")[1][0] + "0" : num;
	num = ((num + "").split(".")[1].length > 2) ? (num + "").split(".")[0] + "." + (num + "").split(".")[1][0] + (num + "").split(".")[1][1] : num;
	return "$" + num;
}