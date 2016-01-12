// load the things we need
var mongoose = require('mongoose');
var callback_host =  "http://localhost:8080";

var apiProviderSchema = mongoose.Schema({

	provider 			: { type: String, unique: true }, //e.g. google, fitbit, etc.
	authorization_URI 	: String, 
	access_Token_URI 	: String,
	client_id		    : String,
	client_secret 		: String,
	scope 				: String,
	redirect_uri		: String,
	authorization_code	: String, //after user authorizes, a code will be supplied from api server which can be exchanged for tokens
	access_token 		: String,
	refresh_token 		: String,
	granted_scope 		: String
});

// access_token have been set with some value and are not null, the default
apiProviderSchema
.virtual('access_token_exists')
.get(function () {
	if (this.access_token){
		return true;
	}else{
		return false;
	}
});

// providers may be handled differently
apiProviderSchema
.virtual('callback_URI')
.get(function () {
		return callback_host + '/callback/' + this.provider;
});


// create the model for api providers and expose it to our app
module.exports = mongoose.model('ApiProvider', apiProviderSchema);