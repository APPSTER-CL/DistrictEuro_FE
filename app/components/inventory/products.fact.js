angular.module('DistrictEuro').factory('ProductsFactory',
  function($http, configuration, $rootScope, $state, StorageService, $q) {

    var productsFactory = {};

    productsFactory.getProducts = function() {
      return $http({
        url: configuration.webApi.products.get_products,
        method: "GET"
      });
    };

    productsFactory.getInventory = function(query_params) {
      var getInventory_deferred = $q.defer();
      $http({
        url: configuration.webApi.products.get_inventory,
        method: "GET",
        params: query_params
      }).success(function(res, status, headers, config) {
        getInventory_deferred.resolve(res);
        //toDo: paginacion
      }).error(function(error, status, headers, config) {
        getInventory_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getInventory_deferred.promise;
    };

    productsFactory.getUnapprovedInventory = function(query_params) {
      var getInventory_deferred = $q.defer();
      $http({
        url: configuration.webApi.products.get_unapproved_inventory,
        method: "GET",
        params: query_params
      }).success(function(res, status, headers, config) {
        getInventory_deferred.resolve(res);
        //toDo: paginacion
      }).error(function(error, status, headers, config) {
        getInventory_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getInventory_deferred.promise;
    };

    productsFactory.getProduct = function(productId) {
      var getProduct_deferred = $q.defer();
      $http({
        url: configuration.webApi.products.get_products + productId + "/",
        method: "GET"
      }).success(function(res, status, headers, config) {
        getProduct_deferred.resolve(res);
      }).error(function(error, status, headers, config) {
        getProduct_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getProduct_deferred.promise;
    };

    productsFactory.deleteProduct = function(product_id) {
      var delete_product_defer = $q.defer();
      $http({
        url: configuration.webApi.products.get_products + product_id + "/",
        method: "DELETE"
      }).success(function(res, status, headers, config) {
        delete_product_defer.resolve(res);
      }).error(function(error, status, headers, config) {
        delete_product_defer.reject({
          'error': error,
          'status': status
        });
      });
      return delete_product_defer.promise;
    };

    productsFactory.getCurrencies = function() {
      var get_currencies = $q.defer();
      $http({
        url: configuration.webApi.others.currency,
        method: "GET"
      }).success(function(res, status, headers, config) {
        get_currencies.resolve(res);
      }).error(function(error, status, headers, config) {
        get_currencies.reject({
          'error': error,
          'status': status
        });
      });
      return get_currencies.promise;
    };

    productsFactory.getIncompleteProducts = function(query_params) {
      var getProducts_deferred = $q.defer();
      $http({
        url: configuration.webApi.products.get_incomplete_products,
        method: "GET",
        params: query_params
      }).success(function(res, status, headers, config) {
        getProducts_deferred.resolve(res);
        //toDo: paginacion
      }).error(function(error, status, headers, config) {
        getProducts_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getProducts_deferred.promise;
    };

    productsFactory.bulkUpload = function(file) {
      var fd = new FormData();
      fd.append("file", file);

      var bulkUpload_deferred = $q.defer();
      $http.post(configuration.webApi.products.bulk_upload, fd, {
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity
      }).success(function(res, status, headers, config) {
        bulkUpload_deferred.resolve(res);
      }).error(function(error, status, headers, config) {
        bulkUpload_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return bulkUpload_deferred.promise;
    };

    productsFactory.createProduct = function(product, query_params){
      query_params = query_params || {};
      var lockProduct = $q.defer();
      var promise_deferred = $http({
        url: configuration.webApi.products.get_products,
        method: "POST",
        data: product,
        params: query_params
      }).success(function(data) {
        lockProduct.resolve(data);
      }).error(function(data) {
        lockProduct.reject(data);
      });
      return lockProduct.promise;
    };

    productsFactory.updateProduct = function(product){
      var lockProduct = $q.defer();
      var promise_deferred = $http({
        url: configuration.webApi.products.get_products + product.id + "/",
        method: "PATCH",
        data: product
      }).success(function(data) {
        lockProduct.resolve(data);
      }).error(function(data) {
        lockProduct.reject(data);
      });
      return lockProduct.promise;
    };

    productsFactory.createProductIncomplete = function(product){
      var lockProduct = $q.defer();
      var promise_deferred = $http({
        url: configuration.webApi.products.get_products,
        method: "POST",
        data: {
          'name': product.name,
          'category': product.category,
          'description': product.description,
          'price_amount': product.price_amount,
          'price_currency': product.price_currency,
          'units': product.units
        },
        params: {save_incomplete: true}
      }).success(function(data) {
        lockProduct.resolve(data);
      }).error(function(data) {
        lockProduct.reject(data);
      });
      return lockProduct.promise;
    };

    return productsFactory;
});
