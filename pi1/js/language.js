(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var language = {};
    factory(language);
    if (typeof define === "function" && define.amd) {
      define(language); // AMD
    } else {
      root.Language = language; // <script>
    }
  }
}(this, function (language) {
	
	language.constructor = function(){
		
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
								  case "language":		 			  			  			  
									  for (var lang in item) {
								        	this.labels[lang] = item[lang]; 		        		        		
								        };					  			  			  
									  break;
									  
								  case "collections":		 			  			  			  
									  for (var lang in item) {
								        	this.collections[lang] = item[lang]; 		        		        		
								        };					  			  			  
									  break;
									  
								  case "config":		 			  			  			  
									  if(item.hasOwnProperty("default"))						    		
								    		this.default_lang = item.default;
									  
									  if(item.hasOwnProperty("version"))						    		
								    		this.current_version = item.version;
									  break;		  
							  }
						};					  					  
				  }, this)
				});  
		};
	
		/*
		 * get label in the current language
		 * * if no current language was set, use default language
		 * * if the label doesn't exist in the current language, try default		 
		 */		
		this.getLabel = function(label){
			
			// check language
			if(!this.labels.hasOwnProperty(this.current_lang))
				if(!this.labels.hasOwnProperty(this.default_lang))
					return "neither selected or default language";
			
			if(!this.labels[this.current_lang].hasOwnProperty(label)){
				// if it doesn't exist in current language, try default language
				if(!this.labels.hasOwnProperty(this.default_lang))
					return "label unknow in language " + this.current_lang;
				
				if(!this.labels[this.default_lang].hasOwnProperty(label))
					return "label unknow in language " + this.current_lang;
				
				return this.labels[this.default_lang][label];					
			};				
			
			return this.labels[this.current_lang][label];		
		};
		
		
		/*
		 * get collection by artwork's location in the current language
		 * * if no current language was set, use default language
		 * * if the location doesn't exist in the current language, try default language
		 * * otherwise, return "default" label		 
		 */		
		this.getCollection = function(collection){
			
			// check language
			if(!this.collections.hasOwnProperty(this.current_lang))
				if(!this.collections.hasOwnProperty(this.default_lang))
					return "neither selected or default language";
			
			if(!this.collections[this.current_lang].hasOwnProperty(collection)){
				// if it doesn't exist in current language, try default language
				if(!this.collections.hasOwnProperty(this.default_lang))
					return this.collections[this.current_lang]["default"];
				
				if(!this.collections[this.default_lang].hasOwnProperty(collection))
					return this.collections[this.current_lang]["default"];
				
				return this.collections[this.default_lang][collection];					
			};				
			
			return this.collections[this.current_lang][collection];		
		}
	
		/*
		 * set current language
		 */
		this.setLanguage = function(lang){
			this.current_lang = lang;
		};
		
		/*
		 * get current language
		 */
		this.getLanguage = function(){
			return this.current_lang;
		};
		
		this.getVersion = function(){
			return this.current_version;
		};
	
		/*
		 * variables
		 */
		this.labels = {}; // list of labels in different languages
		this.collections = {}; // list of collections by location in different languages
		this.current_lang = null; // current language
		this.default_lang = null; // default language
		this.current_version = null;
		
	}
	
}));