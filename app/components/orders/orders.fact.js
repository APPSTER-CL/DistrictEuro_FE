angular.module('DistrictEuro').factory('OrdersFactory',
  function($http, configuration, $rootScope, $state, StorageService, $q) {

    var ordersFactory = {};

    var send_get = function(url) {
      var getOrders_deferred = $q.defer();
      $http({
        url: url,
        method: "GET"
      }).success(function(res, status, headers, config) {
        getOrders_deferred.resolve(res);
      }).error(function(error, status, headers, config) {
        getOrders_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getOrders_deferred.promise;
    };

    ordersFactory.send_get = send_get;

    ordersFactory.getOrders = function (){
      var url = configuration.webApi.orders.get_orders_unconfirmed;
      return send_get(url);
    };

    ordersFactory.getOrdersHistory = function (){
      var url = configuration.webApi.orders.get_orders_history;
      return send_get(url);
    };

    ordersFactory.getOrdersDetail = function (orderId){
      var getOrderDetail_deferred = $q.defer();
      $http({
        url: configuration.webApi.orders.get_orders + orderId + "/",
        method: "GET"
      }).success(function(res, status, headers, config) {
        getOrderDetail_deferred.resolve(res);
      }).error(function(error, status, headers, config) {
        getOrderDetail_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getOrderDetail_deferred.promise;
    };

    ordersFactory.changeOrderStatus = function (orderId, status, company, tracking){
      var changeOrderStatus_deferred = $q.defer();
      var data = null;
      if (company && tracking){
        data = {
          "status": status,
          "shipping_company": company,
          "tracking_number": tracking
        };
      }
      else {
        data = {
          "status": status
        };
      }

      $http({
        url: configuration.webApi.orders.update_order_status + orderId + "/",
        method: "PATCH",
        data: data
      }).success(function(res, status, headers, config) {
        changeOrderStatus_deferred.resolve(res);
      }).error(function(error, status, headers, config) {
        changeOrderStatus_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return changeOrderStatus_deferred.promise;
    };

    ordersFactory.getStatus = function (){
      var getStatus_deferred = $q.defer();
      $http({
        url: configuration.webApi.orders.get_order_status,
        method: "GET"
      }).success(function(res, status, headers, config) {
        getStatus_deferred.resolve(res);
      }).error(function(error, status, headers, config) {
        getStatus_deferred.reject({
          'error': error,
          'status': status
        });
      });
      return getStatus_deferred.promise;
    };

    return ordersFactory;
});
