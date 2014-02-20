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
		
		//***
		//return false; //-->debug mode : no copyright
		//***
		
		if (doc === undefined || doc.artist_name_ss === undefined)
			return false;
		
		var res = true;
		var now = new Date();
		var copyright_owner = "";
		
		// check artist dates
		for (var i = 0, l = doc.artist_name_ss.length; i < l; i++) {
			  var birth = doc.artist_birth[i] === undefined ?'-' : doc.artist_birth[i];
			  var death = doc.artist_death[i] === undefined ?'-' : doc.artist_death[i];
			  
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
	
	common.getDefaultPicture = function(){
		
		return;
	}
	
}));