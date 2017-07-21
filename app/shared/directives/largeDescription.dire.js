angular.module('DistrictEuro')
.directive("deLargeDescription", function() {
  return {
    restrict: 'E',
    template: '<span>{{description}}<md-tooltip direction="center">{{tooltip}}</md-tooltip></span>',    
    replace: true,
    link: function(scope, element, attrs) {
      var description = attrs.text;
      var length = attrs.length || 40;
      var tooltip = '';

      if (description.length > length) {
        tooltip = description;
        description = description.substring(0, length) + '...';
      }
      scope.description = description;
      scope.tooltip = tooltip;
    }
  };
});
