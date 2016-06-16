angular.module('app')

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

}]);