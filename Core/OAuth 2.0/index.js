var express     = require('express');
var request     = require('request');
var mongoose 	= require('mongoose');
var ApiProvider = require('./app/models/apiprovider.js');
var app 	    = express();
var port   	    = process.env.PORT || 8080;
var db 		 	= mongoose.connection;
var bodyParser  = require('body-parser');

mongoose.connect('mongodb://localhost/oauth2');

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
// routes ============================================================
require('./app/routes.js')(app, ApiProvider, request); // load our routes and pass in our app

app.listen(port);
console.log('oauth2 demo app is online on ' + port);