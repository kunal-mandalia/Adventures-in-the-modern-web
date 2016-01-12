
module.exports = function(app, ApiProvider, request) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {

    	var apis = ApiProvider.find({}, function(err,docs){
    		if (err){
        		res.render('error.ejs', { error : err});
	        }
	        else{
	    		console.log('apis: ' + docs);
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

    	// api.save(function(err) {
     //        res.redirect('/');
     //    });

    });

    //2. get authorization code
    app.get('/callback/:provider', function(req, res){


        //check req.query.code exists/ is string -> ok. else, error.
        if (req.query.code){
            console.log('code : ' + req.query.code);

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

        // POST /oauth2/v4/token HTTP/1.1
        // Host: www.googleapis.com
        // Content-Type: application/x-www-form-urlencoded

        // code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7&
        // client_id=8819981768.apps.googleusercontent.com&
        // client_secret={client_secret}&
        // redirect_uri=https://oauth2-login-demo.appspot.com/code&
        // grant_type=authorization_code      

        request({
                url: app.locals.api.access_Token_URI, //URL to hit
                qs: {}, //Query string data
                method: 'POST',
                //headers: {'Content-Type' : 'application/x-www-form-urlencoded'},
                //Lets post the following key/values as form
                form: {
                        code            : app.locals.api.authorization_code,
                        client_id       : app.locals.api.client_id,
                        client_secret   : app.locals.api.client_secret,
                        redirect_uri    : app.locals.api.callback_URI,
                        grant_type      : 'authorization_code'  
                 }   
                }, function(error, response, body){
                if(error) {
                    console.log(error);
                } else {
                    console.log(response.statusCode, body);
                    //ok response
                    var jsonbody = JSON.parse(body);
                    //save tokens to mongo

                    app.locals.api.access_token = jsonbody.access_token;
                    app.locals.api.refresh_token = jsonbody.refresh_token;

                    app.locals.api.save(function(err){return err;});

                    //clear locals
                    app.locals.api = null;
                    //check if user exists..if so update token, else create user
                    //user details not typically supplied in first call..must call again
                    // var user = new User({
                    //     user_id: user_id,
                    //     api: [{
                    //         provider: app.locals.apiprovider.provider,
                    //         access_token: jsonbody.access_token,
                    //         refresh_token: jsonbody.refresh_token,
                    //         granted_scope: jsonbody.scope
                    //     }]
                    // });

                    // console.log('user' + user);

                    // User.update({'api.provider': app.locals.apiprovider.provider}, {'$set': {
                    //     'api.$.access_token': jsonbody.access_token}}, function(err) {});

                    // var user_provider = {user_id: jsonbody.user_id, api_provider: app.locals.apiprovider.provider};
                    // app.locals.user_provider = user_provider;

                    console.log('success: aquired access token for api calls, jsonbody : ' + jsonbody);

                    res.redirect('/');
                }
            });
    });

    app.get('/apiprovider', function(req, res){

        var id = req.query.id;
        var returnDoc;

        ApiProvider.find({_id: id}, function(err, docs){
            if (err){
                console.log(err);
                res.redirect('/');
            }
            returnDoc = docs[0];
            console.log(returnDoc);
            console.log(returnDoc.client_secret);
            res.render('apiprovider.ejs', { "api" : returnDoc });
        });
    });

    app.get('/apiexplorer', function(req, res){

        var id = req.query.id;
        var returnDoc;

        ApiProvider.find({_id: id}, function(err, docs){
            if (err){
                console.log(err);
                res.redirect('/');
            }
            returnDoc = docs[0];
            console.log(returnDoc);
            console.log(returnDoc.client_secret);
            res.render('apiexplorer.ejs', { "api" : returnDoc });
        });

    });

};