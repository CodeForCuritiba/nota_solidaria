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

.controller('AppCtrl', ['$scope', 'apiUrl', '$http','$window', '$ionicModal', '$timeout' ,'$ionicPopup', 
  function($scope, apiUrl, $http, $window, $ionicModal, $timeout, $ionicPopup) {

    $scope.syncing = false;
    $scope.pendingsync = false;

    $scope.syncUser = function(user) {

      var sync = function(user) {
        $scope.syncing = true;
        $scope.pendingsync = false;
        console.log("====> Syncing ",user);
        $http.post(apiUrl + '/users',JSON.stringify(user)).then(function(resp){
          console.log('Success'); // JSON object
          if (resp.data.status == 200) {
            if (!user._id && resp.data.result._id) user._id = resp.data.result._id;
          } else {
            $ionicPopup.alert({
                   title: 'Sync Error',
                   template: JSON.stringify(resp)
            });
          }
          $scope.syncing = false;

          // Test if new things to sync
          if ($scope.pendingsync) sync(user);
          else user.sync = true;

          $window.localStorage.setItem('user', JSON.stringify(user)); 
        }, function(err){
          console.log("Sync failed")
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

    $scope.$on('confirmNota', function(event, args) {
      var nota  = args.shift();
      var confirmPopup = $ionicPopup.confirm({
        template: 'Doar sua nota fiscal<br>de <strong>R$' + nota.value + 
                 '</strong> para <strong>ACRIDAS</strong>.<br><br><small>NFe: '+nota.NFe_str+'</small>',
      });

      confirmPopup.then(function(res) {
        if(res) {
          if (!$scope.user.notas) $scope.user.notas = {};
          $scope.user.notas[nota.NFe] = nota;
          $scope.updateProfile($scope.user);

          var alertPopup = $ionicPopup.alert({
               title: 'Obrigado por sua doação!',
               template: '<img src="http://lorempixel.com/200/200/people/" />'
          });
        }
      });
      
    });

    if ($window.localStorage && $window.localStorage.getItem('user')) {
      $scope.user = JSON.parse($window.localStorage.getItem('user'));
      if (!$scope.user.sync) $scope.syncUser($scope.user);
    }

}])

.controller('ScanCtrl', ['$scope', '$window','$ionicHistory','$state','$cordovaBarcodeScanner','$ionicPlatform',
  function($scope,$window,$ionicHistory,$state,$cordovaBarcodeScanner,$ionicPlatform) {

  $scope.goManual = function(){
    $ionicHistory.nextViewOptions({
        disableAnimate: true
    });
    $state.go('app.manual');
  }

  $scope.scan = function(){
    $ionicPlatform.ready(function() {

      var donateFromUrl = function(url) {
        var nota = { 'url': url };
        if (chNFe = /chNFe=([^&]+)/.exec(url)[1]) {
          nota['NFe'] = chNFe;
          nota['NFe_str'] = chNFe.replace(/[^\d0-9]/g, '').replace(/(.{4})/g, '$1 ').trim();
        }
        if (vNF = /vNF=([^&]+)/.exec(url)[1]) nota['value'] = vNF;

        $scope.$emit('confirmNota', [nota]);
      }; 

      if (typeof cordova !== 'undefined') {
        $cordovaBarcodeScanner.scan().then(function(barcodeData) {

            if (barcodeData) {

              // TODO: better testing to see if QR Code OK
              if ( (barcodeData["cancelled"] == false) && barcodeData['text']) {
                url = barcodeData['text'];
                donateFromUrl(url);
              } else {
                alert(JSON.stringify(barcodeData));
              }

            }

        }, function(error) {
            alert(JSON.stringify(error));
        });
      } else {
        // Fake NF to test behavior
        url = "http://www.dfeportal.fazenda.pr.gov.br/dfe-portal/rest/servico/consultaNFCe?chNFe=41160579430682011400650010005451821005451825&nVersao=100&tpAmb=1&dhEmi=323031362d30352d31345431323a33303a32312d30333a3030&vNF=107.59&vICMS=0.50&digVal=32335937666347754b67564c504b50505369312b535679496b314d3d&cIdToken=000002&cHashQRCode=AD63C9270BBE2A05AF9C885B9FB563B4E28B3265";
        donateFromUrl(url);
      }

    });
  }

}])

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
});
;

