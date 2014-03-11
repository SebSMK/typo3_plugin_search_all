(function (root, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else {
    var uniqueURL = {};
    factory(uniqueURL);
    if (typeof define === "function" && define.amd) {
      define(uniqueURL); // AMD
    } else {
      root.UniqueURL = uniqueURL; // <script>
    }
  }
}(this, function (uniqueURL) {
	
	uniqueURL.constructor = function(url){
		this.url = url;		
		
		this.getParams = function(){
			    
			var res = {};
			var params = this.url.split('&&');
			
			for (var i = 0, l = params.length; i < l; i++) {
				
				var param = params[i].split('=');
				var value = '';
				
				if(param !== undefined && param.length > 1){														
					
					switch(param[0]){
						 
					  case "req":
					   	 value = params[i].replace('req=', '');
					   	 res.req = value;						   	 
						 break;
						 
					  case "view":
					   	 value = params[i].replace('view=', '');
					   	 res.view = value;						   	 
						 break;	
						 
					  case "category":
						   	 value = params[i].replace('category=', '');
						   	 res.category = value;						   	 
							 break;	
					}
				}						
			}
			
			return res;
		}; 


	}
	
}));