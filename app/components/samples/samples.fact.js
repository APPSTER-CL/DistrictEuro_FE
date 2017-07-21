angular.module('DistrictEuro').factory('SamplesFactory',
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

    samplesFactory.getSamplesDispatched = function(query_params) {
      return send_get(configuration.webApi.samples.sample_dispatch, query_params);
    };

    samplesFactory.getSamples = function (query_params){
      return send_get(configuration.webApi.samples.sample, query_params);
    };

    samplesFactory.getSampleDetail = function(sampleId) {
      return send_get(configuration.webApi.samples.sample + sampleId + '/');
    };

    samplesFactory.getInventory = function(query_params) {
      return send_get(configuration.webApi.products.get_inventory, query_params);
    };

    samplesFactory.getWarehouses = function() {
      return send_get(configuration.webApi.others.warehouse);
    };

    samplesFactory.sendSamples = function(sample_dispatch_data) {
      var defered_post = $q.defer();
      $http({
        url: configuration.webApi.samples.sample_dispatch,
        method: "POST",
        data: sample_dispatch_data
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

    samplesFactory.changeStatus = function(sample_id, data) {
      var defered_patch = $q.defer();
      $http({
        url: configuration.webApi.samples.sample_dispatch + sample_id + '/',
        method: "PATCH",
        data: data
      }).success(function(res, status, headers, config) {
        defered_patch.resolve(res);
      }).error(function(error, status, headers, config) {
        defered_patch.reject({
          'error': error,
          'status': status
        });
      });
      return defered_patch.promise;
    };

    return samplesFactory;
});
