
var	ModelManager = {



		/******************************
		 * PUBLIC FUNCTIONS
		 * * ****************************/				

		/**
		 * Set model
		 * @param {String|Json} [values] The value to set.
		 * @param {String} [type] value's type.		
		 * */
		setModel: function(values, type){

			switch(type){
			case 'json':
				this.setModelFromJson(values);
				break;
			case 'url':
				this.setModelFromURL(values);
				break;	

			default:this.setModelFromJson(values);
			}			
		},

		/**
		 * Get model
		 * @returns {Json} model.
		 * */
		getModel: function(){

			var model = {};

			if (this.isValid(this.view))
				model.view = this.view;

			if (this.isValid(this.category))
				model.category = this.category;

			if (this.isValid(this.q))
				model.q = this.q;

			if (this.isValid(this.fq))
				model.fq = this.fq;

			if (this.isValid(this.qf))
				model.qf = this.qf;

			if (this.isValid(this.start))
				model.start = this.start;

			if (this.isValid(this.sort))
				model.sort = this.sort;		

			return model;
		},	


		/**
		 * Save current model 		
		 * */
		storeCurrentModel: function(){			
			this._stored_model = this.getModel();						
		},

		/**
		 * Get stored model 		
		 * */
		loadStoredModel: function(){			
			return this._stored_model;
		},

		/**
		 * @param {Json} [model] params to sorl request
		 * @returns {String} params in solr-url format 
		 * **/
		buildURLFromModel: function(model){	    	  

			var uniqueURL = "";		      

			if(model.view == 'detail'){
				uniqueURL = sprintf('%s%s%s%s', this._cat_separator, model.view, this._cat_separator, encodeURIComponent(this.encode_q(model.q)) );				  				  
			}else{

				var cat = model.category != undefined && model.category != '' && model.category != 'all' ? sprintf('%1$scategory%1$s%2$s%1$s', this._cat_separator,model.category) : '';
				var q =  model.q != undefined &&  this.encode_q(model.q) != '' ? sprintf('%sq=%s', this._separator, encodeURIComponent(this.encode_q(model.q))) : '';
				var fq =  model.fq != undefined && this.encode_fq(model.fq) != '' ? sprintf('%sfq=%s', this._separator, encodeURIComponent(this.encode_fq(model.fq))) : '';
				var start =  model.start != undefined && model.start != 0 ? sprintf('%sstart=%s', this._separator, encodeURIComponent(model.start)) : '';
				var sort =  model.sort != undefined && model.sort != "score desc" ? sprintf('%ssort=%s', this._separator, encodeURIComponent(model.sort)) : '';


				uniqueURL = sprintf('%s%s%s%s%s', cat, q, fq, start, sort);

			}; 	  

			return sprintf('%s#%s', window.location.href.split('#')[0], uniqueURL.replace(this._separator, ''));

		},

		updateView: function(model){
			this.setModel(model);
			window.location.href = this.buildURLFromModel(this.getModel());
		},

		/******************************
		 * PRIVATE FUNCTIONS
		 * * ****************************/				

		/**
		 * Set model
		 * @param {Json} [model] The model to set.		 
		 * */
		setModelFromJson: function(model){
			this.view = this.getModelValue(model, "view");
			this.category = this.getModelValue(model, "category");
			this.q = this.getModelValue(model, "q");
			this.fq = this.getModelValue(model, "fq");
			this.qf = this.getModelValue(model, "qf");
			this.start = this.getModelValue(model, "start");
			this.sort = this.getModelValue(model, "sort");								
		},

		getModelValue: function(model, type){
			var value = model !== undefined && model != null ? eval("model." + type) : null;
			return this.isValid(value) ? (value == this.current_value_joker ? eval("this." + type) : value) : null;
		},

		/**
		 * Set model
		 * @param {String} [url] The model to set.		 
		 * */
		setModelFromURL: function(url){
			var model = {};

			var cats = url.replace(this._cat_separator, '').split(this._cat_separator);

			if(cats.length > 0){

				switch(cats[0]){
				case "detail":
					model.q = sprintf('"%s"', decodeURIComponent(cats[1]));
					model.view = cats[0];
					break;	

				case "category":												
					model.category = cats[1];	
					model.fq = [{	'value': sprintf('%s:%s', cats[0], cats[1]),
						'locals': {'tag': cats[0]}  
					}];
					this.extract_params(cats[2].split(this._separator), model);						
					break;	

				default:
					this.extract_params(cats[0].split(this._separator), model);
				break;
				}

			}

			this.setModelFromJson(model);

		},


		/**
		 * check if a value is valid
		 * @param {String} [value] The value to check.
		 * @param {String} [type] optional: value's type.
		 * @returns The value.
		 * */
		isValid: function(value, type){

			var res = false;

			switch(type){
			default:
				res = value !== undefined && value != null && value != ''; 
			}

			return res;

		},


		/**
		 * extract model-related values from solr parameters
		 * @param {Array(String)} [params] Params to be extracted
		 * @param {Json} [model] Model !-> will be modified in this function 		 
		 * */
		extract_params: function(params, model){			

			for (var i = 0, l = params.length; i < l; i++) {

				var param = params[i].split('=');
				var value = '';

				if(param !== undefined && param.length > 1){														

					switch(param[0]){

					case "q":
						value = params[i].replace('q=', '');
						value = decodeURIComponent(value);
						model.q = value.split(this._q_separator);
						break;

					case "start":
						value = params[i].replace('start=', '');
						model.start = decodeURIComponent(value);						   	 
						break;	

					case "sort":
						value = params[i].replace('sort=', '');
						model.sort = decodeURIComponent(value);						   	 
						break;	

					case "fq":						  						  
						value = params[i].replace('fq=', '');

						var fq = decodeURIComponent(value).split(this._fq_separator);

						for (var j = 0, k = fq.length; j < k; j++) {
							var fqval= this.decode_fq(fq[j]);
							if (AjaxSolr.isArray(model.fq)){
								model.fq = model.fq.concat(fqval);
							}else{
								model.fq = [fqval]; 
							}
						}					   	 

						break;	
					}
				}						
			};	
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

		/*
		 * fields for the model
		 * **/
		view: null, 
		category: null,
		q: null,
		fq: null,
		qf: null,
		start: null,
		sort: null,

		current_value_joker: '*',

		_separator: '&',		
		_cat_separator: '/',		
		_q_separator: ',',		
		_fq_locals_separator: ';',
		_fq_separator: ',',		
		_default_category: 'all',		
		_default_view: 'teasers',
		_stored_model: null

};
