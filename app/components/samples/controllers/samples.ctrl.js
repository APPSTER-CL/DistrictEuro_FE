  angular.module( 'DistrictEuro.samples', [
  'DistrictEuro.constants',
  'ui.router'
])
.config(function config( $stateProvider, USER_ROLES ) {
  $stateProvider.state( 'samples', {
    url: '/samples',
    views: {
      "base": {
        controller: 'SamplesCtrl',
        templateUrl: 'samples/views/samples.tpl.html'
      }
    },
    parent: 'base',
    data: {
      pageTitle: 'Sample Management',
      authorizedRoles: [USER_ROLES.vendor]
    }
  })
  .state( 'sample_dispatch', {
    url: '/dispatch',
    controller: 'SampleDispatchCtrl',
    templateUrl: 'samples/views/sample_dispatch.tpl.html',
    parent: 'samples',
    data: {
      pageTitle: 'Sample Dispatch',
      authorizedRoles: [USER_ROLES.vendor]
    }
  });
})
.controller('SamplesCtrl', ['$scope', 'SamplesFactory', 'NgTableParams', '$state', '$mdDialog',
 function($scope, SamplesFactory, NgTableParams, $state, $mdDialog){
  $scope.show_missing_information = false;

  $scope.getSamplesDispatched = function(params) {
    var callback = function(data) {
      $scope.dispatched = data;
    };
    if (params.reload) {
      SamplesFactory.getSamplesDispatched().then(callback, $scope.showApiError);
    } else if (params.url){
      SamplesFactory.send_get(params.url).then(callback, $scope.showApiError);
    }
  };

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (toState.name === 'samples') {
      $scope.getSamplesDispatched({reload: true});
    }
  });

  $scope.samples = {
    tableParams: new NgTableParams({}, {
        getData: function(params) {
          query = {page: params.page()};
          return SamplesFactory.getSamples(query).then(
            function(data){
              params.total(data.count);
              if (params.count() != data.page_size) {
                params.count(data.page_size);
              }
              return data.results;
            },
            $scope.showApiError);
        },
        counts: []
      })
  };

  $scope.goSendSample = function() {
    $state.go("sample_dispatch");
  };

  $scope.detailSample = function() {
    SamplesFactory.getSampleDetail(vm.sample_id).then(function(data){
      $scope.sample_detail = data;
    }, $scope.showApiError);
  };

  $scope.changeStatus = function(sample, ev) {
    var templateUrl = '../app/shared/templates/sample_shipped_status.tpl.html';
    var controller = ['$scope', function($scope) {
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
        $scope.sample = sample;
        $scope.shipping = {
          "company": sample.shipping_company,
          "tracking_num": sample.tracking_number
        };
        $scope.validate();
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
      var payload = {
        status: 'SHP',
        shipping_company: shipping.company,
        tracking_number: shipping.tracking_num
      };
      SamplesFactory.changeStatus(sample.id, payload).then(function(data) {
        sample.status_id = data.status;
        sample.status = data.status_name;
        sample.shipping_company = data.shipping_company;
        sample.tracking_number = data.tracking_number;
      }, $scope.showApiError);
    });
  };
}])
.controller('SampleDispatchCtrl', ['$scope', 'NgTableParams', 'SamplesFactory', '$state', function($scope, NgTableParams, SamplesFactory, $state) {
  $scope.inventory = {
    tableParams: new NgTableParams({}, {
        getData: function(params) {
          query = {page: params.page()};
          return SamplesFactory.getInventory(query).then(
            function(data){
              params.total(data.count);
              if (params.count() != data.page_size) {
                params.count(data.page_size);
              }
              return data.results;
            },
            $scope.showApiError);
        },
        counts: []
      })
  };

  $scope.dispatch_units = {};
  $scope.dispatch_units_amount = 0;

  $scope.selectUnit = function(unit) {
    if (unit.id in $scope.dispatch_units) {
      delete $scope.dispatch_units[unit.id];
      $scope.dispatch_units_amount++;
    }else{
      $scope.dispatch_units[unit.id] = unit;
      $scope.dispatch_units_amount--;
    }
  };

  $scope.goBack = function() {
    $state.go('samples');
  };

  $scope.sendSamples = function() {
    var units = [];
    for (var k in $scope.dispatch_units) {
      var unit = $scope.dispatch_units[k];
      units.push({product_unit: unit.id, quantity: unit.dispatch_quantity});
    }

    var data = {
      address: $scope.address,
      warehouse: $scope.selectedWarehouse.id,
      tracking_number: $scope.tracking_number,
      shipping_company: $scope.shipping_company,
      samples_units: units
    };
    console.log(data);
    SamplesFactory.sendSamples(data).then($scope.goBack, $scope.showApiError);
  };

  $scope.warehouses = [];

  SamplesFactory.getWarehouses().then(function(data){
      $scope.warehouses = data;
    }, $scope.showApiError);

}]);
