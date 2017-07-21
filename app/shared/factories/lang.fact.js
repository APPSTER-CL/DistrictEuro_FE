angular.module('DistrictEuro').factory('LanguageFactory', function($http, configuration, $q) {

  var factory = {};

  factory.getLanguages = function() {
    var defered = $q.defer();
    $http({
      url: configuration.webApi.others.language,
      method: "GET"
    }).success(function(res, status, headers, config) {
      defered.resolve(res);
      //toDo: paginacion
    }).error(function(error, status, headers, config) {
      defered.reject({
        'error': error,
        'status': status
      });
    });
    return defered.promise;
  };

  return factory;

});
