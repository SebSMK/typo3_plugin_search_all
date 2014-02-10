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
			var rootsite = $.cookie("smk_search_all_plugin_dir_base"); // "rootsite" value is copied into the cookie in class.tx_smksearchall_pi1.php	 
			var url = rootsite.concat(path);

			 $.ajax({
				  dataType: "json",
				  url: url,
				  async:false,		   
				  success: $.proxy(function(json) {
					  var array = [];
						for (var key in json) {
							var item = json[key];
							if (key == "language") {		        		
						        for (var lang in item) {
						        	this.labels[lang] = item[lang]; 		        		        		
						        };		        			        
						    }else if(key = "config"){
						    	if(item.hasOwnProperty("default"))						    		
						    		this.default_lang = item.default;
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
					return "label unknow in language " + this.default_lang;
				
				if(!this.labels[this.default_lang].hasOwnProperty(label))
					return "label unknow in language " + this.default_lang;
				
				return this.labels[this.default_lang][label];					
			};				
			
			return this.labels[this.current_lang][label];		
		}
	
		/*
		 * set current language
		 */
		this.setLanguage = function(lang){
			this.current_lang = lang;
		};
	
		/*
		 * variables
		 */
		this.labels = {}; // list of labels in different languages
		this.current_lang = null; // current language
		this.default_lang = null; // default language
		
	}
	
}));