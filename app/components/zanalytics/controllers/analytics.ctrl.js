angular.module( 'DistrictEuro.analytics', [
  'DistrictEuro.constants',
  'ui.router',
  'chart.js'
])
.config(function config($stateProvider, USER_ROLES) {
  $stateProvider.state('analytics', {
    url: '/analytics',
    views: {
      "base": {
        controller: 'AnalyticsCtrl',
        templateUrl: 'zanalytics/views/analytics.tpl.html'
      }
    },
    parent: 'base',
    data: {
      pageTitle: 'Analytics',
      authorizedRoles: [USER_ROLES.vendor]
    }
  });
})
.controller('AnalyticsCtrl', ['$scope', 'AnalyticsFactory', function($scope, AnalyticsFactory){
  var _clearData = function () {
    this.labels = [];
    this.data = [];
  };

  $scope.visits = {
    labels: [],
    data: [],
    clear: _clearData
  };
  $scope.sales = {
    labels: [],
    data: [],
    clear: _clearData
  };

  $scope.getSales = function() {
    AnalyticsFactory.getSales().then(function(data){
      $scope.sales.clear();
      data.reverse().forEach(function(item, index){
        $scope.sales.labels.push(item.date_to);
        $scope.sales.data.push(item.value);
      });
    }, $scope.showApiError);
  };

  $scope.getVisits = function() {
    AnalyticsFactory.getVisits().then(function(data){
      $scope.visits.clear();
      data.reverse().forEach(function(item, index){
        $scope.visits.labels.push(item.date_to);
        $scope.visits.data.push(item.value);
      });
    }, $scope.showApiError);
  };

  $scope.getSales();
  $scope.getVisits();
}]);
