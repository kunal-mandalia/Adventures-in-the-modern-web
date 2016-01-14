// var api;
// api = {
// 		"authorization_code": "4/18bizzu0x7YmLzTYigulPLlrg7OMEz7U73botrCFdbU",
// 		"client_id": "953113512268-lclh8k6m9t6ads80omlegnd7i3dhgfvp.apps.googleusercontent.com",
// 		"client_secret": "GVgcovgyCdoTsyzQay2EbGjU",
// 		"callback_URI" : "http://localhost:8080/callback/google",
// 		"refresh_token": "1/YU7HZ3mEtWj4FvExzlJAu6h0NoNTM7nZrqP9mh1uCEE",
// }

var createTokenSettings = function (api){

	var authbuf = new Buffer(api.client_id + ':' + api.client_secret); // e.g. fitbit
	var auth64 = authbuf.toString('base64');

	var tokensettings = {
	    "fitbit" : {
	    	"access_token" : {
	    						"headers" : {"Authorization" : "Basic " + auth64},
	    						"form" : {
	    							"code"            : api.authorization_code,
			                        "client_id"       : api.client_id,
			                        "client_secret"   : api.client_secret,
			                        "redirect_uri"    : api.callback_URI,
			                        "grant_type"      : 'authorization_code',
			                        "scope"			  : api.scope
	    						}
	    					},
	        "refresh_token" : {
	    						"headers" : {'Authorization' : 'Basic ' + auth64},
	    						"form" : {
	    							"refresh_token"   : api.refresh_token,
			                        "grant_type"      : 'refresh_token'
	    						},
	    					},
	        "refreshable": true
	    	},

		"google" : {
	    	"access_token" : {
	    						"headers" : {},
	    						"form" : {
	    							"code"            : api.authorization_code,
			                        "client_id"       : api.client_id,
			                        "client_secret"   : api.client_secret,
			                        "redirect_uri"    : api.callback_URI,
			                        "grant_type"      : 'authorization_code'
	    						}
	    					},
	        "refresh_token" : {
	        					"headers" : {},
	        					"form" : {
	        						"refresh_token"   : api.refresh_token,
			                        "client_id"       : api.client_id,
			                        "client_secret"   : api.client_secret,
			                        "grant_type"      : 'refresh_token'
	        					}
	        				},
	        "refreshable": true
			},

		"default" : { //same as google
	    	"access_token" : {
	    						"headers" : {},
	    						"form" : {
	    							"code"            : api.authorization_code,
			                        "client_id"       : api.client_id,
			                        "client_secret"   : api.client_secret,
			                        "redirect_uri"    : api.callback_URI,
			                        "grant_type"      : 'authorization_code'
	    						}
	    					},
	        "refresh_token" : {
	        					"headers" : {},
	        					"form" : {
	        						"refresh_token"   : api.refresh_token,
			                        "client_id"       : api.client_id,
			                        "client_secret"   : api.client_secret,
			                        "grant_type"      : 'refresh_token' 
	        					}
	        				}
			},
	        "refreshable": false
	}

	if (tokensettings[api.provider]){ //api provider exists (name matches)
		return tokensettings[api.provider];
	}
	else {
		return tokensettings["default"];
	}
}

module.exports.createTokenSettings = createTokenSettings;

