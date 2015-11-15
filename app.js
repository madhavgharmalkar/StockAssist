var express = require('express');
var app = express();

//Specify a port
var port = process.env.port || 3000;

//Serve up files in public folder
app.use('/', express.static(__dirname + '/public'));

//Start up the website
app.listen(port);
console.log('Listening on port: ', port);