(function ($) {

AjaxSolr.SorterWidget = AjaxSolr.AbstractFacetWidget.extend({
	
 constructor: function (attributes) {
	    AjaxSolr.AbstractFacetWidget.__super__.constructor.apply(this, arguments);
	    AjaxSolr.extend(this, {
	      options:{}
	    }, attributes);
  },		
	
  init: function () {                  	  
	  var self = this;
	  var $target = $(this.target);
	  
	  //* init template
	  var objectedItems = new Array();
	  var options = this.options.all;
      
      for (var i = 0, l = options.length; i < l; i++) {
    	  objectedItems.push(options[i]);    	  
      }
 
      var html = self.template_integration_json(
    		  {	"label": smkCommon.firstCapital(this.manager.translator.getLabel("sorter_sort")),
    			"options": objectedItems}, 
    			'#sorterItemsTemplate');
      $target.html(html);
      
      $target.find('select').val(ModelManager.getModel().sort); 
      
      //* add behaviour on select change
      $target.find('select').change(self.clickHandler());
      
      self.init_chosen();
  },	         
  
  
  afterRequest: function(){
	  
	  var self = this;
	  var $target = $(this.target);	   
	  var $select = $target.find('select');
	  
	  if (!self.getRefresh()){
		self.setRefresh(true);
		return;
	  }
	  
	  var currentCategory = ModelManager.getModel().category;	  
	  var options = this.options[currentCategory !== undefined ? currentCategory : "all"];	  	  	  
	  var objectedItems = new Array(); 
	  
	  $target.hide();	  
      
      for (var i = 0, l = options.length; i < l; i++) {
    	  objectedItems.push(options[i]);    	  
      }
 
      var html = self.template_integration_json(
    		  {	"label": smkCommon.firstCapital(this.manager.translator.getLabel("sorter_sort")),
    			"options": objectedItems}, 
    			'#sorterItemsTemplate');
      
      //* remove all options in 'select'...
      $target.find('select').empty();	  	
	  //*... and copy the new option list
	  $target.find('select').append($(html).find('option'));	  	      
      
      $target.find('select').val(ModelManager.getModel().sort); 	
            
      $target.find('select').trigger("chosen:updated");
      
      $target.show();	
	  	  
  },

  /**
   * @returns {Function} Sends a request to Solr if it successfully adds a
   *   filter query with the given value.
   */
  clickHandler: function () {   
	  var self = this;
	  return function (event, params) {
    	event.stopImmediatePropagation(); 
   
    	$(self).trigger({
			type: "smk_search_sorter_changed",
			params: params
		  });  		
    	
//    	if (params.selected !== undefined){
//    		
//    		if(params.selected == ""){
//    			if (self.manager.store.remove('sort')){																					
//    				$(self).trigger({
//    					type: "smk_search_sorter_changed"
//    				  });  		
////    				self.doRequest(0);	
//    				return false;
//    			};
//    		}
//    		    		    		
//    		if (self.manager.store.addByValue('sort', params.selected)){																					
//				$(self).trigger({
//					type: "smk_search_sorter_changed"
//				  });  		
////				self.doRequest(0);
//				return false;
//			};													
//    	};
    	return false;
    }
  },
  
  template_integration_json: function (json_data, templ_id){	  
		var template = this.template; 	
		var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
		return html;
  },
    
  resetSelect: function() {
	$(this.target).find('select').prop('selectedIndex',0);	  	  
	//* update 'chosen' plugin		
	$(this.target).find('select').trigger("chosen:updated");	  	  
  },
  
  
  setOption: function(option) {
	  $(this.target).find('select').val(option);
	  $(this.target).find('select').trigger("chosen:updated");
  },
  
  init_chosen: function() {
	  /*
	   § Chosen
	  \*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	  var $target = $(this.target); 			  

	  // Subtle select
	  $target.find('.chosen--simple select').chosen({
	    disable_search: true
	  });
	   
  }    
  
});

})(jQuery);
