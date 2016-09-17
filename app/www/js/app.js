angular.module('app', ['ionic','ngCordova','constants'])

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
          templateUrl: 'views/scan.html'
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

.controller('AppCtrl', ['$scope', 'apiUrl', 'theme', '$http','$window', '$ionicModal', '$timeout' ,'$ionicPopup', 'Nota','$ionicHistory','$state','$cordovaBarcodeScanner','$ionicPlatform',
  function($scope, apiUrl, theme, $http, $window, $ionicModal, $timeout, $ionicPopup, Nota,$ionicHistory,$state,$cordovaBarcodeScanner,$ionicPlatform) {

    $scope.syncing = false;
    $scope.pendingsync = false;
    $scope.multinotas = false;

    $scope.theme = theme;

    $scope.syncUser = function(user) {

      var sync = function(user) {
        $scope.syncing = true;
        $scope.pendingsync = false;

        console.log("====> Syncing ",user);

        if (user._id && (typeof user._id == "string") ) { // create
          method = "PUT";
          url = apiUrl + "/doadores/" + user._id;
        } else {
          method = "POST";
          url = apiUrl + "/doadores";
        }         

        $http({ method: method, url: url, data: user}).
          then(function(resp){
            console.log('Success',resp,method); // JSON object
            if ( resp.data && resp.data._id) {
              user._id = resp.data._id;
            }

            $scope.syncing = false;

            // Test if new things to sync
            if ($scope.pendingsync) sync(user);
            else user.sync = true;

            $window.localStorage.setItem('user', JSON.stringify(user)); 
            console.log(user);
          }, function(err){
            console.log("Sync failed",err);
            $scope.syncing = false;
          });

      }

      if (!$scope.syncing) {
        sync(user);
      } else {
        $scope.pendingsync = true;
      }

    }

    $scope.updateProfile = function(user){
      user.sync = false;
      $window.localStorage.setItem('user', JSON.stringify(user)); 
      $scope.syncUser(user);
    };

    $scope.toggleMultinotas = function() {
      $scope.multinotas = !$scope.multinotas;
    };

    $scope.hasNotas = function(user) {
      return user && user.notas && (Object.keys(user.notas).length > 0);
    }

    $scope.removeNotas = function(user) {
      var removeNotasPopup = $ionicPopup.confirm({
        title: 'Você quer remover todas as notas do seu histórico',
      });

      removeNotasPopup.then(function(res) {
        if(res) {
          user.notas = {};
          $scope.updateProfile(user);
        }
      });
    }

    $scope.confirmNota = function(nota) {
      if (!$scope.multinotas) {
        var confirmPopup = $ionicPopup.confirm({
          template: 'Doar sua nota fiscal<br>' +
                    (nota.value ? 'de <strong>R$' + nota.value + '</strong> ' : '') + 
                   'para <strong>ACRIDAS</strong>.<br><br><small>NFe: '+nota.print_nfe+'</small>',
        });

        confirmPopup.then(function(res) {
          if (!$scope.user.notas) $scope.user.notas = {};
          var d = new Date();
          nota.donated_at = d.getTime();
          $scope.user.notas[nota.nfe] = nota;

          var alertPopup = $ionicPopup.alert({
               title: 'Obrigado por sua doação!',
               template: '<img src="http://lorempixel.com/200/200/people/" />'
          });

          $scope.updateProfile($scope.user);  
        });
      } else {
        if (!$scope.user.notas) $scope.user.notas = {};
        var d = new Date();
        nota.donated_at = d.getTime();
        $scope.user.notas[nota.nfe] = nota;

        $scope.updateProfile($scope.user);  

        if (typeof cordova !== 'undefined') $scope.scan();            
      }
      
    };

  $scope.goManual = function(){
    $ionicHistory.nextViewOptions({
        disableAnimate: true
    });
    $state.go('app.manual');
  }

  $scope.scan = function(){
    $ionicPlatform.ready(function() {

      var donateFromUrl = function(url) {
        console.log(/(www.dfeportal.fazenda.pr.gov.br)/.exec(url)[1]);
        if ( (chNFe = /chNFe=([^&]+)/.exec(url)[1])) {
          $scope.confirmNota(Nota.fromUrl(url));
        } else {
          alert("O QR Code não foi reconhecido.");
        }
      }; 

      if (typeof cordova !== 'undefined') {
        $cordovaBarcodeScanner.scan().then(function(barcodeData) {

            if (barcodeData) {

              // TODO: better testing to see if QR Code OK
              if (barcodeData["cancelled"] == false) {
                if (barcodeData['text']) {
                  url = barcodeData['text'];
                  donateFromUrl(url);
                } else {
                  console.error(barcodeData);
                }
              } 
            }

        }, function(error) {
            console.error(error);
            alert("O leitor QRCode falhou. Por favor tente de novo.");
        }, {
          "prompt" : "Coloque o qr-code do seu cupom no meio do escaner", // supported on Android only
          "formats" : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
          "orientation" : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
      });
      } else {
        // Fake NF to test behavior
        url = "http://www.dfeportal.fazenda.pr.gov.br/dfe-portal/rest/servico/consultaNFCe?chNFe=41160579430682011400650010005451821005451825&nVersao=100&tpAmb=1&dhEmi=323031362d30352d31345431323a33303a32312d30333a3030&vNF=107.59&vICMS=0.50&digVal=32335937666347754b67564c504b50505369312b535679496b314d3d&cIdToken=000002&cHashQRCode=AD63C9270BBE2A05AF9C885B9FB563B4E28B3265";
        donateFromUrl(url);
      }

    });
  }


    if ($window.localStorage && $window.localStorage.getItem('user')) {
      $scope.user = JSON.parse($window.localStorage.getItem('user'));
      if (!$scope.user.sync) $scope.syncUser($scope.user);
    } else $scope.user = {};

}]);


