angular.module('DistrictEuro').factory('CategoriesFactory',
  function($http, configuration, $rootScope, $state, StorageService, $q) {

    var categoriesFactory = {};

    categoriesFactory.getCategories = function() {
      var getCategories_deferred = $q.defer();
      $http({
        url: configuration.webApi.categories.get_categories,
        method: "GET"
      }).success(function(res, status, headers, config) {
        getCategories_deferred.resolve(res);
        //toDo: paginacion
      }).error(function(error, status, headers, config) {
        getCategories_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getCategories_deferred.promise;
    };

    return categoriesFactory;
});
