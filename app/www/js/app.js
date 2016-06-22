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
            $ionicPopup.alert({
               title: 'Sync Error',
               template: JSON.stringify(err)
            });
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
        template: 'Doar sua nota fiscal<br>' +
                  (nota.value ? 'de <strong>R$' + nota.value + '</strong> ' : '') + 
                 'para <strong>ACRIDAS</strong>.<br><br><small>NFe: '+nota.print_nfe+'</small>',
      });

      confirmPopup.then(function(res) {
        if(res) {
          if (!$scope.user.notas) $scope.user.notas = {};
          var d = new Date();
          nota.donated_at = d.getTime();
          $scope.user.notas[nota.nfe] = nota;

          var alertPopup = $ionicPopup.alert({
               title: 'Obrigado por sua doação!',
               template: '<img src="http://lorempixel.com/200/200/people/" />'
          });

          $scope.updateProfile($scope.user);
        }
      });
      
    });

    if ($window.localStorage && $window.localStorage.getItem('user')) {
      $scope.user = JSON.parse($window.localStorage.getItem('user'));
      if (!$scope.user.sync) $scope.syncUser($scope.user);
    }

}]);


