var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var passportConfig = require('./config/passportConfig.js');

//==================================================================
// Define the strategy to be used by PassportJS
passport.use(new LocalStrategy(
  function(username, password, done) {
    if (username === "kunal.v.mandalia@gmail.com" && password === "helloworld") // stupid example
      return done(null, {name: "admin"});

    return done(null, false, { message: 'Incorrect username.' });
  }
));

// Google strategy
passport.use(new GoogleStrategy({
    clientID: passportConfig["Google"].clientID,
    clientSecret: passportConfig["Google"].clientSecret,
    callbackURL: passportConfig["Google"].callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      console.log( JSON.stringify(profile));
      return done(null, profile);
    });
  }
));

// Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
  if (!req.isAuthenticated()) 
  	res.send(401);
  else
  	next();
};
//==================================================================

// Start express application
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser()); 
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'securedsession' }));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//==================================================================
// routes
app.get('/', function(req, res){
  res.render('index', { title: 'Express' });
});

app.get('/users', auth, function(req, res){
  res.send([{name: "user1"}, {name: "user2"}]);
});
//==================================================================

//==================================================================
// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
});

// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
  res.send(req.user);
});

// route to log out
app.post('/logout', function(req, res){
  req.logOut();
  res.send(200);
});
//==================================================================

app.get('/auth/google',
  passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/userinfo.email'}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/#/admin');
    res.send(req.user);
  });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
