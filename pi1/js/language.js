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
						    		this.current_lang = item.default;
						    }
						};					  					  
				  }, this)
				});  
		};
	
		this.getLabel = function(label){
			
			// check language
			if(!this.labels.hasOwnProperty(this.current_lang))
				return "neither selected or default language";
			
			if(!this.labels[this.current_lang].hasOwnProperty(label))
				return "label unknow in language " + this.current_lang;
			
			return this.labels[this.current_lang][label];		
		}
	
		this.setLanguage = function(lang){
			this.current_lang = lang;
		};
	
		// variables
		this.labels = {}; // list of labels in different languages
		this.current_lang = null; // current language
		
	}
	
}));