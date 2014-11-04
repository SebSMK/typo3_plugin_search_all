
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
			  	  
			  window.location.href = this.getUniqueURL(json);

		 },
		 
		 
		 getUniqueURL: function(json){	    	  

			  var uniqueURL = "";		      
			  
			  if(json.view == 'detail'){
				  uniqueURL = sprintf('%s%s%s%s', this._cat_separator, json.view, this._cat_separator, encodeURIComponent(this.encode_q(json.q)) );				  				  
			  }else{
				  
				  var cat = json.category != undefined && json.category != '' && json.category != 'all' ? sprintf('%1$scategory%1$s%2$s%1$s', this._cat_separator,json.category) : '';
				  var q =  json.q != undefined &&  this.encode_q(json.q) != '' ? sprintf('%sq=%s', this._separator, encodeURIComponent(this.encode_q(json.q))) : '';
				  var fq =  json.fq != undefined && this.encode_fq(json.fq) != '' ? sprintf('%sfq=%s', this._separator, encodeURIComponent(this.encode_fq(json.fq))) : '';
				  var start =  json.start != undefined && json.start != 0 ? sprintf('%sstart=%s', this._separator, encodeURIComponent(json.start)) : '';
				  var sort =  json.sort != undefined && json.sort != "score desc" ? sprintf('%ssort=%s', this._separator, encodeURIComponent(json.sort)) : '';
				  
				  
				  uniqueURL = sprintf('%s%s%s%s%s', cat, q, fq, start, sort);
				  
			  }; 	  
		      
			  return sprintf('%s#%s', window.location.href.split('#')[0], uniqueURL.replace(this._separator, ''));

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
	