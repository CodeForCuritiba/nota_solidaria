angular.module('app')

.controller('ManualCtrl', ['$scope','Nota','$ionicHistory','$state',function($scope,Nota,$ionicHistory,$state) {

  $scope.chaveUFOK = function(form) {
    chave = Nota.parseChave(form.chave.$viewValue);
    return chave.uf.length < 2 || (parseInt(chave.uf) == 41);
  }

  $scope.chaveFormatOK = function(form) {
    value = (form.chave.$viewValue) ? form.chave.$viewValue.replace(/[^\d0-9]/g, '') : '';

    // this shouldn't be here but I didn't manage to do better
    $scope.printed_chave = value.replace(/(.{4})/g, '$1 ').trim();

    chave = Nota.parseChave(value);
    monthOK = (chave.month>0) && (chave.month<13);
    var today = new Date();
    yearOK = chave.year<=today.getFullYear();
    return value.length < 6 || (monthOK && yearOK);
  }


  $scope.chaveLengthOK = function(form) {
    value = (form.chave.$viewValue) ? form.chave.$viewValue.replace(/[^\d0-9]/g, '') : '';
    return !form.chave.$error.required && value.length == 44;    
  }

  $scope.chaveOK = function(form) {
    return $scope.chaveFormatOK(form) && $scope.chaveUFOK(form) && $scope.chaveLengthOK(form);
  }

  $scope.goHome = function(){
    $ionicHistory.nextViewOptions({
        disableAnimate: true
    });
    $state.go('app.scan');
  }

  $scope.submitChave = function(chave) {
    $scope.chave = null;
    $scope.$emit('confirmNota', [ Nota.fromChave(chave) ]);
  }

  $scope.toFixed = function (x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
  }

}]);