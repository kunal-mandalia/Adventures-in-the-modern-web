'use strict';

/**********************************************************************
 * Angular Application
 **********************************************************************/
var app = angular.module('app', ['ngResource', 'ngRoute', 'ngAnimate', 'ngAria', 'ngMaterial', 'ngMdIcons'])
  .config(function($routeProvider, $locationProvider, $httpProvider, $mdThemingProvider) {
    
  var darkBlueMap = $mdThemingProvider.extendPalette('blue', {
    '500': '3470ce'
  });
  // Register the new color palette map with the name <code>neonRed</code>
  $mdThemingProvider.definePalette('darkBlue', darkBlueMap);
  // Use that theme for the primary intentions
  $mdThemingProvider.theme('default')
    .primaryPalette('darkBlue');
    //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user){
        // Authenticated
        if (user !== '0')
          /*$timeout(deferred.resolve, 0);*/
          deferred.resolve();

        // Not Authenticated
        else {
          $rootScope.message = 'You need to log in.';
          //$timeout(function(){deferred.reject();}, 0);
          deferred.reject();
          $location.url('/login');
        }
      });

      return deferred.promise;
    };
    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.interceptors.push(function($q, $location) {
      return {
        response: function(response) {
          // do something on success
          return response;
        },
        responseError: function(response) {
          if (response.status === 401)
            $location.url('/login');
          return $q.reject(response);
        }
      };
    });
    //================================================

    //================================================
    // Define all the routes
    //================================================
    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html'
      })
      .when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/login-material', {
        templateUrl: 'views/login-material.html'
      })
      .otherwise({
        redirectTo: '/'
      });
    //================================================

  }) // end of config()
  .run(function($rootScope, $http){
    $rootScope.message = '';

    // Logout function is available in any pages
    $rootScope.logout = function(){
      $rootScope.message = 'Logged out.';
      $http.post('/logout');
    };
  });


/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', function($scope, $rootScope, $http, $location) {
  // This object will be filled by the form
  $scope.user = {};

  // Register the login() function
  $scope.login = function(){
    $http.post('/login', {
      username: $scope.user.username,
      password: $scope.user.password,
    })
    .success(function(user){
      // No error: authentication OK
      $rootScope.message = 'Authentication successful!';
      $location.url('/admin');
    })
    .error(function(){
      // Error: authentication failed
      $rootScope.message = 'Authentication failed.';
      $location.url('/login');
    });
  };

    $scope.loginGoogle = function(){
    $http.get('/auth/google', {
    })
    .success(function(user){
      // No error: authentication OK
      console.log('logged in as : ' + user);
    })
    .error(function(){
      // Error: authentication failed
      $rootScope.message = 'Authentication failed.';
      $location.url('/login');
    });
  };

});



/**********************************************************************
 * Admin controller
 **********************************************************************/
app.controller('AdminCtrl', function($scope, $http) {
  // List of users got from the server
  $scope.users = [];

  // Fill the array to display it in the page
  $http.get('/users').success(function(users){
    for (var i in users)
      $scope.users.push(users[i]);
  });
});

/**********************************************************************
 * Signup controller
 **********************************************************************/
app.controller('SignupCtrl', function($scope, $http) {
  // List of users got from the server
  $scope.users = [];

});
