// bpPetyAIXwms#X&


var fs = require('fs');
// Setup some https server options
var https_options = {
  key: fs.readFileSync('/Users/DudeOfAwesome/github/Auctioneer/Web/certificates/key.pem').toString(),
  cert: fs.readFileSync('/Users/DudeOfAwesome/github/Auctioneer/Web/certificates/cert.pem').toString()
};

var app = require('express')();
var server = require('https').Server(https_options, app);
var io = require('socket.io')(server);
var bcrypt = require('bcrypt-nodejs');

var DATE = new Date();


var databaseUrl = "mongodb://localhost:27017/Auctioneer"; // "username:password@example.com/mydb"
var collections = ["users", "userSettings", "items", "auctions"]
var db = require("mongojs").connect(databaseUrl, collections);

var userSessions = [];
var failedAuthAttempts = [];
var disabledSocketIDs = [];

io.on('connection', function(socket){
	console.log("new user connected");
	socket.on('get auction items', function(msg) {
		console.log("get auction items");
		db.items.find(function(err, items) {
			if( err || !items || items.length == 0) io.to(socket.id).emit('get auction items', "No items were found.");
			else {
				io.to(socket.id).emit('get auction items', items);
			}
		});
	});
	socket.on('login', function(msg){
		console.log("user trying to login");
		stopBruteForce(msg.username);
		if (disabledSocketIDs[msg.username] != null) {
			if (DATE.getTime() < disabledSocketIDs[msg.username]) {
				console.log("A user tried to log in too many times");
				io.to(socket.id).emit('login', "You've failed too many times.");
				return;
			}
			else {
				disabledSocketIDs[msg.username] = null;
			}
		}
		db.users.find({username: msg.username}, function(err, users) {
			if( err || !users || users.length == 0) io.to(socket.id).emit('login', "failed to authenticate login");
			else {
				if (comparePassword(users[0].password, msg.password)) {
					var sesh = {}
					sesh.id = users[0]._id;
					sesh.authKey = determineAuthKey(sesh.id);
					sesh.username = msg.username;
					sesh.socketID = socket.id;
					userSessions[sesh.id] = sesh;
					failedAuthAttempts[msg.username] = null;
					console.log(sesh.username + " is logging in.");
					io.to(socket.id).emit('login', {authKey: sesh.authKey, id: sesh.id, username: sesh.username});
				} else {
					io.to(socket.id).emit('login', "failed to authenticate login");
				}
			}
		});
	});
	socket.on('reconnect to session', function(msg){
		console.log("user trying to reconnect");
		if (userSessions[msg.id] != null && userSessions[msg.id].authKey == msg.authKey) {
			userSessions[msg.id].socketID = socket.id;
			io.to(socket.id).emit('reconnect', "rejoined session");
		} else {
			io.to(socket.id).emit('reconnect', "failed to rejoin session");
		}
	});
	socket.on('logout', function(msg){
		console.log("logout");
		if (userSessions[msg.ID] != null && userSessions[msg.ID].authKey == msg.authKey)
				userSessions[msg.ID] = null;
	});
	socket.on('create account', function(msg){
		console.log("create account");
		db.users.find({username: msg.username}, function(err, users) {
			//verify there are no other users with username and that the email is valid
			if (users.length == 0 && validateEmail(msg.email)) {
				db.users.save({username: msg.username, password: hashPassword(msg.password), email: msg.email}, function(err, saved) {
					if( err || !saved ) console.log("User not created");
					else {
						var sesh = {}
						sesh.authKey = determineAuthKey(saved._id);
						sesh.id = saved._id;
						sesh.username = saved.username;
						userSessions[sesh.id] = sesh;
						io.to(socket.id).emit('login', {authKey: sesh.authKey, id: sesh.id, username: sesh.username});
						console.log("User created");
					}
				});
			} else {
				if (users.length != 0)
					io.to(socket.id).emit('create account', "username already taken");
				else if (!validateEmail(msg.email))
					io.to(socket.id).emit('create account', "invalid email");
			}
		});
	});
	socket.on('change email', function(msg){
		console.log("change email");
		stopBruteForce(msg.ID);
		if (disabledSocketIDs[msg.ID] != null) {
			if (DATE.getTime() < disabledSocketIDs[msg.ID]) {
				io.to(socket.id).emit('change email', "Failed to authenticate email change. You've been locked out.");
				return;
			}
			else {
				disabledSocketIDs[msg.ID] = null;
			}
		}
		if (userSessions[msg.ID] != null && userSessions[msg.ID].authKey == msg.authKey) {
			db.users.find({_id: db.ObjectId(msg.ID)}, function(err, users) {
				if (validateEmail(msg.email) && users[0].username == msg.username && comparePassword(users[0].password, msg.password)) {
					db.users.update({_id: db.ObjectId(msg.ID)}, {$set: {email: msg.email}});
					io.emit('change email', "Successfully changed email.");
				} else {
					io.to(socket.id).emit('change email', "The email you entered was not valid.");
				}
				failedAuthAttempts[msg.ID] = null;
			});
		} else {
			io.to(socket.id).emit('change email', "Failed to authenticate email change.");
		}
	});
	socket.on('change password', function(msg){
		console.log("change password");
		stopBruteForce(msg.ID);
		if (disabledSocketIDs[msg.ID] != null) {
			if (DATE.getTime() < disabledSocketIDs[msg.ID]) {
				io.to(socket.id).emit('change password', "Failed to authenticate password change. You've been locked out.");
				return;
			}
			else {
				disabledSocketIDs[msg.ID] = null;
			}
		}
		if (userSessions[msg.ID] != null && userSessions[msg.ID].authKey == msg.authKey) {
			db.users.find({_id: db.ObjectId(msg.ID)}, function(err, users) {
				if (users[0].username == msg.username && comparePassword(users[0].password, msg.password) && validatePassword(msg.newPassword) == true) {
					db.users.update({_id: db.ObjectId(msg.ID)}, {$set: {password: hashPassword(msg.newPassword)}});
					io.emit('change password', "Successfully changed password.");
				} else {
					var validateResponse = validatePassword(msg.newPassword);
					if (validateResponse != true)
						io.to(socket.id).emit('change password', validateResponse);
					else
						io.to(socket.id).emit('change password', "The old password was incorrect.");
				}
				failedAuthAttempts[msg.ID] = null;
			});
		} else {
			io.to(socket.id).emit('change password', "Failed to authenticate password change.");
		}
	});
	socket.on('new bid', function(msg){
		console.log("new bid");
		// msg.itemID = text[0];
		// msg._id = text[1];
		// msg.bid = text[2];
		// msg.bidder = text[3];
		// msg.authKey = text[4];
		stopBruteForce(msg.bidder)
		if (disabledSocketIDs[msg.bidder] != null) {
			if (DATE.getTime() < disabledSocketIDs[msg.bidder]) {
				io.to(socket.id).emit('new bid', "You've failed too many times.");
				return;
			}
			else {
				disabledSocketIDs[msg.bidder] = null;
			}
		}
		// verify user session
		if (userSessions[msg.bidder] != null && userSessions[msg.bidder].authKey == msg.authKey){
			// this still needs lots of work!
			db.items.find({_id: db.ObjectId(msg._id)}, function(err, items) {
				if (parseFloat(msg.bid) > parseFloat(items[0].bidHistory[items[0].bidHistory.length - 1][0])) {
					// send outbid notification
					if (userSessions[items[0].bidHistory[items[0].bidHistory.length - 1][1]] != null) {
						io.to(userSessions[items[0].bidHistory[items[0].bidHistory.length - 1][1]].socketID).emit('outbid notification', {item: msg._id, price: msg.bid, bidder: msg.bidder});
					}
					db.items.update({_id: db.ObjectId(msg._id)}, {$push: {bidHistory: [msg.bid, msg.bidder]}});
					io.emit('new bid', {itemID: msg.itemID, bid: msg.bid, bidder: msg.bidder});
				} else {
					io.to(socket.id).emit('new bid', "Your bid was not above the current high bid.");
				}
				failedAuthAttempts[msg.bidder] = null;
			});
		} else
			io.to(socket.id).emit('new bid', "failed to authenticate bid");
	});
});

// TODO extract auth functionality to separate function that takes an ID and authKey
function authenticateIDauthKey (ID, authKey) {
	stopBruteForce(ID);
	if (disabledSocketIDs[msg.bidder] != null) {
		if (DATE.getTime() < disabledSocketIDs[msg.bidder]) {
			return false;
		}
		else {
			disabledSocketIDs[msg.bidder] = null;
		}
	}
	// verify user session
	if (userSessions[msg.bidder] != null && userSessions[msg.bidder].authKey == msg.authKey)
		return true;
	else
		return false;
}

function authenticateUsernamePass (ID, authKey) {
	stopBruteForce(ID);
	if (disabledSocketIDs[msg.bidder] != null) {
		if (DATE.getTime() < disabledSocketIDs[msg.bidder]) {
			return false;
		}
		else {
			disabledSocketIDs[msg.bidder] = null;
		}
	}
	// verify user session
	if (userSessions[msg.bidder] != null && userSessions[msg.bidder].authKey == msg.authKey)
		return true;
	else
		return false;
}

function stopBruteForce(ID) {
	if (failedAuthAttempts[ID] == null) {
		failedAuthAttempts[ID] = 1;
	}
	else if (disabledSocketIDs[ID] == null) {
		failedAuthAttempts[ID]++;
		if (failedAuthAttempts[ID] > 10) {
			//keep the user from trying to log in again for a while
			disabledSocketIDs[ID] = DATE.getTime() + (5 * 60 * 1000);
		}
	}
}

function determineID(username) {
	var id = "";
	db.users.find({username: username}, function(err, users) {
		if( err || !users) console.log(err);
		else
			id = users[0]._id
	});
	return id;
}

function determineAuthKey(id) {
	var key = 0;
	for (var i = 0; i < 32; i++)
		key += Math.floor(Math.random() * 10) * Math.pow(10, i);
	return id + key;
}

function validateEmail(email) {
	var hasAtAndDot = email.indexOf("@") != -1 && email.indexOf(".") != -1;
	var atAndDotSeparated = email.indexOf(".") - email.indexOf("@") > 1;
	if (hasAtAndDot && atAndDotSeparated) {
		return true;
	} else
		return false;
}

function validatePassword(password) {
	var longEnough = password.length >= 8;
	var shortEnough = password.length <= 32;
	// var regExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/;
	// var hasCorrectChars = password.match(regExp);
	var hasDigits = password.match(/\d/) != null;
	var hasLetters = password.match(/[a-zA-Z]/) != null;
	console.log(password + " = " + longEnough + " " + shortEnough + " " + hasDigits + " " + hasLetters);
	if (longEnough && shortEnough && hasDigits && hasLetters)
		return true;
	else {
		if (!longEnough)
			return "Password is too short.";
		if (!shortEnough)
			return "Password is too long.";
		if (!hasDigits)
			return "Password must have numbers";
		if (!hasLetters)
			return "Password must have letters.";
	}
}

function hashPassword (password) {
	return bcrypt.hashSync(password);
}

function comparePassword (correct, testing) {
	return bcrypt.compareSync(testing, correct);
}





server.listen(22846, function(){
 	console.log('listening on *:22846');
});