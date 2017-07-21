angular.module('DistrictEuro').factory('LangInterceptorFactory',
  function($rootScope, $q, AUTH_EVENTS, StorageService) {
    return {
      request: function(config) {
        config.headers['Accept-Language'] = StorageService.get('language');
        return config;
      }
    };
});
