angular.module('DistrictEuro').factory('SampleManagementFact',
  function($http, configuration, $rootScope, $state, StorageService, $q) {

    var samplesFactory = {};

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

    samplesFactory.send_get = send_get;

    samplesFactory.getSamples = function (query_params){
      return send_get(configuration.webApi.employee.sample, query_params);
    };

    samplesFactory.getSampleDetail = function(sampleId) {
      return send_get(configuration.webApi.samples.sample + sampleId + '/');
    };

    samplesFactory.getInventory = function(query_params) {
      return send_get(configuration.webApi.products.get_inventory, query_params);
    };

    samplesFactory.getShowrooms = function(warehouse_id) {
      return send_get(configuration.webApi.employee.showroom);
    };

    samplesFactory.transferSample = function(sample_id, sample_data) {
      var defered_post = $q.defer();
      $http({
        url: configuration.webApi.employee.sample + sample_id + '/transfer/',
        method: "POST",
        data: sample_data
      }).success(function(res, status, headers, config) {
        defered_post.resolve(res);
      }).error(function(error, status, headers, config) {
        defered_post.reject({
          'error': error,
          'status': status
        });
      });
      return defered_post.promise;
    };

    return samplesFactory;
});
