angular.module('DistrictEuro').factory('AuthInterceptorFactory',
  function($rootScope, $q, AUTH_EVENTS, StorageService) {

    return {
      request: function(config) {
        if (StorageService.get('token')) {
          config.headers.Authorization = "Token " + StorageService.get('token');
        }
        return config;
      },

      responseError: function(response) {
        $rootScope.$broadcast({
          401: AUTH_EVENTS.notAuthenticated,
          403: AUTH_EVENTS.notAuthorized,
          419: AUTH_EVENTS.sessionTimeout,
          440: AUTH_EVENTS.sessionTimeout
        }[response.status], response);

        if ($rootScope.currentUser &&
            response.data &&
            response.data.detail &&
            (response.data.detail == "Signature has expired." || response.data.detail == "Invalid signature")) {
          StorageService.flush();
          $rootScope.currentUser = undefined;
          console.log('session Expired');
        }

        return $q.reject(response);
      }
    };
});
