
var	UniqueURL = {	
		_separator: '&',
		
		_cat_separator: '/',
		
		_q_separator: ',',
		
		_fq_locals_separator: ';',
		_fq_separator: ',',
		
		_default_category: 'all',
		
		_default_view: 'teasers',
		
		getParams: function(url){
			    
			var res = {};
			
			var cats = url.replace(this._cat_separator, '').split(this._cat_separator);
			
			if(cats.length > 0){
				
				switch(cats[0]){
					case "detail":
						res.q = sprintf('"%s"', decodeURIComponent(cats[1]));
						res.view = cats[0];
						break;	
					
					case "category":												
						res.category = cats[1];	
						res.fq = [{	'value': sprintf('%s:%s', cats[0], cats[1]),
									'locals': {'tag': cats[0]}  
								}];
						this.extract_params(cats[2].split(this._separator), res);						
						break;	
						
					default:
						this.extract_params(cats[0].split(this._separator), res);
						break;
				}
				
			}
			
			return res;

		}, 				
		
		extract_params: function(params, res){			
			
			for (var i = 0, l = params.length; i < l; i++) {
				
				var param = params[i].split('=');
				var value = '';
				
				if(param !== undefined && param.length > 1){														
					
					switch(param[0]){
						 
					  case "q":
					   	 value = params[i].replace('q=', '');
					   	 value = decodeURIComponent(value);
					   	 res.q = value.split(this._q_separator);
						 break;
						 
					  case "start":
					   	 value = params[i].replace('start=', '');
					   	 res.start = decodeURIComponent(value);						   	 
						 break;	
						 
					  case "sort":
						   	 value = params[i].replace('sort=', '');
						   	 res.sort = decodeURIComponent(value);						   	 
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
			};
			
			return res;			
			
		},
		
		setUniqueURL: function(json){	    	  

			  var uniqueURL = "";		      
			  
			  if(json.view == 'detail'){
				  uniqueURL = sprintf('%s%s%s%s', this._cat_separator, json.view, this._cat_separator, encodeURIComponent(this.encode_q(json.q)) );				  				  
			  }else{
				  
				  var cat = json.category != undefined && json.category != 'all' ? sprintf('%1$scategory%1$s%2$s%1$s', this._cat_separator,json.category) : '';
				  var q =  json.q != undefined &&  this.encode_q(json.q) != '' ? sprintf('%sq=%s', this._separator, encodeURIComponent(this.encode_q(json.q))) : '';
				  var fq =  json.fq != undefined && this.encode_fq(json.fq) != '' ? sprintf('%sfq=%s', this._separator, encodeURIComponent(this.encode_fq(json.fq))) : '';
				  var start =  json.start != undefined && json.start != 0 ? sprintf('%sstart=%s', this._separator, encodeURIComponent(json.start)) : '';
				  var sort =  json.sort != undefined && json.sort != "score desc" ? sprintf('%ssort=%s', this._separator, encodeURIComponent(json.sort)) : '';
				  
				  
				  uniqueURL = sprintf('%s%s%s%s%s', cat, q, fq, start, sort);
				  
			  }; 	  
		      
			  //* set unique url	
		      $.address.value(uniqueURL.replace(this._separator, ''));		

		 },
		
		
		 
		decode_fq: function(fq){
			var res = {};
			var elements = fq.split(this._fq_locals_separator);
			
			for (var i = 0, l = elements.length; i < l; i++) {
				var element = elements[i].split(':');
				
				if(element !== undefined && element.length > 1)																			
					res.value = decodeURIComponent(elements[i]);						   	 																												
			};
			
			if(res.locals !== undefined && res.locals.tag !== undefined && res.value !== undefined)
				res.locals.tag = res.value.split(':')[0];		
			
			return res;
		},
		
		encode_fq: function(getfq){
			 var res = '';
			  var fq = getfq == null ? [] : getfq.slice();	  
			  
			  for (var i = 0, l = fq.length; i < l; i++) {
				  if(fq[i].value != null && fq[i].value != '' && fq[i].value.split(':')[0] != 'category')
			   		res = sprintf('%s%s%s', res, this._fq_separator, fq[i].value);
			   };	
			   	
			  return res.replace(this._fq_separator, ''); 		  			
		},
		
		/**
		 * @params getq
		 * */
		encode_q: function(getq){	  
			  var res = '';
			  
			  if (AjaxSolr.isArray(getq)){
				  for (var i = 0, l = getq.length; i < l; i++) {
				   		res = res + this._q_separator + getq[i];
				   };  				  
			  }else{
				  res = getq;
			  }			  	
			   	
			  return res.replace(this._q_separator, ''); 		  
		},
		
		
		getCurrentCategory: function(){
			
			var res;
			var url =  $.address.value();
			var cats = url.replace(this._cat_separator, '').split(this._cat_separator);
			
			if(cats.length > 0){
				
				switch(cats[0]){										
					case "category":												
						res = cats[1];	
						break;	
				}
				
			}
			
			return res;
		},
		
		
		getIsCurrentViewDetail: function(){
			
			var res = false;
			var url =  $.address.value();
			var cats = url.replace(this._cat_separator, '').split(this._cat_separator);
			
			if(cats.length > 0){
				
				switch(cats[0]){										
					case "detail":												
						res = true;	
						break;	
				}
				
			}
			
			return res;
		},
		
		
		getCurrentSort: function(){
			
			var res = {};
			var url =  $.address.value();
			var cats = url.replace(this._cat_separator, '').split(this._cat_separator);			
			
			if(cats.length > 0){
				
				switch(cats[0]){
					case "detail":						
						break;	
					
					case "category":																		
						this.extract_params(cats[2].split(this._separator), res);						
						break;	
						
					default:
						this.extract_params(cats[0].split(this._separator), res);
						break;
				}
			};
			
			return res.sort;
			
		}
			
};
	
//var Base64 = {
//	
//	// private property
//	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
//	
//	// public method for encoding
//	encode : function (input) {
//return input;
//	    var output = "";
//	    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
//	    var i = 0;
//	
//	    input = Base64._utf8_encode(input);
//	
//	    while (i < input.length) {
//	
//	        chr1 = input.charCodeAt(i++);
//	        chr2 = input.charCodeAt(i++);
//	        chr3 = input.charCodeAt(i++);
//	
//	        enc1 = chr1 >> 2;
//	        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
//	        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
//	        enc4 = chr3 & 63;
//	
//	        if (isNaN(chr2)) {
//	            enc3 = enc4 = 64;
//	        } else if (isNaN(chr3)) {
//	            enc4 = 64;
//	        }
//	
//	        output = output +
//	        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
//	        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
//	
//	    }
//	
//	    return output;
//	},
//	
//	// public method for decoding
//	decode : function (input) {
//return input;		
//	    var output = "";
//	    var chr1, chr2, chr3;
//	    var enc1, enc2, enc3, enc4;
//	    var i = 0;
//	
//	    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
//	
//	    while (i < input.length) {
//	
//	        enc1 = this._keyStr.indexOf(input.charAt(i++));
//	        enc2 = this._keyStr.indexOf(input.charAt(i++));
//	        enc3 = this._keyStr.indexOf(input.charAt(i++));
//	        enc4 = this._keyStr.indexOf(input.charAt(i++));
//	
//	        chr1 = (enc1 << 2) | (enc2 >> 4);
//	        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
//	        chr3 = ((enc3 & 3) << 6) | enc4;
//	
//	        output = output + String.fromCharCode(chr1);
//	
//	        if (enc3 != 64) {
//	            output = output + String.fromCharCode(chr2);
//	        }
//	        if (enc4 != 64) {
//	            output = output + String.fromCharCode(chr3);
//	        }
//	
//	    }
//	
//	    output = Base64._utf8_decode(output);
//	
//	    return output;
//	
//	},
//	
//	// private method for UTF-8 encoding
//	_utf8_encode : function (string) {
//	    string = string.replace(/\r\n/g,"\n");
//	    var utftext = "";
//	
//	    for (var n = 0; n < string.length; n++) {
//	
//	        var c = string.charCodeAt(n);
//	
//	        if (c < 128) {
//	            utftext += String.fromCharCode(c);
//	        }
//	        else if((c > 127) && (c < 2048)) {
//	            utftext += String.fromCharCode((c >> 6) | 192);
//	            utftext += String.fromCharCode((c & 63) | 128);
//	        }
//	        else {
//	            utftext += String.fromCharCode((c >> 12) | 224);
//	            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
//	            utftext += String.fromCharCode((c & 63) | 128);
//	        }
//	
//	    }
//	
//	    return utftext;
//	},
//	
//	// private method for UTF-8 decoding
//	_utf8_decode : function (utftext) {
//	    var string = "";
//	    var i = 0;
//	    var c = c1 = c2 = 0;
//	
//	    while ( i < utftext.length ) {
//	
//	        c = utftext.charCodeAt(i);
//	
//	        if (c < 128) {
//	            string += String.fromCharCode(c);
//	            i++;
//	        }
//	        else if((c > 191) && (c < 224)) {
//	            c2 = utftext.charCodeAt(i+1);
//	            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
//	            i += 2;
//	        }
//	        else {
//	            c2 = utftext.charCodeAt(i+1);
//	            c3 = utftext.charCodeAt(i+2);
//	            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
//	            i += 3;
//	        }
//	
//	    }
//	
//	    return string;
//	}
//
//};