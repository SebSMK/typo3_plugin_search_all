(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var common = {};
    factory(common);
    if (typeof define === "function" && define.amd) {
      define(common); // AMD
    } else {
      root.smkCommon = common; // <script>
    }
  }
}(this, function (common) {
	
	common.firstCapital = function(string){				
		return string === undefined ? '' : string.charAt(0).toUpperCase() + string.slice(1)		
	};
	
	common.ordinal_suffix = function (i) {
	    var j = i % 10;
	    if (j == 1 && i != 11) {
	        return "st";
	    }
	    if (j == 2 && i != 12) {
	        return "nd";
	    }
	    if (j == 3 && i != 13) {
	        return "rd";
	    }
	    return "th";
	};
		
	common.replace_dansk_char = function(text) {				
		
		if (text === undefined)
			return text;			
		
		var res = text;
		
		// utf8 encoding (JSON)
		if (text.match(/[Ã¦Ã¸Ã¥Ã©]/g) != null)
			res = text.replace( /[Ã¦]/g, "ae" ).replace( /[Ã¸]/g, "oe" ).replace( /[Ã¥]/g, "aa" ).replace( /[Ã©]/g, "e" );						

		// 
		if (res.match(/[æåøé]/g) != null)
			res = text.replace( /æ/g, "ae" ).replace( /ø/g, "oe" ).replace( /å/g, "aa" ).replace( /é/g, "e" );						
		
		return res;
	};
	
	/*
	 * check an artwork copyright
	 * @param doc - result returned by Solr for artwork 
	 * @return - false if not under copyright, copyright text if otherwise 
	 */
	common.computeCopyright = function(doc) {
		
		//*** //-->debug mode : no copyright
		//return false; 
		//***
		
		if (doc === undefined || doc.artist_name_ss === undefined || doc.artist_birth_first === undefined || doc.artist_death_first === undefined)
			return false;
		
		var res = true;
		var now = new Date();
		var copyright_owner = "";
		
		// check artist dates
		for (var i = 0, l = doc.artist_name_ss.length; i < l; i++) {
			  var birth = doc.artist_birth_first[i] === undefined ?'-' : doc.artist_birth_first[i];
			  var death = doc.artist_death_first[i] === undefined ?'-' : doc.artist_death_first[i];
			  
			  if (i == 0)
				  copyright_owner = doc.artist_name_ss[0]; // if multiple artists, copyright owner is the first in the list	
			  
			  // if the artist died less than 70 years ago,
			  // or, if we don't have death date, if the artist is born more less 200 years ago - under cc
			  if(
				  (!isNaN(death) && (now.getFullYear() - parseInt(death) < 70))
				  || 
				  (isNaN(death) && !isNaN(birth) && (now.getFullYear() - parseInt(birth) < 200))){
				  	res = true;
				  	break;
			  };				
							  
			  // in all other cases, no cc
			  res = false;			  			  
		};
		  
		// if under cc, search for copyright text, otherwise default copyright text
		if(res)
			res = doc.copyright !== undefined ? doc.copyright : sprintf('&copy; %s', copyright_owner);				
		
		return res;
	};
	
	common.getDefaultPicture = function(size){		
		var picturePath = ""
		var server = common.getCurrentServerName();
		var pluginPath = common.getCurrentPluginDir();
			
		switch(size){
		  case "small":		 			  			  			  
			  picturePath = 'http://%s/%spi1/images/default_picture_2_small.png';					  			  			  
			  break;
		  case "medium":		 			  			  			  
			  picturePath = 'http://%s/%spi1/images/default_picture_2_medium.png';					  			  			  
			  break;
		  case "large":		 			  			  			  
			  picturePath = 'http://%s/%spi1/images/default_picture_2_large.png';					  			  			  
			  break;
		  default:		    			  			   							  
			  picturePath = 'http://%s/%spi1/images/default_picture_2_small.png';		  	 		  	  
		  	  break;		  
		}	
		
		return sprintf(picturePath, server, pluginPath);
	};
	
	common.getPluginURL = function(){
		var server = common.getCurrentServerName();
		var pluginPath = common.getCurrentPluginDir();
		
		return sprintf('http://%s/%s', server, pluginPath);				
	}
	
	
//	common.getScaledPicture = function(fullsizePath, size){								 
//		
//		var pictureScaleServerPath = 'cspic-01.smk.dk';		
//		var pictureAdresse = common.getLocation(fullsizePath).pathname.replace(/^\/|/g, '');
//		var width = '';
//			
//		switch(size){
//		  case "small":		 			  			  			  
//			  width = '88';					  			  			  
//			  break;
//		  case "medium":		 			  			  			  
//			  width = '198';					  			  			  
//			  break;
//		  case "large":		 			  			  			  
//			  width = '418';					  			  			  
//			  break;
//		  default:		    			  			   							  
//			  width = '88';		  	 		  	  
//		  	  break;		  
//		};	
//		
//		return sprintf('http://%s/?pic=%s&mode=width&width=%s', pictureScaleServerPath, pictureAdresse, width);
//	};
	
	common.getLocation = function(href) {
	    var l = document.createElement("a");
	    l.href = href;
	    return l;
	};
	
	
	common.getCurrentLanguage = function(){		
		return smkSearchAllConf.currentLanguage;
	};
	
	common.getCurrentPluginDir = function(){		
		return smkSearchAllConf.pluginDir;
	};
	
	common.getCurrentServerName = function(){		
		return smkSearchAllConf.serverName;
	};
	
	common.getSolrPath = function (){
		return smkSearchAllConf.solrPath;
	};
	
	common.getSearchPOST = function (){
		return smkSearchAllConf.searchStringPOST;
	};	
	
	
	common.removeA = function (arr) {
		if (!AjaxSolr.isArray(arr))
			return [];
		
		var what, a = arguments, L = a.length, ax;
	    while (L > 1 && arr.length) {
	        what = a[--L];
	        while ((ax= arr.indexOf(what)) !== -1) {
	            arr.splice(ax, 1);
	        }
	    }
	    return arr;
	};
				
}));