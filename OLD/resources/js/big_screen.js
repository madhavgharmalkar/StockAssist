var CURRENCY = "$";

var cards = [];

var socket;

window.onload = function () {
    openPreload();
    
    var card = document.getElementById("auctionItems").childNodes;
    for (var i = 0; i < card.length; i++) {
        cards[i] = {};
        cards[i].index = i;
		cards[i].dom = card[i];
		cards[i].front = card[i].innerHTML;
		cards[i].image = cards[i].front.split("style=\"background-image:url(")[1].split(");\">")[0];
		cards[i].name = cards[i].front.split("<div class=\"name\">")[1].split("</div>")[0];
		cards[i].artist = cards[i].front.split("<div class=\"artist\">")[1].split("</div>")[0];
		cards[i].description = cards[i].front.split("<div class=\"description\">")[1].split("</div>")[0];
        var container = document.getElementById("auctionItems");
        cards[i].posFixed = [];
        cards[i].posFixed[0] = card[i].offsetLeft + container.offsetLeft - 20;
        cards[i].posFixed[1] = card[i].offsetTop + container.offsetTop - 20 - window.pageYOffset;
        cards[i].posFixed[2] = window.innerWidth - (cards[i].posFixed[0] + card[i].offsetWidth) - 55;
        cards[i].posFixed[3] = window.innerHeight - (cards[i].posFixed[1] + card[i].offsetHeight) - 40 + window.pageYOffset;
        cards[i].calculateDefaultBid = function() {
        var defaultBid = (this.bidHistory.length > 1) ? Math.ceil(parseFloat(this.bidHistory[this.bidHistory.length - 1]) + (this.bidHistory[this.bidHistory.length - 1] - this.bidHistory[this.bidHistory.length - 2])) : Math.ceil(parseFloat(this.bidHistory[this.bidHistory.length - 1]) + 1);
    defaultBid = (defaultBid - parseFloat(this.bidHistory[this.bidHistory.length - 1]) < 1) ? Math.ceil(parseFloat(this.bidHistory[this.bidHistory.length - 1]) + 1) : defaultBid;
            return defaultBid;
        };
        cards[i].front = buildCard(cards[i]);
		cards[i].dom.innerHTML = cards[i].front;
		var colorThief = new ColorThief();
		var _image = document.createElement("img");
    	_image.src = cards[i].image;
		cards[i].averageColor = colorThief.getColor(_image);
		var _blurImage = document.createElement("div");
		_blurImage.className = "background";
		_blurImage.style.backgroundImage = "url(" + cards[i].image + ")";
		cards[i].dom.style.backgroundColor = "rgb(" + cards[i].averageColor[0] + "," + cards[i].averageColor[1] + "," + cards[i].averageColor[2] + ")";
		cards[i].dom.appendChild(_blurImage);
    }
	
	var style = cards[0].dom.currentStyle || window.getComputedStyle(cards[0].dom);
	document.getElementById("auctionItems").style.width = cards.length * (cards[0].dom.offsetWidth + (style.marginLeft.split("px")[0] * 2));
	
    if (socket == null)
        socket = io.connect("http://" + window.location.hostname + ":22846");
    socket.on('new bid', function(text) {
        msg = {};
        msg.id = text.split(";")[0];
        msg.bid = text.split(";")[1];
        msg.bidder = text.split(";")[2];
        cards[msg.id].bidHistory[cards[msg.id].bidHistory.length] = msg.bid;
        var bidList = cards[msg.id].dom.getElementsByClassName("bidHistory")[0];
        var _element = document.createElement("div");
        _element.className = "bidPrice";
        _element.style.backgroundColor = ((cards[msg.id].bidHistory.length - 1) % 2 == 0) ? "rgb(255, 255, 255)" : "rgb(230, 230, 230)";
        _element.appendChild(document.createTextNode(parseFloat(cards[msg.id].bidHistory[cards[msg.id].bidHistory.length - 1]).formatCurrency()));
        bidList.insertBefore(_element, bidList.firstChild);
    });
    
	setInterval(scroller, 1000/60);
};

var scrollingBack = false;

function scroller() {
	if (window.pageXOffset < document.getElementById("auctionItems").style.width.split("px")[0] - window.innerWidth && !scrollingBack)
		window.scrollTo(window.pageXOffset + 3, 0);
	else {
		window.scrollTo(window.pageXOffset - 300, 0);
		if (window.pageXOffset <= 0)
			scrollingBack = false;
		else
			scrollingBack = true;
	}
}

function buildCard(card) {
    retrieveBidHistory(card.index);
    var bidHistory = "";
    for (var i = card.bidHistory.length - 1; i >= 0; i--) {
        bidHistory += "<div class=\"bidPrice\" style=\"background-color:" + ((i % 2 == 0) ? "rgb(255, 255, 255)" : "rgb(230, 230, 230)") + ";\">" + parseFloat(card.bidHistory[i]).formatCurrency() + "</div>";
    }
    
	return "<img class=\"picture\" style=\"background-image:url(" + card.image + ");\" />" +
            "<div class=\"info\">" +
                "<div class=\"name\">" + card.name + "&nbsp;" +
                	"<div class=\"artist\">" + card.artist + "</div><div class=\"index\">&nbsp;Item " + (card.index + 1) + "</div>" +
				"</div>" +
                "<div id=\"bidInfo\">" +
                    "<div id=\"bidHistory\" class=\"bidHistory\">" +
                        bidHistory +
                    "</div>" +
                "</div>" +
            "</div>";
}

function retrieveBidHistory(id) {
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			cards[id].bidHistory = [];
            cards[id].bidHistory = xmlhttp.responseText.split(",");
		}
	}
	xmlhttp.open("POST","/account/getBidHistory.php",false);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("id" + id);
}

function openPreload() {
    var animLength = 0.5;
    var loaderIconRing = document.getElementById("loaderIconRing");
    TweenLite.to(loaderIconRing, animLength / 2, {opacity: 0});
    var backLeft = document.getElementById("loaderBackLeft");
    TweenLite.to(backLeft, animLength, {left:window.innerWidth + 278/2});
    var backRight = document.getElementById("loaderBackRight");
    TweenLite.to(backRight, animLength, {right:("100%")});
    var icon = document.getElementById("loaderIcon");
    TweenLite.to(icon, animLength, {left:(window.innerWidth/2 + 278/2), onComplete:function(){document.getElementById("loader").style.display = "none";}});
}












Number.prototype.formatCurrency = function(){
    var num = this;
    num += ((num + "").split(".").length == 2) ? 0 : ".00";
    num = ((num + "").split(".")[1].length == 1) ? (num + "").split(".")[0] + "." + (num + "").split(".")[1][0] + "0" : num;
    num = ((num + "").split(".")[1].length > 2) ? (num + "").split(".")[0] + "." + (num + "").split(".")[1][0] + (num + "").split(".")[1][1] : num;
    return "$" + num;
}