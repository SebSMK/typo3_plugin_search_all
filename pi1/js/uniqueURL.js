
var	UniqueURL = {	
		_separator: '&&',
		
		_fq_locals_separator: ';',
		_fq_separator: ',',
		
		_default_category: 'all',
		
		_default_view: 'teasers',
		
		getParams: function(url){
			    
			var res = {};
			var params = url.split(this._separator);
			
			for (var i = 0, l = params.length; i < l; i++) {
				
				var param = params[i].split('=');
				var value = '';
				
				if(param !== undefined && param.length > 1){														
					
					switch(param[0]){
						 
					  case "q":
					   	 value = params[i].replace('q=', '');
					   	 res.q = decodeURIComponent(value);						   	 
						 break;
						 
					  case "start":
					   	 value = params[i].replace('start=', '');
					   	 res.start = decodeURIComponent(value);						   	 
						 break;
						 
					  case "view":
					   	 value = params[i].replace('view=', '');
					   	 res.view = decodeURIComponent(value);						   	 
						 break;	
						 
					  case "category":
					   	 value = params[i].replace('category=', '');
					   	 res.category = decodeURIComponent(value);					   	 
						 break;	
					  
					  case "fq":						  						  
					   	value = params[i].replace('fq=', '');
					   	 
					   	var fq = decodeURIComponent(value).split(this._fq_separator);
					   	
						for (var j = 0, k = fq.length; j < k; j++) {
						   	 var fqval= this.decode_fq(fq[j]);
						   	 if (AjaxSolr.isArray(res.fq)){
						   		res.fq = res.fq.concat(fqval);
						   	 }else{
						   		res.fq = [fqval]; 
						   	 }
						}					   	 
					   	 					   	 
						 break;	
					}
				}						
			}
			
			return res;
		}, 		
		
		decode_fq: function(fq){
			var res = {};
			var elements = fq.split(this._fq_locals_separator);
			
			for (var i = 0, l = elements.length; i < l; i++) {
				var element = elements[i].split('=');
				var value = '';
				var locals = '';
				
				if(element !== undefined && element.length > 1){														
					
					switch(element[0]){
						case "value":
						   	 value = elements[i].replace('value=', '');
						   	 res.value = decodeURIComponent(value);						   	 
							 break;
						case "locals": 
						   	 locals = elements[i].replace('locals=', '');	
						   	 res.locals = {};
						   	 res.locals[decodeURIComponent(locals)] = '';
							 break;
					}											
				}										
			};
			
			if(res.locals !== undefined && res.locals.tag !== undefined && res.value !== undefined)
				res.locals.tag = res.value.split(':')[0];		
			
			return res;
		},
		
		setUniqueURL: function(json){	    	  

			  var uniqueURL = "";
		      
			  for (var i = 0, l = json.length; i < l; i++) {
				  
			      switch(json[i].key){
					  case "q":
					  case "start":
					  case "fq":
						  if (json[i].value != '')
							  uniqueURL = sprintf('%s%s%s=%s', uniqueURL, this._separator, json[i].key, encodeURIComponent(json[i].value));
						  
						  break;

					  case "view":
					  case "category":
						  if (json[i].value != '' && json[i].value != this._default_category && json[i].value != this._default_view)
							  uniqueURL = sprintf('%s%s%s=%s', uniqueURL, this._separator, json[i].key, encodeURIComponent(json[i].value));
						  
						  break;
			      }		  
			  } 	  
		      
			  //* set unique url	
		      $.address.value(uniqueURL.replace(this._separator, ''));		

		 }
};
	






var Base64 = {
	
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
	// public method for encoding
	encode : function (input) {
return input;
	    var output = "";
	    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	    var i = 0;
	
	    input = Base64._utf8_encode(input);
	
	    while (i < input.length) {
	
	        chr1 = input.charCodeAt(i++);
	        chr2 = input.charCodeAt(i++);
	        chr3 = input.charCodeAt(i++);
	
	        enc1 = chr1 >> 2;
	        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	        enc4 = chr3 & 63;
	
	        if (isNaN(chr2)) {
	            enc3 = enc4 = 64;
	        } else if (isNaN(chr3)) {
	            enc4 = 64;
	        }
	
	        output = output +
	        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
	        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
	
	    }
	
	    return output;
	},
	
	// public method for decoding
	decode : function (input) {
return input;		
	    var output = "";
	    var chr1, chr2, chr3;
	    var enc1, enc2, enc3, enc4;
	    var i = 0;
	
	    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	
	    while (i < input.length) {
	
	        enc1 = this._keyStr.indexOf(input.charAt(i++));
	        enc2 = this._keyStr.indexOf(input.charAt(i++));
	        enc3 = this._keyStr.indexOf(input.charAt(i++));
	        enc4 = this._keyStr.indexOf(input.charAt(i++));
	
	        chr1 = (enc1 << 2) | (enc2 >> 4);
	        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	        chr3 = ((enc3 & 3) << 6) | enc4;
	
	        output = output + String.fromCharCode(chr1);
	
	        if (enc3 != 64) {
	            output = output + String.fromCharCode(chr2);
	        }
	        if (enc4 != 64) {
	            output = output + String.fromCharCode(chr3);
	        }
	
	    }
	
	    output = Base64._utf8_decode(output);
	
	    return output;
	
	},
	
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
	    string = string.replace(/\r\n/g,"\n");
	    var utftext = "";
	
	    for (var n = 0; n < string.length; n++) {
	
	        var c = string.charCodeAt(n);
	
	        if (c < 128) {
	            utftext += String.fromCharCode(c);
	        }
	        else if((c > 127) && (c < 2048)) {
	            utftext += String.fromCharCode((c >> 6) | 192);
	            utftext += String.fromCharCode((c & 63) | 128);
	        }
	        else {
	            utftext += String.fromCharCode((c >> 12) | 224);
	            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	            utftext += String.fromCharCode((c & 63) | 128);
	        }
	
	    }
	
	    return utftext;
	},
	
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
	    var string = "";
	    var i = 0;
	    var c = c1 = c2 = 0;
	
	    while ( i < utftext.length ) {
	
	        c = utftext.charCodeAt(i);
	
	        if (c < 128) {
	            string += String.fromCharCode(c);
	            i++;
	        }
	        else if((c > 191) && (c < 224)) {
	            c2 = utftext.charCodeAt(i+1);
	            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
	            i += 2;
	        }
	        else {
	            c2 = utftext.charCodeAt(i+1);
	            c3 = utftext.charCodeAt(i+2);
	            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
	            i += 3;
	        }
	
	    }
	
	    return string;
	}

};