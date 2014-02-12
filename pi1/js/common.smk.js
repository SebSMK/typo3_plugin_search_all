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
		
		// Hard to explain why regex below requires utf8 encoding. But it works (tested FF 26.0 & Chrome 32.0)
		if (text.match(/[æøåé]/g) != null)
			res = text.replace( /[æ]/g, "ae" ).replace( /[ø]/g, "oe" ).replace( /[å]/g, "aa" ).replace( /[é]/g, "e" );						
				
		return res;
	};
	
}));