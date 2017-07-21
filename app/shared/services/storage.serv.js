angular.module('DistrictEuro').service('StorageService', ['$local', '$session',
  function ($local, $session) {

    this.save = function (key, value) {
        $local.set(key, value);
    };

    this.save = function (key, value, ttl) {
        $local.set(key, value, ttl);
    };

    this.get = function(key){
        return $local.get(key);
    };

    this.del = function (key) {
        $local.remove(key);
    };

    this.flush = function () {
        return $local.clear();
    };

    return this;
}]);
