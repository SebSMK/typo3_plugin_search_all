(function ($) {

AjaxSolr.SorterWidget = AjaxSolr.AbstractFacetWidget.extend({

  init: function () {                  	  
	  var self = this;
	  var $target = $(this.target);
	  
	  //* init template
	  var options = ([{"value": "score desc", "text" : smkCommon.firstCapital(self.manager.translator.getLabel("sorter_relevans")), "selected": true},
                      {"value": "object_production_date_earliest asc", "text" : smkCommon.firstCapital(self.manager.translator.getLabel("sorter_dato_asc")), "selected": false},
                      {"value": "object_production_date_earliest desc", "text" : smkCommon.firstCapital(self.manager.translator.getLabel("sorter_dato_desc")), "selected": false},
                      {"value": "last_update desc", "text" : smkCommon.firstCapital(self.manager.translator.getLabel("sorter_last_updated")), "selected": false}
  					]);
	  var objectedItems = new Array(); 
      
      for (var i = 0, l = options.length; i < l; i++) {
    	  objectedItems.push(options[i]);    	  
      }
 
      var html = self.template_integration_json(
    		  {	"label": smkCommon.firstCapital(this.manager.translator.getLabel("sorter_sort")),
    			"options": objectedItems}, 
    			'#sorterItemsTemplate');
      $target.html(html);
      
      //* add behaviour on select change
      $target.find('select').change(self.clickHandler());
      
      self.init_chosen();
  },	         
  

  /**
   * @returns {Function} Sends a request to Solr if it successfully adds a
   *   filter query with the given value.
   */
  clickHandler: function () {   
	  var self = this;
	  return function (event, params) {
    	event.stopImmediatePropagation(); 
   
    	if (params.selected !== undefined){
    		
    		if(params.selected == ""){
    			if (self.manager.store.remove('sort')){																					
    				$(self).trigger({
    					type: "smk_search_sorter_changed"
    				  });  		
//    				self.doRequest(0);	
    				return false;
    			};
    		}
    		    		    		
    		if (self.manager.store.addByValue('sort', params.selected)){																					
				$(self).trigger({
					type: "smk_search_sorter_changed"
				  });  		
//				self.doRequest(0);
				return false;
			};													
    	};
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
