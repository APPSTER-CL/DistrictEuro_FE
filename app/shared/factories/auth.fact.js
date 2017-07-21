angular.module('DistrictEuro').factory('AuthFactory',
  function($http, configuration, $rootScope, $state, UserFactory, StorageService, $q, AUTH_EVENTS, $timeout) {

    var authFactory = {},
    timer;

    function destroySession() {
      StorageService.flush();
      $rootScope.authenticated = false;
      if(timer) {
        $timeout.cancel(timer);
      }
      console.log('session finished');
      $state.go('login');
    }

    function manageLoginSuccess(res, status, headers, config, promise) {
      var token = res.token;

      StorageService.save(configuration.storage.token_valid_from, new Date().getTime());
      StorageService.save(configuration.storage.token, token);

      if (res.token_expiration) {
        var token_expire = new Date(res.token_expiration).getTime();
        StorageService.save(configuration.storage.token_will_expire, token_expire);
      }

      StorageService.save(configuration.storage.user, JSON.stringify(res.user));
      authFactory.isValidSession();
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      console.log('session started');
      $rootScope.currentUser = res.user;
      promise.resolve(res.user);
    }

    function manageLoginError(error, status, headers, config, promise) {
      $rootScope.show_options = true;
      promise.reject({
        'error': error,
        'status': status
      });
    }

    authFactory.login = function(credentials) {
      destroySession();
      $rootScope.login_success = false;
      var login_deferred = $q.defer();
      $http({
        url: configuration.webApi.accounts.login,
        method: "POST",
        data: credentials
      }).success(function(res, status, headers, config) {
        manageLoginSuccess(res, status, headers, config, login_deferred);
      }).error(function(error, status, headers, config) {
        manageLoginError(error, status, headers, config, login_deferred);
      });
      return login_deferred.promise;
    };

    authFactory.logout = function() {
      destroySession();
    };

    authFactory.isValidSession = function() {
      var now = new Date().getTime(),
      logonAt = StorageService.get(configuration.storage.token_valid_from) && parseInt(StorageService.get(configuration.storage.token_valid_from), 10),
      expiresAt = StorageService.get(configuration.storage.token_will_expire) && parseInt(StorageService.get(configuration.storage.token_will_expire), 10),
      that = this;

      var valid = logonAt && now <= expiresAt;

      if(valid) {
        $rootScope.authenticated = true;
        $rootScope.currentUser = StorageService.get(configuration.storage.user);
        if(timer) {
          $timeout.cancel(timer);
        }
        timer = $timeout(function (obj) {
          console.log('session expired');
          obj.logout();
        }, expiresAt - now, false, that);
      }
      return valid;
    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    authFactory.isAuthenticated = function() {
      return !!StorageService.get(configuration.storage.user);
    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    authFactory.isAuthorizedAndVerified = function(authorizedRoles) {
      var isAuth = authFactory.isAuthorized(authorizedRoles);
      var isVer = authFactory.isAccountVerified();
      return (isAuth && isVer);
    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    authFactory.isAuthorized = function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      var usrSerialized = StorageService.get(configuration.storage.user);
      var usr = angular.fromJson(usrSerialized);
      var isAuthorized = false;
      if(authFactory.isAuthenticated()){

        for (var i = 0; i < usr.profiles.length; i++) {
              isAuthorized = (authorizedRoles.indexOf(usr.profiles[i])!== -1) || isAuthorized;
            }

      }

      return isAuthorized;
    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    authFactory.isAccountVerified = function() {
      var userObj = angular.fromJson(StorageService.get(configuration.storage.user));
      return (authFactory.isAuthenticated() && (userObj.isVerified === true));
    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    authFactory.verifyAccount = function(email, regToken) {
      var promise = $http({
        method: "PUT",
        url: configuration.webApi.accounts.verify,
        params: {
          email: email,
          regToken: regToken
        }
      });

      promise.then(function(response) {
        return response;
      });

      return promise;
    };

    authFactory.redirectHome = function() {
      var usrSerialized = StorageService.get(configuration.storage.user);
      var usr = angular.fromJson(usrSerialized);
      switch(usr.profiles[0]) {
        case 'Vendor':
          $state.go('orders');
          break;
        case 'Employee':
          $state.go('shipping');
          break;
      }
    };

    return authFactory;
});
