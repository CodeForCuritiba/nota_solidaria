angular.module('app')

.factory('Nota', function () {
  return {
    parseChave: function (chave) {
      if (!chave || chave == 'undefined') chave = '';
      else chave = chave.replace(/[^\d0-9]/g, '');

	  return {
	    'uf' : chave.slice(0,2),
	    'year' : parseInt(chave.slice(2,4))+2000,
	    'month' : parseInt(chave.slice(4,6)),
	    'cnpj' : chave.slice(6,20),
	    'modelo' : chave.slice(20,22),
	    'serie' : chave.slice(22,24),
	    'num' : chave.slice(24,33),
	    'emi' : chave.slice(33,34),
	    'cod' : chave.slice(34,43),
	    'dv' : chave.slice(43)
	  }
	},

	fromChave: function (chave) {
	  chave = chave.replace(/[^\d0-9]/g, '');
	  parsed = this.parseChave(chave);

      return {
        nfe: chave,
		cnpj: parsed.cnpj,
		donation_date: Date.now,
		emission_year: parsed.year,
		emission_month: parsed.month,

		print_nfe: chave.replace(/[^\d0-9]/g, '').replace(/(.{4})/g, '$1 ').trim(),

		print_cnpj: parsed.cnpj.slice(0,2) + '.' + parsed.cnpj.slice(2,5) + '.' + parsed.cnpj.slice(5,8) + '/' + 
					parsed.cnpj.slice(8,12) + '-' + parsed.cnpj.slice(12)

      }		
	},

	fromUrl: function(url) {
	  if (chNFe = /chNFe=([^&]+)/.exec(url)[1]) {

	    nota = this.fromChave(chNFe);
	    nota.value = /vNF=([^&]+)/.exec(url)[1];

	    return nota;

	  } else return false;
	}

  }
});