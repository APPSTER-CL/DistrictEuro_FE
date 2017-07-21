angular.module('DistrictEuro')
  .controller('ApplicationCtrl', function ($scope, $rootScope, $timeout, $mdSidenav, Flash,
     $log, $state, AuthFactory, StorageService, LanguageFactory, $translate, $window) {

    $rootScope.profileData = StorageService.get(configuration.storage.userData);

    $scope.goHome = function() {
      AuthFactory.redirectHome();
    };
    $scope.toggleLeft = buildToggler('left');

    function buildToggler(componentId) {
      return function() {
        if (!$rootScope.navBarOpen) {
          $rootScope.menuIcon = 'clear';
          $rootScope.navBarOpen = true;
        } else {
          $rootScope.menuIcon = 'menu';
          $rootScope.navBarOpen = false;
        }
      };
    }

    // If toolbar is taller in order to fit some buttons or something.
    $rootScope.tallToolbar = false;
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      $rootScope.tallToolbar = !!toState.data.tallToolbar;
    });

    // dark-grey: customPrimary-500
    // lime: customAccent-A200
    // white: customBackground-50

    $scope.toolbarBackground = 'primary-500';
    $scope.fontColor = 'accent-A200';
    $rootScope.menuIcon = 'menu';
    $rootScope.navBarOpen = false;
    $scope.parentView = true;

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      if ($state.$current.parent.name !== 'base') {
        /* If view is not child of base then show back icon on top left and
        change toolbar styles */
        $scope.parentView = true;
        $scope.toolbarBackground = 'accent-A200';
        $scope.fontColor = 'background-50';
        $rootScope.menuIcon = 'arrow_back';
        $rootScope.onMenuClick = $rootScope.goBack;
      } else {
        $scope.parentView = false;
        $scope.toolbarBackground = 'primary-500';
        $scope.fontColor = 'accent-A200';
        if (!$rootScope.navBarOpen){
          $rootScope.menuIcon = 'menu';
        } else {
          $rootScope.menuIcon = 'clear';
        }
        $rootScope.onMenuClick = $scope.toggleLeft;
      }
    });

    $scope.selectLanguage = function(lang_code, refresh_page) {
      $scope.languages.forEach(function(obj) {
        obj.selected = obj.code === lang_code;
        if (obj.selected) {
          $rootScope.selectedLanguage = obj;
        }
      });
      $translate.use(lang_code);

      if (refresh_page) {
        $window.location.reload();
      }
    };

    $scope.languages = [];
    LanguageFactory.getLanguages().then(function(data) {
      $scope.languages = data;
      $scope.selectLanguage($translate.use());
    });

    $scope.user_menues = [];
    var all_menues = [{
        state: 'orders',
        icon: 'assets/icons/deOrders.svg',
        name: 'MENU_ORDERS'
      }, {
        state: 'my_inventory',
        icon: 'assets/icons/deInventory.svg',
        name: 'MENU_MYINVENTORY'
      }, {
        state: 'analytics',
        icon: 'assets/icons/deAnalytics.svg',
        name: 'MENU_ANALYTICS'
      }, {
        state: 'samples',
        icon: 'assets/icons/deShowroom.svg',
        name: 'MENU_SHOWROOMS'
      }, {
        state: 'shipping',
        icon: 'assets/icons/deWarehouse.svg',
        name: 'MENU_SHIPPING'
      }, {
        state: 'sample_management',
        icon: 'assets/icons/deSampleManagement.svg',
        name: 'MENU_SAMPLEMANAGEMENT'
      }
    ];
    all_menues.forEach(function(menu){
      var state = $state.get(menu.state);
      if (state !== null && AuthFactory.isAuthorized(state.data.authorizedRoles)) {
        $scope.user_menues.push(menu);
      }
    });

    $rootScope.showApiError = function(error){
      Flash.create('danger', error.detail.detail);
      Flash.pause();
    };
});
