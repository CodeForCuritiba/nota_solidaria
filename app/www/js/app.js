angular.module('app', ['ionic','ngCordova'])

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
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'views/menu.html',
      controller: 'AppCtrl'
    })
    .state('app.scan',{
      url:'/scan',
      views: {
        'menuContent': {
          templateUrl: 'views/scan.html',
          controller: 'ScanCtrl'
        }
      }
    })
    .state('app.manual', {
      url: '/manual', 
      views: {
        'menuContent': {
          templateUrl: 'views/manual.html',
          controller: 'ManualCtrl'
        }
      }
    });
  $urlRouterProvider.otherwise('/app/scan');
})

.controller('AppCtrl', ['$scope', '$window', '$ionicModal', '$timeout', function($scope, $window, $ionicModal, $timeout) {

    if ($window.localStorage && $window.localStorage.getItem('user')) $scope.user = JSON.parse($window.localStorage.getItem('user'));

    $scope.updateProfile = function(user){
        $window.localStorage.setItem('user', JSON.stringify(user)); 
        console.log(user);
      };

}])

.controller('ScanCtrl', ['$scope','$ionicHistory','$state','$cordovaBarcodeScanner','$ionicPlatform',
  function($scope,$ionicHistory,$state,$cordovaBarcodeScanner,$ionicPlatform) {

  $scope.goManual = function(){
    $ionicHistory.nextViewOptions({
        disableAnimate: true
    });
    $state.go('app.manual');
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

.controller('ManualCtrl', ['$scope','$ionicHistory','$state',function($scope,$ionicHistory,$state) {

  $scope.goHome = function(){
    $ionicHistory.nextViewOptions({
        disableAnimate: true
    });
    $state.go('app.scan');
  }


}])

;

