angular.module('DistrictEuro.landing', [
  'ui.router',
  'angularFileUpload'
])

.config(function config($stateProvider) {
  $stateProvider.state('landing', {
    url: '/',
    views: {
      "main": {
        templateUrl: 'landing/views/landing.tpl.html',
        controller: 'LandingCtrl'
      }
    }
  });
})

.controller('LandingCtrl', ['$scope', '$location', '$anchorScroll', 'LandingFactory', 'Flash', 'FileUploader', 'LanguageFactory',
'$translate', '$rootScope', '$window', function($scope, $location, $anchorScroll, LandingFactory, Flash, FileUploader, LanguageFactory,
$translate, $rootScope, $window) {
  function init() {
    $scope.signUp = {};
    $scope.joinUs = {};
  }

  $scope.lang = {
    currentLanguage: {}
  };

  $scope.languages = [];

  $scope.selectLanguage = function() {
    $translate.use($scope.lang.currentLanguage.code);
  };

  LanguageFactory.getLanguages().then(function(data) {
    $scope.languages = data;
    var lang_code = $translate.use();
    $scope.languages.forEach(function(obj) {
      obj.selected = obj.code === lang_code;
      if (obj.selected) {
        $scope.lang.currentLanguage = obj;
      }
    });
    if (!$scope.lang.currentLanguage) {
      $scope.lang.currentLanguage = $scope.languages.filter(function(obj){
        return obj.code.startsWith('en');
      }).shift();
      $scope.lang.currentLanguage.selected = true;
      $translate.use($scope.lang.currentLanguage.code);
    }
  });

  $scope.uploadPhotos = new FileUploader({
    url: configuration.webApi.landing.join_us_image,
    method: 'POST'
  });

  /*$scope.uploadPhotos.onBeforeUploadItemfunction(item) {
    item.url = configuration.webApi.landing.join_us_image + result.id + "/";
    console.log(item.url);
  });*/

  $scope.uploadPhotos.onBeforeUploadItem = function(item) {
    item.url = configuration.webApi.landing.join_us_image + $scope.joinUs.id + "/";

  };

  $scope.uploadPhotos.onCompleteAll = function() {
    Flash.create("success", "Information sent!", 3000);
    $scope.joinUs = {};
    $scope.uploadPhotos.queue = [];
  };

  $scope.goToSignUp = function() {
    $location.hash('signUpFormTitle');
    $anchorScroll();
  };

  $scope.notifyVendor = function() {
    LandingFactory.joinUs($scope.joinUs).then(function(result) {
      $scope.joinUs.id = result.id;
      $scope.uploadPhotos.uploadAll();
      Flash.create("info", "Uploading images...", 5000);
    }, function(error) {
      Flash.create("danger", "There was an error. Try again later.", 3000);
    });
  };

  $scope.joinUsInvalid = function() {
    return $scope.uploadPhotos.queue.length < 5;
  };

  $scope.notify = function() {
    var callback = function(data) {
      Flash.create('success', '<strong>An email will be sent to ' + $scope.signUp.email + '</strong>', 5000);
      $scope.signUp = {};
    };

    LandingFactory.postSingUp($scope.signUp).then(callback, $scope.showApiError);

  };

  init();
}]);
