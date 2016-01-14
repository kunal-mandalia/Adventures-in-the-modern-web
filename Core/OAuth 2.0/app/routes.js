
var apiProviderSettings = require('./models/apiprovidersettings.js');

module.exports = function(app, ApiProvider, request) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {

    	var apis = ApiProvider.find({}, function(err,docs){
    		if (err){
        		res.render('error.ejs', { error : err});
	        }
	        else{
	        	res.render('index.ejs', { apis : docs});
	        }
    	});
    });

    app.get('/create', function(req, res){
    	res.render('create.ejs');
    });

    app.post('/providercreated', function(req, res){

    	var api = new ApiProvider({
			provider 			: req.body.provider,
			authorization_URI 	: req.body.authorization_URI, 
			access_Token_URI 	: req.body.access_Token_URI,
			client_id		    : req.body.client_id,
			client_secret 		: req.body.client_secret,
			scope 				: req.body.scope
		});

        app.locals.api = api;

        //1. request authorization code
        var params = '?response_type=code'
        + '&client_id=' + api.client_id
        + '&redirect_uri=' + api.callback_URI
        + '&scope=' + api.scope
        + '&access_type=offline'; //gets refresh token for google

        // request authorization from user
        res.redirect(api.authorization_URI + params);

        //swap authorization code for tokens
    });

    //2. get authorization code
    app.get('/callback/:provider', function(req, res){


        //check req.query.code exists/ is string -> ok. else, error.
        if (req.query.code){
            // console.log('code : ' + req.query.code);

            app.locals.api.authorization_code = req.query.code;
            res.redirect('/gettokens');
        }
        else{
            //handle error
        }
        // An error response:

        // https://oauth2-login-demo.appspot.com/auth?error=access_denied
        // An authorization code response:

        // https://oauth2-login-demo.appspot.com/auth?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
    });

    // 3. swap auth code for access token and refresh token
    app.get('/gettokens', function(req, res){

        var api_settings = apiProviderSettings.createTokenSettings(app.locals.api);
        
        request({
            url: app.locals.api.access_Token_URI, //URL to hit
                qs: {}, //Query string data
                method: 'POST',
                headers: api_settings.access_token.headers,
                //Lets post the following key/values as form
                form: api_settings.access_token.form
            }, function(error, response, body){
            if(error) {
                 console.log('get tokens error: ' + error);
            } else {
                console.log('/gettokens > response.statusCode: ' + response.statusCode);
                console.log('/gettokens > body: ' + body);
                //TODO: handle non 200 responses. APIs may fail and instead of sending an error in the error object, it'll be sent to response and must be read. Providers may specify their error variables differently.
                var jsonbody = JSON.parse(body);

                //add tokens to mongo doc
                app.locals.api.access_token = jsonbody.access_token;
                app.locals.api.refresh_token = jsonbody.refresh_token;

                if (api_settings.refreshable){ //check if we're working with the default provider or a supported provider. Providers seem to implement refresh tokens differently so support those explicitely specified.
                    app.locals.api.refreshable = true;
                }
                else{
                    app.locals.api.refreshable = false;
                }
                // console.log('>>>>> provider api_settings: ' + api_settings.refreshable);

                app.locals.api.save(function(err){return err;});

                //clear locals
                app.locals.api = null;

                // console.log('success: aquired access token for api calls, jsonbody : ' + jsonbody);

                res.redirect('/');
            }
        });
    });

    app.get('/apiprovider', function(req, res){

        var id = req.query.id;
        var returnDoc;

        ApiProvider.findOne({_id: id}, function(err, doc){
            if (err){
                console.log(err);
                res.redirect('/');
            }
            res.render('apiprovider.ejs', { "api" : doc });
        });
    });

    app.get('/apiexplorer', function(req, res){

        var id = req.query.id;
        var returnDoc;

        ApiProvider.findOne({_id: id}, function(err, doc){
            if (err){
                console.log(err);
                res.redirect('/');
            }
            res.render('apiexplorer.ejs', { "api" : doc });
        });

    });

    app.get('/refreshtoken', function(req,res){

        ApiProvider.findOne({_id: req.query.id}, function(err, doc){

            if (err){
                console.log(err);
                res.redirect('/'); //how to send a message back?
            }

            var api_settings = apiProviderSettings.createTokenSettings(doc);
            
            request({
                url: doc.access_Token_URI, //URL to hit
                qs: {}, //Query string data
                method: 'POST',
                headers: api_settings.refresh_token.headers,
                form: api_settings.refresh_token.form

                }, function(error, response, body){
                if(error) {
                    console.log(error);
                } else {

                    var jsonbody = JSON.parse(body);

                    //console.log('respose  : ' + JSON.stringify(response));
                    //save tokens to mongo
                    //console.log('api_settings.refresh_toke.form.client_id : ' + api_settings.refresh_token.form.client_id);
                    doc.access_token = jsonbody.access_token;

                    //update refresh token if provided
                    if (jsonbody.refresh_token){
                        doc.refresh_token = jsonbody.refresh_token;
                    }

                    doc.save(function(err){return err;});
                    res.render('apiprovider.ejs', { "api" : doc });
                }
            });
        });
    });

    app.get('/deleteprovider', function(req, res){

        var id = req.query.id;

        ApiProvider.findOneAndRemove({_id: id}, function(err, doc){
            if (err){
                console.log(err);
            }
           res.redirect('/');
       });
    });
};