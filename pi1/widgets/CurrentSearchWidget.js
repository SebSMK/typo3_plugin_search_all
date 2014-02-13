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

//    var q = this.manager.store.get('q').val();
//    if (q != '*:*') {
//      links.push($('<a href="#"></a>').text('(x) ' + q).click(function () {
//    	  self.manager.store.remove('q');
//    	  self.manager.store.get('q').val('*:*');
//        self.doRequest();
//        return false;
//      }));
//    }

    //var fq = this.manager.store.values('fq');
    for (var i = 0, l = self.q.length; i < l; i++) {
      //links.push($('<a href="#"></a>').text('(x) ' + fq[i]).click(self.removeFacet(fq[i])));
    	if (self.q[i].text === undefined){
    		links.push({"q": self.q[i].value});
    	}else{
    		links.push({"q": self.q[i].value, "label": self.q[i].text});
    	}
    	
    }

//    if (links.length > 1) {
//      links.unshift($('<a href="#"></a>').text('Remove all').click(function () {
//        self.manager.store.get('q').val('*:*');
//        self.manager.store.remove('fq');
//        $(self).trigger({
//			type: "smk_search_category_removed"			
//		  });  
//        self.doRequest();
//        return false;
//      }));
//    }

    var $target = $(this.target);
    $target.empty();
    
    if (links.length) {                  
      var html = this.template_integration_json(links, 'pi1/templates/current.html');
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
    	
        self.doRequest();
      }
      return false;
    };
  },  
  
  template_integration_json: function (data, templ_path){	  
		var template = Mustache.getTemplate(templ_path);	
		var json_data = {"current": data};
		var html = Mustache.to_html($(template).find('#currentItemsTemplate').html(), json_data);
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
