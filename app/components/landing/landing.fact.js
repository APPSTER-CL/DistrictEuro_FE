angular.module('DistrictEuro').factory('LandingFactory',
  function($http, configuration, $rootScope, $state, StorageService, $q) {

    var attributesFactory = {};

    attributesFactory.postSingUp = function(data) {
      var postAttributes_deferred = $q.defer();
      $http({
        url: configuration.webApi.landing.sign_up,
        method: "POST",
        data: data
      }).success(function(res, status, headers, config) {
        postAttributes_deferred.resolve(res.results);
      }).error(function(error, status, headers, config) {
        postAttributes_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return postAttributes_deferred.promise;
    };

    attributesFactory.joinUs = function(joinUsData) {
      var postAttributes_deferred = $q.defer();
      $http({
        url: configuration.webApi.landing.join_us,
        method: "POST",
        data: joinUsData
      }).success(function(res, status, headers, config) {
        postAttributes_deferred.resolve(res);
      }).error(function(error, status, headers, config) {
        postAttributes_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return postAttributes_deferred.promise;
    };

    return attributesFactory;
  });
