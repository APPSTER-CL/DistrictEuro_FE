angular.module('DistrictEuro').factory('UserFactory',
    ['$http', '$state', 'configuration', '$rootScope', 'StorageService', '$q', '$location', function
    ($http, $state, configuration, $rootScope, StorageService, $q, $location) {
    var userFactory = {};

    userFactory.register = function (userAccount) {
      return $http({
        url: configuration.webApi.accounts.register,
        method: "POST",
        data: userAccount
      });
    };

    userFactory.sendForgotPassword = function (email) {
      return $http({
        url: configuration.webApi.accounts.forgot_password,
        method: "POST",
        data: { email: email }
      });
    };

    userFactory.resetForgotPassword = function (password, token) {
      return $http({
        url: configuration.webApi.accounts.reset_password,
        method: "POST",
        data: { password: password, token: token }
      });
    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    userFactory.getProfileDataForPerson = function (personId) {
      if (personId <= 0) {
        return { then: function () { } };
      }

      var promise = $http({
        url: configuration.webApi.persons.get_person_profile_data,
        method: "GET",
        params: { "person_id": personId }
      }).error(function (data, status, headers, config) {
        console.log(data);
        return data;
      });

      return promise;
    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    userFactory.logout = function () {
        StorageService.flush();
        $rootScope.profileData = null;
        $rootScope.currentUser = null;

        // Clear out this header value to avoid it from affecting the APIs that
        // do not require authentication (e.g. get_sports).
        $http.defaults.headers.common.Authorization = ' ';

        $state.go('login');
    };

    //--------------------------------------------------------------------------
    // Acquire the current user's personal information from the API and cache it
    // in the local StorageService.
    //--------------------------------------------------------------------------
    userFactory.getPersonalInformation = function (first_login) {
        var promise = $http({
            url: configuration.webApi.persons.get_personal_information,
            method: "GET",
            params: {
              'first_login': first_login
            }
        }).success(function (data, status, headers, config) {
            StorageService.save(configuration.storage.userData, data);
            return data;
        }).error(function (data, status, headers, config) {
            console.log(data);
            return data;
        });

        return promise;
    };

    //--------------------------------------------------------------------------
    // Get user information
    //--------------------------------------------------------------------------
    userFactory.getUserInformation = function (userId) {
        var promise = $http({
            url: configuration.webApi.persons.get_user_information,
            method: "GET",
            params: {
                'userId': userId
            }
        }).success(function (data, status, headers, config) {
            return data;
        }).error(function (data, status, headers, config) {
            return data;
        });

        return promise;
    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    userFactory.verifyToken = function (user_id, token) {
        var deferred = $q.defer();

        $http({
            url: configuration.webApi.accounts.verify_forgot_pass_token,
            method: "POST",
            data: {
                'user_id': user_id,
                'token': token
            }
        }).then(function (response) {
            deferred.resolve(response);
        }, function (error, status) {
            deferred.reject({ 'error': error, 'status': status });
        });

        return deferred.promise;
    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    userFactory.verifyEmail = function (user_id, email, token) {
        var deferred = $q.defer();

        $http({
            url: configuration.webApi.accounts.verify_email,
            method: "POST",
            data: {
                'email': email,
                'token': token,
                'user_id': user_id
            }
        }).then(function (response) {
            deferred.resolve(response);
        }, function (error, status) {
            deferred.reject({ 'error': error, 'status': status });
        });

        return deferred.promise;
    };

  return userFactory;
}]);
