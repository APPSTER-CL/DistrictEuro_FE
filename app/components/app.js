angular.module('DistrictEuro', [
    'templates-app',
    'DistrictEuro.constants',
    'DistrictEuro.orders',
    'DistrictEuro.about',
    'DistrictEuro.my_inventory',
    'DistrictEuro.accounts',
    'DistrictEuro.samples',
    'DistrictEuro.analytics',
    'DistrictEuro.shipping',
    'DistrictEuro.sample_management',
    'DistrictEuro.landing',
    'ui.router',
    'ngTable',
    'simpleStorage',
    'flash',
    'ngMaterial',
    'pascalprecht.translate',
    'ngCookies',
    'angularFileUpload',
    'chart.js',
    'angular-loading-bar',
    'ngAnimate'
  ])
  .config(function($stateProvider, $urlRouterProvider, $httpProvider, USER_ROLES, $translateProvider, $mdThemingProvider, cfpLoadingBarProvider) {

    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.spinnerTemplate = '';
    cfpLoadingBarProvider.latencyThreshold = 200;

    $translateProvider.useStaticFilesLoader({
      prefix: 'assets/locales/locale-',
      suffix: '.json'
    });
    $translateProvider.registerAvailableLanguageKeys(['en', 'es', 'zh-hans'], {
      'en_*': 'en',
      'es_*': 'es'
    });
    $translateProvider.determinePreferredLanguage();
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.useLocalStorage();

    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';

    $httpProvider.interceptors.push('AuthInterceptorFactory');
    $httpProvider.interceptors.push('LangInterceptorFactory');

    angular.module('DistrictEuro').inject = ['$local', '$session', '$flash'];

    $httpProvider.defaults.useXDomain = true;

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home', {
        url: '/home',
        views: {
          "main": {
            template: '<strong>Loading...</strong>',
            controller: function(AuthFactory) {
              AuthFactory.redirectHome();
            }
          }
        }
      })
      .state('base', {
        abstract: true,
        views: {
          "main": {
            templateUrl: '../app/shared/templates/base.tpl.html',
            controller: 'ApplicationCtrl'
          }
        }
      }).state('logout', {
        url: '/logout',
        views: {
          "main": {
            templateUrl: '../app/shared/templates/logout.tpl.html',
            controller: function(AuthFactory) {
              AuthFactory.logout();
            }
          }
        }
      }).state('validate', {
        url: '/validate/:token/:email?:error',
        parent: 'base',
        controller: function($stateParams, AuthFactory, $state, Flash) {
          if (!$stateParams.error) {
            AuthFactory.manageToken($stateParams.email, $stateParams.token)
              .then(function(user) {
                Flash.create('success', '<strong>Welcome </strong>' + user.email);
                $state.go('orders');
              });
          } else {
            Flash.create('danger', 'Something went wrong, try again later.');
            $state.go('login');
          }
        }
      });

    // Angular material color palette
    var customPrimary = {
      '50': '#8a8a8a',
      '100': '#7d7d7d',
      '200': '#707070',
      '300': '#636363',
      '400': '#575757',
      '500': '#4a4a4a',
      '600': '#3d3d3d',
      '700': '#303030',
      '800': '#242424',
      '900': '#171717',
      'A100': '#969696',
      'A200': '#a3a3a3',
      'A400': '#b0b0b0',
      'A700': '#0a0a0a'
    };
    $mdThemingProvider
      .definePalette('customPrimary',
        customPrimary);

    var customAccent = {
      '50': '#454b0a',
      '100': '#5a620d',
      '200': '#6e790f',
      '300': '#838f12',
      '400': '#98a615',
      '500': '#acbc18',
      '600': '#d0e324',
      '700': '#d5e63b',
      '800': '#dae952',
      '900': '#dfec68',
      'A100': '#d0e324',
      'A200': '#c1d31b',
      'A400': '#acbc18',
      'A700': '#e4ef7f'
    };
    $mdThemingProvider
      .definePalette('customAccent',
        customAccent);

    var customWarn = {
      '50': '#ffb280',
      '100': '#ffa266',
      '200': '#ff934d',
      '300': '#ff8333',
      '400': '#ff741a',
      '500': '#ff6400',
      '600': '#e65a00',
      '700': '#cc5000',
      '800': '#b34600',
      '900': '#993c00',
      'A100': '#ffc199',
      'A200': '#ffd1b3',
      'A400': '#ffe0cc',
      'A700': '#803200'
    };
    $mdThemingProvider
      .definePalette('customWarn',
        customWarn);

    var customBackground = {
      '50': '#ffffff',
      '100': '#ffffff',
      '200': '#ffffff',
      '300': '#f3f3f3',
      '400': '#e7e7e7',
      '500': '#dadada',
      '600': '#cdcdcd',
      '700': '#c0c0c0',
      '800': '#b4b4b4',
      '900': '#a7a7a7',
      'A100': '#ffffff',
      'A200': '#ffffff',
      'A400': '#ffffff',
      'A700': '#9a9a9a'
    };
    $mdThemingProvider
      .definePalette('customBackground',
        customBackground);

    $mdThemingProvider.theme('default')
      .primaryPalette('customPrimary')
      .accentPalette('customAccent')
      .warnPalette('customWarn')
      .backgroundPalette('customBackground');
  })
  .run(function($rootScope, $window, AUTH_EVENTS, AuthFactory, StorageService, $timeout, $state, $templateCache,
    $compile, $templateRequest, configuration) {

    var templatesHTML = $templateCache.get('templates-app');
    $compile(templatesHTML)($rootScope);

    $rootScope.$state = $state;

    $rootScope.goBack = function() {
      $state.go('^');
    };

    $rootScope.changeNextFlashTimeout = function(time) {
      var flashDefault = $rootScope.flash.timeout;
      $rootScope.flash.timeout = time;
      $timeout(function() {
        $rootScope.flash.timeout = flashDefault;
      }, 0);
    };

    if (!AuthFactory.isValidSession() && $state.current.name) {
      AuthFactory.logout();
    }

    $window.onfocus = function() {
      if (!$rootScope.authenticated && $state.current.name === 'login' && $state.current.name !== 'landing' && AuthFactory.isValidSession()) {
        console.log('login focus with active session');
        AuthFactory.redirectHome();
      }
      if ($state.current.name !== 'login' && $state.current.name !== 'landing' && !AuthFactory.isValidSession()) {
        console.log('page focus with closed session');
        AuthFactory.logout();
      }
    };

    //------------------------------------------------------------------------------
    // "next" is the destination $state object, e.g. the target
    // of UI navigation in the app.
    //------------------------------------------------------------------------------
    $rootScope.$on('$stateChangeStart', function(event, next) {
      if (next && next.data && next.data.authorizedRoles) {
        // Get the email-verification state
        var isVerified = true;
        var verificationState = next.data.verificationState;
        if (verificationState) {
          isVerified = AuthFactory.isAccountVerified();
        }

        var authorizedRoles = next.data.authorizedRoles;

        // If either the user is not authorized, or the user's account has
        // not been verified, disallow access.
        if (!AuthFactory.isAuthorized(authorizedRoles) || !isVerified) {
          event.preventDefault();
          if (AuthFactory.isAuthenticated()) {
            // user is not allowed
            console.log("user is not allowed");
            $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            AuthFactory.redirectHome();
          }
        }
      }
    });
  })
  .factory('$deInkRipple', function($mdInkRipple) {
    return {
      attach: function(scope, element, options) {
        return $mdInkRipple.attach(scope, element, angular.extend({
          center: false,
          dimBackground: true
        }, options));
      }
    };
  })
  .controller('AppCtrl', function AppCtrl($scope, $location, $rootScope) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (angular.isDefined(toState.data) && angular.isDefined(toState.data.pageTitle)) {
        $scope.pageTitle = toState.data.pageTitle + ' | DistrictEuro';
      }
    });
  });
