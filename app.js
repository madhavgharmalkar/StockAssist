var express = require('express');
var regex = require('regex');
var sentiment = require('sentiment');
var app = express();

var Twitter = require('twitter');

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


app.get("/twitter", function(req ,res){
	client.get('search/tweets', {q: req.query.q, lang: "en", count: 30}, function(error, tweets, response){
		results = [];
		for (var i = 0; i < tweets.statuses.length; i++) {
			var text = tweets.statuses[i].text;
			var noURL = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
			var analyse = sentiment(noURL);

			results.push({
				score: analyse.score,
				comparative: analyse.comparative,
				words: analyse.words,
				positive: analyse.positive,
				negative: analyse.negative
			});

			// console.log(tweets.statuses[i].text.replace(urlreg,""));
			}
		// res.send(tweets.statuses);
		res.send(results);
	});
});


//Start up the website
app.listen(port);
console.log('Listening on port: ', port);