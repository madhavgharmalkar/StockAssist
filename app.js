var express = require('express');
var http = require('http');
var regex = require('regex');
var sentiment = require('sentiment');
var app = express();

var Twitter = require('twitter');




var NYAPI = "96eee87805b52505214d67bf11fbd6f:19:73466433";
var urlreg = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

var client = new Twitter({
	consumer_key: 'kD5XhDRiIIUiNYRBscq6kX2Md',
	consumer_secret: 'YM42rHYRwpjbsVnouby8hMGVzIwsM9K3cmL9QSDO6LZDXCkP6E',
	access_token_key: '1187755194-pGYjl11NT1WIEFG79lD4sDxtdpz4bv9nso1UYU1',
	access_token_secret: 'reaw9i6pf2HzcY47m4lOCUHrjGaKN0sbUQW5Nsl3XvCKZ'
});


//Specify a port
var port = process.env.port || 3000;

//Serve up files in public folder
app.use('/', express.static(__dirname + '/public'));

app.get('/nyt', function(req, res) {

	var options = {
		url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json',
		method: 'GET',
		headers: headers,
		qs: {q: req.query.q, 'key2': 'yyy'}
	}

});

app.get("/twitter", function(req ,res){
	client.get('search/tweets', {q: req.query.q, lang: "en", count: 1000}, function(error, tweets, response){
		results = [];

		var positive = 0; var negative = 0; var probs = 0;
		var totalNegative = 0;

		for (var i = 0; i < tweets.statuses.length; i++) {
			var text = tweets.statuses[i].text;
			var noURL = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
			var analyse = sentiment(noURL);


			if(analyse.score>0){
				positive += 1;
				probs += analyse.comparative;
			} else if (analyse.score < 0){
				negative += 1;
				probs -= analyse.comparative;
				totalNegative += analyse.comparative;
			}


			// console.log(tweets.statuses[i].text.replace(urlreg,""));
		}
		// res.send(tweets.statuses);

		var prediction = "";

		if((positive-negative)>(.33	*(positive+negative))){
			prediction += "You should buy this stock. Current tweets show that people around the world are interested and excited in this porduct.";
		} else if ((negative-positive)>(.10*(positive+negative))){
			prediction += "You should sell this stock. Current tweets show that people pessimistic about this company and it's prodcuts.";
		} else {
			prediction += "Just sit tight and hold on to your stock"
		} 

		prediction += "%0D%0AStockAssist is making this prediction with a " + 100*probs/(positive + negative) + "% degree of confidence";

		res.send({
			positive: positive,
			negative: negative,
			probabilities: (1+totalNegative/negative),
			prediction: prediction
		});
	});
});

//Start up the website
app.listen(port);
console.log('Listening on port: ', port);