angular.module( 'DistrictEuro.orders', [
  'DistrictEuro.constants',
  'ui.router',
  'ngMaterial'
])
.config(function config( $stateProvider, USER_ROLES ) {
  $stateProvider.state('orders', {
    url: '/orders',
    views: {
      'base': {
        controller: 'OrdersCtrl',
        templateUrl: 'orders/views/orders.tpl.html'
      }
    },
    parent: 'base',
    data: {
      pageTitle: 'Orders',
      authorizedRoles: [USER_ROLES.vendor]
    }
  }).state('orders.detail', {
    url: '/{orderId:int}',
    controller: 'OrderDetailCtrl',
    templateUrl: 'orders/views/orders_detail.tpl.html',
    data: {
      pageTitle: 'Orders Detail',
      authorizedRoles: [USER_ROLES.vendor]
    },
    resolve: {
      orders_detail: function(OrdersFactory, $stateParams) {
        return OrdersFactory.getOrdersDetail($stateParams.orderId);
      }
    }
  });
}).controller( 'OrdersCtrl',[ '$scope', 'NgTableParams','OrdersFactory','$state','$stateParams','$mdDialog', '$mdMedia',
function($scope, NgTableParams, OrdersFactory, $state, $stateParams, $mdDialog, $mdMedia, $rootScope){

  function init() {
    $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
    $scope.orderId = 0;

    var self = this;
    $scope.cont = 0;
    $scope.OrderStatus = '';

    OrdersFactory.getStatus().then(function(result) {
      $scope.orders_status = result;
    }, function(error) {});

    $scope.orders = {};
    $scope.order_history = {};

    $scope.getOrders = function(params) {
      var callback = function(data) {
        $scope.orders = data;
      };
      if (params.reload) {
        OrdersFactory.getOrders().then(callback, $scope.showApiError);
      } else if (params.url) {
        OrdersFactory.send_get(url).then(callback, $scope.showApiError);
      }
    };

    $scope.getOrdersHistory = function(params) {
      var callback = function(data) {
        $scope.order_history = data;
      };
      if (params.reload) {
        OrdersFactory.getOrdersHistory().then(callback, $scope.showApiError);
      } else if (params.url) {
        OrdersFactory.send_get(params.url).then(callback, $scope.showApiError);
      }
    };
  }
  init();

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (toState.name === 'orders') {
      $scope.getOrders({reload: true});
      $scope.getOrdersHistory({reload: true});
    }
  });

}])
.controller("OrderDetailCtrl", [ '$scope', 'NgTableParams','OrdersFactory','$state','$stateParams','$mdDialog', '$mdMedia', 'orders_detail',
function($scope, NgTableParams, OrdersFactory, $state, $stateParams, $mdDialog, $mdMedia, orders_detail){

  $scope.orders_detail = {};
  $scope.orders_detail.data = orders_detail;

  $scope.orderId = $stateParams.orderId;
  self.tableParamsDetails = new NgTableParams({}, { dataset: $scope.orders_detail.data.order_items });


  $scope.changeStatus = function(ev) {
    $scope.OrderStatus = $scope.orders_detail.data.status_id;
    var useFullScreen = false;//($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;

    if($scope.OrderStatus == 'PEN'){
      $mdDialog.show({
        templateUrl: '../app/shared/templates/change_status.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: useFullScreen,
        controller: ['$scope', function($scope) {
          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.answer = function(answer) {
            $mdDialog.hide(answer);
          };
        }]
      })
      .then(function(answer) {
        $scope.OrderStatus = answer;
        if($scope.OrderStatus == 'SHP'){
          $scope.ship_order(ev, useFullScreen);
        } else if($scope.OrderStatus == 'PRG') {
          OrdersFactory.changeOrderStatus($scope.orderId, $scope.OrderStatus, null, null).then(function(data) {
            console.log(data);
            $scope.orders_detail.data.status_id = $scope.OrderStatus;
            angular.forEach($scope.orders_status, function(value, key) {
                if (value['id'] == $scope.OrderStatus) {
                    $scope.orders_detail.data.status = value['name'];
                }
            });
          }, $scope.showApiError);
        }
      }, function() {
        console.log('You cancelled the dialog.');
      });
    } else if ($scope.OrderStatus == 'PRG'){
      $scope.OrderStatus = 'SHP';
      $scope.ship_order(ev, useFullScreen);
    }

    $scope.$watch(function() {
      return $mdMedia('xs') || $mdMedia('sm');
    }, function(wantsFullScreen) {
      $scope.customFullscreen = (wantsFullScreen === true);
    });
  };

  $scope.ship_order = function(ev, useFullScreen){
    $mdDialog.show({
      templateUrl: '../app/shared/templates/order_shipped_status.tpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      locals: {
        order: $scope.orders_detail
      },
      clickOutsideToClose:true,
      fullscreen: useFullScreen,
      controller: ['$scope', 'order', function($scope, order) {
        $scope.validate = function() {
          $scope.valid_form = $scope.shipping.tracking_num != null && $scope.shipping.company != null;
        };
        $scope.hide = function() {
          $mdDialog.hide();
        };
        $scope.cancel = function() {
          $mdDialog.cancel();
        };
        $scope.shipped = function() {
          $mdDialog.hide($scope.shipping);
        };

        function init() {
          $scope.companies = [];
          $scope.order = order;
          $scope.shipping = {
            "company": null,
            "tracking_num": null
          };
          $scope.validate();
        }
        init();
      }]
    })
    .then(function(shipping) {
      console.log(shipping);
      OrdersFactory.changeOrderStatus($scope.orderId, $scope.OrderStatus, shipping.company, shipping.tracking_num).then(function(data) {
         console.log(data);
         $scope.orders_detail.data.status_id = $scope.OrderStatus;
         angular.forEach($scope.orders_status, function(value, key) {
             if (value['id'] == $scope.OrderStatus) {
                 $scope.orders_detail.data.status = value['name'];
             }
         });
      }, $scope.showApiError);
    }, function() {
      console.log('You cancelled the dialog.');
    });
  };

}])
.directive("deOrderDate", function($translate) {
  return {
    restrict: 'E',
    template: '<div><div style="font-size:20px; font-weight: bold; color: #4e4e4e;">{{day}}</div>' +
              '<div style="font-size:12px; font-weight: normal; color: #4e4e4e; margin-top: -5px;">{{month | uppercase }}</div></div>',
    replace: true,
    link: function(scope, element, attrs) {
      $translate('ORDER_DATE', {date: attrs.date}).then(function(translation){
          var items = translation.split(" ");
          if (items.lenth < 2) {
            return;
          }
          scope.month = items[0];
          scope.day = items[1];
      });
    }
  };
});
