angular.module('DistrictEuro.shipping', [
  'DistrictEuro.constants',
  'ui.router'
])
.config(function config( $stateProvider, USER_ROLES ) {
  $stateProvider.state( 'shipping', {
    url: '/shipping',
    views: {
      "base": {
        controller: 'ShippingCtrl',
        templateUrl: 'shipping/shipping.tpl.html'
      }
    },
    parent: 'base',
    data: {
      pageTitle: 'Shipping Management',
      authorizedRoles: [USER_ROLES.employee]
    }
  });
})
.controller('ShippingCtrl', ['$scope', 'ShippingSamplesFactory', '$mdDialog',
 function($scope, ShippingSamplesFactory, $mdDialog){

  $scope.dispatched = [];

  $scope.getSamplesDispatched = function(params) {
    var callback = function(data) {
      $scope.dispatched = data;
    };
    if (params.reload) {
      ShippingSamplesFactory.getSamplesDispatched().then(callback, $scope.showApiError);
    } else if (params.url){
      ShippingSamplesFactory.send_get(params.url).then(callback, $scope.showApiError);
    }
  };

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (toState.name === 'shipping') {
      $scope.getSamplesDispatched({reload: true});
    }
  });

  $scope.confirmReceived = function(sample, ev) {
    var templateUrl = '../app/shared/templates/confirm_sample_reception.tpl.html';
    var controller = ['$scope', function($scope) {
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      function init() {
        $scope.companies = [];
        $scope.sample = sample;
      }
      init();
    }];

    $mdDialog.show({
      templateUrl: templateUrl,
      parent: angular.element(document.body),
      clickOutsideToClose:true,
      fullscreen: false,
      controller: controller
    }).then(function(shipping) {
      var payload = {};
      ShippingSamplesFactory.confirmReceived(sample.id, payload).then(function(data) {
        sample.status_id = data.status_id;
        sample.status = data.status;
      }, $scope.showApiError);
    });
  };

}]);
