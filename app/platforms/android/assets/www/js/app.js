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

.controller('ScanCtrl', ['$scope','$ionicPopup','$ionicHistory','$state','$cordovaBarcodeScanner','$ionicPlatform',
  function($scope,$ionicPopup,$ionicHistory,$state,$cordovaBarcodeScanner,$ionicPlatform) {

  $scope.goManual = function(){
    $ionicHistory.nextViewOptions({
        disableAnimate: true
    });
    $state.go('app.manual');
  }

  $scope.scan = function(){
    $ionicPlatform.ready(function() {

      if (typeof cordova !== 'undefined') {
        $cordovaBarcodeScanner.scan().then(function(barcodeData) {

            if (barcodeData) {

              if ( (barcodeData["cancelled"] == false) && barcodeData['text']) {
                url = barcodeData['text'];
              }
            }

//            alert(JSON.stringify(barcodeData));
        }, function(error) {
            alert(JSON.stringify(error));
        });
      } else {
        url = "http://www.dfeportal.fazenda.pr.gov.br/dfe-portal/rest/servico/consultaNFCe?chNFe=41160579430682011400650010005451821005451825&nVersao=100&tpAmb=1&dhEmi=323031362d30352d31345431323a33303a32312d30333a3030&vNF=107.59&vICMS=0.50&digVal=32335937666347754b67564c504b50505369312b535679496b314d3d&cIdToken=000002&cHashQRCode=AD63C9270BBE2A05AF9C885B9FB563B4E28B3265";
      }

      if (url) {
        var nota = { 'url': url };
        if (chNFe = /chNFe=([^&]+)/.exec(url)[1]) {
          nota['NFe'] = chNFe;
          nota['NFe_str'] = chNFe.replace(/[^\d0-9]/g, '').replace(/(.{4})/g, '$1 ').trim();
        }
        if (vNF = /vNF=([^&]+)/.exec(url)[1]) nota['value'] = vNF;

//                window.open(barcodeData['text'], '_system', 'location=yes');
        var confirmPopup = $ionicPopup.confirm({
           template: 'Doar sua nota fiscal<br>de <strong>R$' + nota.value + 
                    '</strong> para <strong>ACRIDAS</strong>.<br><br><small>NFe:<br>'+nota.NFe_str+'</small>',
         });

      }
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

