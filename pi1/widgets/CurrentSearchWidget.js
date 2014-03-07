(function ($) {

AjaxSolr.CurrentSearchWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,
  
  q: new Array(),

  afterRequest: function () {	  	
	  
	var self = this;
    var links = [];
    
	if (!self.getRefresh()){
		self.setRefresh(true);
		return;
	}	 		  

    for (var i = 0, l = self.q.length; i < l; i++) {      
    	if (self.q[i].text === undefined){
    		links.push({"q": self.q[i].value});
    	}else{
    		links.push({"q": self.q[i].value, "label": self.q[i].text});
    	}    	
    }

    var $target = $(this.target);
    $target.empty();
    
    if (links.length) {                  
      var html = this.template_integration_json({"current": links}, '#currentItemsTemplate');
      $(this.target).html(html);
      $(this.target).find('a').click(self.removeClickedFacet());            
    }
  },

  removeClickedFacet: function () {
    var self = this;
    return function (event) {
      var facet = $(this).attr('q');    	
      if (self.manager.store.removeElementFrom_q(facet)) {   
    	$(self.target).empty();
    	
    	for (var i = 0, l = self.q.length; i < l; i++) {	 
	    	if (self.q[i].value == facet){
	    		self.q.splice(i, 1);	    		
	    		break;
	    	}    	    	
    	 }
    	
    	$(self).trigger({
			type: "smk_search_remove_one_search_string"
    	});
    	
//        self.doRequest();
      }
      return false;
    };
  },    
  
  template_integration_json: function (json_data, templ_id){	  
		var template = this.template; 	
		var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
		return html;
  },
  
  add_q: function(value, text){
	  this.q.push({'value':value, 'text':text});	  	  
  },
  
  removeAllCurrentSearch: function(){
	  var self = this;
	  for (var i = 0, l = self.q.length; i < l; i++) {	 
		  self.removeFacet(self.q[i].value);
  	 	}    	        	  
	  self.q = new Array();
	  
  },
  
  removeFacet: function (facet) {
	  var self = this;	    
	        	
      if (self.manager.store.removeElementFrom_q(facet)) {       	    	
    	for (var i = 0, l = self.q.length; i < l; i++) {	 
	    	if (self.q[i].value == facet){
	    		self.q.splice(i, 1);	    		
	    		break;
	    	}    	    	
    	 }    	        
      }
  }	    
  
});

})(jQuery);
