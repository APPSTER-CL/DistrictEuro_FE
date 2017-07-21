angular.module('DistrictEuro.constants', [])
.constant('USER_ROLES', {
    all: '*',
    vendor: 'Vendor',
    employee: 'Employee'
})
.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized',
    tokenWillExpireSoon: 'auth-token-will-expire-soon'
});
