angular.module('DistrictEuro').factory('AnalyticsFactory',
  function($http, configuration, $rootScope, $state, StorageService, $q) {

    var analyticsFactory = {};

    var send_get = function(url, query_params) {
      var defered_get = $q.defer();
      $http({
        url: url,
        method: "GET",
        params: query_params
      }).success(function(res, status, headers, config) {
        defered_get.resolve(res);
      }).error(function(error, status, headers, config) {
        defered_get.reject({
          'error': error,
          'status': status
        });
      });
      return defered_get.promise;
    };

    analyticsFactory.getOverview = function(type) {
      var url = configuration.webApi.analytics.overview + type + "/";
      return send_get(url);
    };

    analyticsFactory.getVisits = function (){
      return analyticsFactory.getOverview("visits");
    };

    analyticsFactory.getSales = function (){
      return analyticsFactory.getOverview("sales");
    };

    return analyticsFactory;
});
