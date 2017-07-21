angular.module('DistrictEuro.sample_management', [
  'DistrictEuro.constants',
  'ui.router'
])
.config(function config( $stateProvider, USER_ROLES ) {
  $stateProvider.state( 'sample_management', {
    url: '/samples/management',
    views: {
      "base": {
        controller: 'SampleManagementCtrl',
        templateUrl: 'sample_management/sample_management.tpl.html'
      }
    },
    parent: 'base',
    data: {
      pageTitle: 'Sample Management',
      authorizedRoles: [USER_ROLES.employee]
    }
  });
})
.controller('SampleManagementCtrl', ['$scope', 'SampleManagementFact', '$mdDialog',
'NgTableParams', 'configuration', function($scope, SampleManagementFact, $mdDialog,
NgTableParams, configuration){

  $scope.dispatched = [];

  $scope.samples = {
    tableParams: new NgTableParams({}, {
        getData: function(params) {
          query = {page: params.page()};
          return SampleManagementFact.send_get($scope.samplesUrl, query).then(
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
      }),
    reload: function() {
      if (this.tableParams.page() == 1) {
        this.tableParams.reload();
      } else {
        this.tableParams.page(1);
      }
    }
  };

  $scope.showingTransferSample = false;
  $scope.selected_samples = [];
  $scope.selectedShowroom = null;
  $scope.transferToWarehouse = false;
  $scope.samplesUrl = configuration.webApi.employee.sample;

  $scope.activateTransferToShowroom = function() {
    $scope.transferToShowroom = true;
    $scope.transferToWarehouse = false;
    $scope.samplesUrl = configuration.webApi.employee.sample_warehouse;
    $scope.showTransferSamples();
  };

  $scope.activateTransferToWarehouse = function() {
    $scope.transferToShowroom = false;
    $scope.transferToWarehouse = true;
    $scope.samplesUrl = configuration.webApi.employee.sample_showroom;
    $scope.showTransferSamples();
  };


  $scope.showTransferSamples = function() {
    $scope.showingTransferSample = true;
    $scope.selected_samples = {};
    $scope.transfer_sample_amount = 0;
    $scope.selectedShowroom = null;
    $scope.samples.reload();
  };

  $scope.hideTransferSamples = function() {
    $scope.showingTransferSample = false;
    $scope.samplesUrl = configuration.webApi.employee.sample;
    $scope.samples.reload();
  };

  $scope.selectSample = function(sample) {
    if (sample.id in $scope.selected_samples) {
      delete $scope.selected_samples[sample.id];
      $scope.transfer_sample_amount--;
      sample.transfer_quantity = null;
    }else{
      $scope.selected_samples[sample.id] = sample;
      sample.transfer_quantity = sample.quantity;
      $scope.transfer_sample_amount++;
    }
  };

  $scope.transferSamples = function() {

    var count = 0;
    var showroom_to = $scope.transferToWarehouse? null: $scope.selectedShowroom.id;

    var incrementCount = function() {
      count++;
      if (count == $scope.transfer_sample_amount) {
        $scope.hideTransferSamples();
      }
    };

    for (var k in $scope.selected_samples) {
      var sample = $scope.selected_samples[k];
      SampleManagementFact.transferSample(sample.id, {
        quantity: sample.transfer_quantity,
        showroom: showroom_to
      }).then(incrementCount, incrementCount);
    }

  };

  $scope.transferToWarehouseChange = function() {
    if ($scope.transferToWarehouse) {
      $scope.selectedShowroom = null;
    }
  };

  $scope.showrooms = [];
  SampleManagementFact.getShowrooms().then(function(data) {
    $scope.showrooms = data;
  }, $scope.showApiError);
}]);
