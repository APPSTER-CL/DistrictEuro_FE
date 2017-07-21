angular.module('DistrictEuro').factory('AttributesFactory',
  function($http, configuration, $rootScope, $state, StorageService, $q) {

    var attributesFactory = {};

    attributesFactory.getAttributes = function(categoryId) {
      var getAttributes_deferred = $q.defer();
      $http({
        url: configuration.webApi.attributes.get_attributes,
        method: "GET",
        params: {
          category: categoryId
        }
      }).success(function(res, status, headers, config) {
        getAttributes_deferred.resolve(res.results);
        //toDo: paginacion
      }).error(function(error, status, headers, config) {
        getAttributes_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getAttributes_deferred.promise;
    };

    attributesFactory.getAttribute = function(attributeId) {
      var getAttribute_deferred = $q.defer();
      $http({
        url: configuration.webApi.attributes.get_attributes + attributeId + "/",
        method: "GET"
      }).success(function(res, status, headers, config) {
        getAttribute_deferred.resolve(res.results);
        //toDo: paginacion
      }).error(function(error, status, headers, config) {
        getAttribute_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getAttribute_deferred.promise;
    };

    return attributesFactory;
});
