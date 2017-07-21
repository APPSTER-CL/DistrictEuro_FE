angular.module( 'DistrictEuro.about', [
  'ui.router',
  'ui.bootstrap'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'about', {
    url: '/about',
    views: {
      "base": {
        controller: 'AboutCtrl',
        templateUrl: 'about/about.tpl.html'
      }
    },
    parent: 'base',
    data:{ pageTitle: 'What is It?' }
  });
})

.controller( 'AboutCtrl', function ( $scope ) {
  // This is simple a demo for UI Boostrap.
  $scope.dropdownDemoItems = [
    "The first choice!",
    "And another choice for you.",
    "but wait! A third!"
  ];
});
