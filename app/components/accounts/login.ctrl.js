angular.module( 'DistrictEuro.accounts', [
  'ui.router',
  'ui.bootstrap'
])

.config(function config( $stateProvider ) {
  $stateProvider.state('login', {
        url: '/login',
        views: {
          "main": {
            templateUrl: 'accounts/login.tpl.html',
            controller: 'AccountsCtrl'
          }
        }
    }).state('forgot_password', {
      url: '/forgot?success&token&code',
      views: {
        "main": {
          templateUrl: 'accounts/forgot_password.tpl.html',
          controller: 'AccountsCtrl'
        }
      }
    }).state('register', {
        url: '/register',
        views: {
          "main": {
            templateUrl: 'accounts/signup.tpl.html',
            controller: 'AccountsCtrl'
          }
        }
    });
})

.controller('AccountsCtrl', [ '$scope', '$window', '$rootScope', 'AuthFactory', '$state', 'AUTH_EVENTS', 'UserFactory',
 'Flash', '$stateParams', '$translate', 'LanguageFactory', 'StorageService', 'configuration', function ($scope, $window, $rootScope, AuthFactory, $state,
  AUTH_EVENTS, UserFactory, Flash, $stateParams, $translate, LanguageFactory, StorageService, configuration) {

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



  $scope.valid = true;

  function init() {
    $scope.credentials = {
      email: '',
      password: ''
    };

    // Register

    $scope.account = {};

    $scope.userTypes = [{
        name: "Vendor",
        value: "vendor"
      }
      //, { name: "Employee" }
    ];

    // $scope.dateOptions = {
    //   formatYear: 'yy',
    //   startingDay: 1
    // };

    $scope.account.userType = $scope.userTypes[0];
    // $scope.account.country = $scope.countries[0];
    // $scope.account.gender = $scope.genders[0];

    // Forgot password

    $scope.passwords = {
      password: '',
      confirmPassword: ''
    };

    if($stateParams.success === 'false') {
      var msg;
      switch ($stateParams.code) {
        case '404':
          msg = 'Email o código de verificación invalidos';
          break;
        case '428':
          msg = 'El código de verificación ha expirado';
          break;
        default:
          msg = 'Ha ocurrido un error';
      }
      Flash.create('danger', msg);
      Flash.pause();
      $state.go('login');
    }
  }

  init();

  function sendForgotPasswordEmail() {
    var email = $scope.credentials.email;
    UserFactory.sendForgotPassword(email)
    .then(function() {
      $rootScope.changeNextFlashTimeout(5000);
      Flash.create('success', '<strong>Se le ha enviado un mail a ' + email + ' con un vínculo para reinicializar su contraseña</strong>');
      $scope.forgotPassword = false;
    });
  }

  function loginSuccess(user) {
    Flash.create('success', '<strong>Welcome </strong>' + user.first_name);
    $scope.credentials.email = '';
    $scope.credentials.password = '';
    AuthFactory.redirectHome();
    $rootScope.loading = false;
  }

  function loginError(response) {
    $scope.loginErrorMessage = 'Unknown error';
    if (response && response.status) {
      if (response.status == 400 || response.status == 404) {
        var msg = 'Invalid email or password.';
        $scope.loginErrorMessage = msg;
      } else if (response.status == 403) {
        $scope.loginErrorMessage = 'You need to verify the account before logging in';
      }
    } else if (response && response.error && response.error.non_field_errors) {
      $scope.loginErrorMessage = response.error.non_field_errors[0];
    }
    Flash.create('danger', $scope.loginErrorMessage);
    Flash.pause();
    $scope.credentials.password = '';
    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    $rootScope.loading = false;
  }

  $scope.login = function() {
    if ($scope.forgotPassword) {
      sendForgotPasswordEmail();
    } else {
      $scope.invalidUsernamePassword = false;
      $scope.mustVerifyAccount = false;
      $scope.loginErrorMessage = null;

      $rootScope.loading = true;

      AuthFactory.login($scope.credentials).then(loginSuccess, loginError);
    }
  };

  $scope.register = function() {
    if ($scope.registerform.$valid) {
      $scope.account.user_type = $scope.account.userType.value;
      $scope.loading = true;
      UserFactory.register($scope.account)
        .success(function() {
          Flash.create('success', 'El usuario se ha creado. Se le ha enviado un e-mail a su casilla de correo con un vínculo para verificar la misma.');
          init();
          $state.go('login');
          $scope.loading = false;
        }).error(function(data, status) {
          var msg;
          if (status > 400) {
            msg = "La solicitud no se pudo procesar correctamente. Por favor intente nuevamente en unos minutos.";
            if (status == 503) {
              msg = "Error al enviar el email para validar su cuenta.";
            }
          } else {
            if (data.code == "103") {
              msg = "Faltan algunos campos en el formulario";
            } else if (data.code == "111") {
              msg = "El email ingresado ya se encuentra en el sistema";
            }
          }
          Flash.create('danger', msg);
          Flash.pause();
          $scope.loading = false;
        });
    } else {
      $scope.valid = false;
      Flash.create('danger', 'El formulario presenta campos incorrectos');
      Flash.pause();
    }
  };

  $scope.open = function($event, cal) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope[cal] = true;
  };

  $scope.changePassword = function() {
    if ($scope.forgotPasswordForm.$valid) {
      if($scope.passwords.password != $scope.passwords.confirmPassword) {
        Flash.create('danger', 'Las contraseñas no coinciden. Verifíque y vuelva a intentarlo');
        Flash.pause();
      } else {
        $rootScope.loading = true;
        UserFactory.resetForgotPassword($scope.passwords.password, $stateParams.token)
        .then(function() {
          $rootScope.changeNextFlashTimeout(5000);
          Flash.create('success', '<strong>Su conraseña ha sido restablecida correctamente.</strong>');
          $state.go('login');
          $rootScope.loading = false;
          $scope.passwords = {
            password: '',
            confirmPassword: ''
          };
        }, function(error) {
          var msg;
          if(error.status == 404) {
            msg = 'El usuario no se encuentra en nuestro sistema';
          } else {
            msg = 'Error interno, vuelva a intentarlo en un momento.';
          }
          Flash.create('danger', msg);
          Flash.pause();

          $rootScope.loading = false;
          $scope.passwords = {
            password: '',
            confirmPassword: ''
          };
        });
      }
    }
  };

}]);
