angular.module('starter', ['ionic','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('home',{
    url:'/home',
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl'
  })
  .state('manual', {
    url: '/manual', 
    templateUrl: 'views/manual.html',
    controller: 'ManualCtrl'
  });
  $urlRouterProvider.otherwise('/home');
})

.controller('HomeCtrl', ['$scope','$state','$cordovaBarcodeScanner','$ionicPlatform',function($scope,$state,$cordovaBarcodeScanner,$ionicPlatform) {

  $scope.goManual = function(){
    $state.go('manual');
  }

  $scope.scan = function(){
    $ionicPlatform.ready(function() {
      $cordovaBarcodeScanner.scan().then(function(barcodeData) {
          alert(JSON.stringify(barcodeData));
      }, function(error) {
          alert(JSON.stringify(error));
      });
    });
  }

}])

.controller('ManualCtrl', ['$scope','$state',function($scope,$state) {

  $scope.goHome = function(){
    $state.go('home');
  }


}])

;

