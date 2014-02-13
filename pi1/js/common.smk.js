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
	
}));