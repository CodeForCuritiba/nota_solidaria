angular.module('app')

.controller('ManualCtrl', ['$scope','$ionicHistory','$state',function($scope,$ionicHistory,$state) {

  $scope.parseChave = function(chave) {
    if (!chave || chave == 'undefined') chave = '';
    else chave = chave.replace(/ /g,'');

    return {
      'uf' : chave.slice(0,2),
      'year' : chave.slice(2,4),
      'month' : chave.slice(4,6),
      'cnpj' : chave.slice(6,20),
      'modelo' : chave.slice(20,22),
      'serie' : chave.slice(22,24),
      'num' : chave.slice(24,33),
      'emi' : chave.slice(33,34),
      'cod' : chave.slice(34,43),
      'dv' : chave.slice(43)
    }
  }
  $scope.chaveUFOK = function(form) {
    chave = $scope.parseChave(form.chave.$viewValue);
    return chave.uf.length < 2 || (parseInt(chave.uf) == 41);
  }

  $scope.chaveFormatOK = function(form) {
    chave = $scope.parseChave(form.chave.$viewValue);
    monthOK = (parseInt(chave.month)>0) && (parseInt(chave.month)<13);
    var today = new Date();
    var yearnow = today.getFullYear().toString().slice(2);
    yearOK = parseInt(chave.year)<=yearnow;
    return chave.month.length < 2 || (monthOK && yearOK);
  }

  $scope.chaveLengthOK = function(form) {
    return !form.chave.$error.minlength && !form.chave.$error.maxlength    
  }

  $scope.chaveOK = function(form) {
    return !form.chave.$error.required && $scope.chaveLengthOK(form) && $scope.chaveUFOK(form);
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