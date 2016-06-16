angular.module('app')

.controller('ManualCtrl', ['$scope','$ionicHistory','$state',function($scope,$ionicHistory,$state) {

  $scope.chaveOK = function(form) {
    return !form.chave.$error.required && !form.chave.$error.minlength && !form.chave.$error.maxlength    
  }

  $scope.goHome = function(){
    $ionicHistory.nextViewOptions({
        disableAnimate: true
    });
    $state.go('app.scan');
  }

  $scope.submitChave = function(chave) {
    var nota = {
      NFe: chave.replace(/ /g,''),
      NFe_str: chave,
    }
    console.log($scope.chave);
    $scope.chave = null;
    $scope.$emit('confirmNota', [ nota ]);
  }

}])

.directive('notaChave', function() {
  return {
    require: 'ngModel',
    link: function (scope, element, attr, ngModelCtrl) {
      function fromUser(text) {
        var transformedInput = text.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim();;
        if(transformedInput !== text) {
            ngModelCtrl.$setViewValue(transformedInput);
            ngModelCtrl.$render();
        }
        return transformedInput;
      }
      ngModelCtrl.$parsers.push(fromUser);
    }
  }; 
})