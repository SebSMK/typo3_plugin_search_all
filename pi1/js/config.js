(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var config = {};
    factory(config);
    if (typeof define === "function" && define.amd) {
      define(config); // AMD
    } else {
      root.Configurator = config; // <script>
    }
  }
}(this, function (config) {
	
	config.constructor = function(){
		
		/*
		 * 
		 */
		this.load_json = function(path){
			var rootsite = smkCommon.getCurrentPluginDir(); 
			var url = rootsite.concat(path);

			 $.ajax({
				  dataType: "json",
				  url: url,
				  async:false,		   
				  success: $.proxy(function(json) {
					  var array = [];
						for (var key in json) {
							var item = json[key];
														
							 switch(key){
								  case "qf_default":		 			  			  			  
									  for (var lang in item) {
								        	this.qf_default[lang] = item[lang]; 		        		        		
								        };					  			  			  
									  break;
									  
								  case "q_default":		 			  			  			  
									  this.q_default = item;			  			  			  
									  break;
									  
								  case "sort_default":		 			  			  			  
									  this.sort_default = item;			  			  			  
									  break;
									  
								  case "exposed":		 			  			  			  									  				    		
								    	this.exposed_params = item;				  			  			  
									  break;		  
							  }
						};					  					  
				  }, this),
				  
				  error: $.proxy(function( jqXHR, textStatus, errorThrown ) {
					  var array = [];				  					  
				  }, this)
				});  
		};
	
		/*
		 * get qf_default in the language passed as parameter 
		 */		
		this.get_qf_default = function(lang){
			
			// check language
			if(!this.qf_default.hasOwnProperty(lang))
				if(!this.qf_default.hasOwnProperty(this.default_lang))
					return "language unknown";			
										
			return this.qf_default[lang];		
		};
		
		/*
		 *
		 */
		this.get_exposed_params = function(){
			return this.exposed_params;
		};
		
		/*
		 *
		 */
		this.get_q_default = function(){
			return this.q_default;
		};
		
		/*
		 *
		 */
		this.get_sort_default = function(){
			return this.sort_default;
		};
	
		/*
		 * variables
		 */
		this.default_lang = 'dk';
		this.qf_default = {}; // qf default
		this.q_default = null; // q default
		this.sort_default = null; // sort default
		this.exposed_params = null; // exposed parameters		
	}
	
}));