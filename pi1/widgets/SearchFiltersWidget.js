(function ($) {

AjaxSolr.SearchFiltersWidget = AjaxSolr.AbstractFacetWidget.extend({

constructor: function (attributes) {
    AjaxSolr.SearchFiltersWidget.__super__.constructor.apply(this, arguments);
    AjaxSolr.extend(this, {
      title: null
    }, attributes);
  },

  init: function () {
//	  var self = this;
//	  var $target = $(this.target);
//	  var templ_path = 'pi1/templates/chosen.html';
//	  	  
//	  //$target.hide('fast'); // hide until all styling is ready
//	  
//	  var json_data = {"options" : new Array({title:'title', values:[{ "value": 'value', "text": 'text'}]})};	 
//	  var html = self.template_integration_json(json_data, templ_path); 				  
//	  $target.html(html);	  
//	  
//	  //* init 'chosen' plugin
//	  self.init_chosen();
//	  //$('.chosen--multiple').chosen({no_results_text: "No results found."});
	  
  },
  
  afterRequest: function () {
	  	var self = this;
	  	var $target = $(this.target);
	  	var $select = $(this.target).find('select');
	  	var templ_path = 'pi1/templates/chosen.html';
	  	
	  	if ($target.is(':hidden'))
		  	return;			  		
	  		  	
	  	//* just in case...
	  	if (self.manager.response.facet_counts.facet_fields[self.field] === undefined) {
//	  		var template = Mustache.getTemplate(templ_path);			
//			var html = Mustache.to_html($(template).find('#chosenTemplate').html(), json_data);
//	  		$target.html(html);
//			$('.chosen--multiple').chosen({no_results_text: "No results found."});
			return;
	    }
	
	  	//* proceed facet values
	    var maxCount = 0;
	    var objectedItems = [];
	    for (var facet in self.manager.response.facet_counts.facet_fields[self.field]) {
	      var count = parseInt(self.manager.response.facet_counts.facet_fields[self.field][facet]);
	      if (count > maxCount) {
	        maxCount = count;
	      }
	      objectedItems.push({ "value": facet, "text": facet });
	    }
	    objectedItems.sort(function (a, b) {
	      return a.value < b.value ? -1 : 1;
	    }); 	    	    
	    	
	    //* merge facet data and template
	    var json_data = {"options" : new Array({title:this.title, values:objectedItems}) };	    	    	    
	    var html = self.template_integration_json(json_data, templ_path); 
		
	    //** refresh view
	    //* save previous selected values in the target 'select' component
	  	var previous_values = new Array(); 
	  	$select.find("option:selected").each(function (){
	  		previous_values.push(this.value);
	  	});
	  		  	
	  	$target.hide('fast'); // hide until all styling is ready
	  	
	  	//* remove all options in 'select'...
//	  	$select.empty();	  	
//	  	//*... and copy the new option list
//	  	$select.append($(html).find('option'));
	  	
	  	$target.empty();	  	
//	  	//*... and copy the new option list
	  	$target.html(html);
	  	
		//* add previous selected values in the target 'select' component
		if (previous_values.length > 0)
			$target.find('select').val(previous_values);
		//**
		
		//* add behaviour on select change
		$target.find('select').change(self.clickHandler());
		
//		//* init 'chosen' plugin
		self.init_chosen();
		//$target.find('select').trigger("chosen:updated");
		
		//* show component
		$target.fadeIn();
		
		
	    
//	    for (var i = 0, l = objectedItems.length; i < l; i++) {
//		      var facet = null; 
//	
//		      if (this.field == 'object_production_century_earliest'){
//		    	  var cent = {"15.0":"15th", "16.0":"16th", "17.0":"17th", "18.0":"18th", "19.0":"19th", "20.0":"20th"};
//		    	  facet = cent[objectedItems[i].facet] +' (' + objectedItems[i].count +')';
//		    	  
//		      }else{
//		    	  facet = objectedItems[i].facet.charAt(0).toUpperCase() + objectedItems[i].facet.slice(1) +' (' + objectedItems[i].count +')'; 
//		      }
//		      var facetclick = objectedItems[i].facet;
//
//	    	  $(this.target).append(
//	    		        $('<a href="#" class="tagcloud_item"></a>')
//	    		        .text(facet)        
//	    		        .click(this.clickHandler(facetclick))
//	    		      );  
//		        
//	    }
    
  },
  
  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully adds a
   *   filter query with the given value.
   */
  clickHandler: function () {
    var self = this, meth = this.multivalue ? 'add' : 'set';
    return function (event, params) {
    	if (params.selected !== undefined){
    		if (self[meth].call(self, params.selected)){
                self.doRequest();
        	}
    	}else 
    	if (params.deselected !== undefined){    		
    		if (self.remove(params.deselected)) {
                self.doRequest();
        	}
    	}    	    	
    	return false;
    }
  },  
  
  template_integration_json: function (json_data, templ_path){	  
		var template = Mustache.getTemplate(templ_path);			
		var html = Mustache.to_html($(template).find('#chosenTemplate').html(), json_data);
		return html;
  },
  
  
  init_chosen: function() {
	  /*
	   § Chosen
	  \*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	  var $target = $(this.target); 		
	  
	  $target.find('.chosen select').chosen();

	  // Multiple select
	  $target.find('.chosen--multiple select').chosen({
	    width: "100%"
	  });

	  // Multiple select (always open).
	  $target.find('.chosen--multiple.chosen--open').each( function() {
	    
		    // This 'fix' allows the user to see the select options before he has
		    // interacted with the select box.
		    // 
		    // Chosen do not show the contents of the select boxes by default, so we
		    // have to show them ourselves. In the code below we loop through the options
		    // in the select boxes, adds these to an array, and append each array item
		    // to the <ul> called .chosen-results. Chosen uses .chosen-results to show
		    // the options.
	
		    var chosenResults = $(this).find('.chosen-results');
		    var selectOptions = [];
		    
		    // Put all select options in an array
		    $(this).find('select option').each( function() {
		      selectOptions.push( $(this).text() );
		    });
	
		    // For each item in the array, append a <li> to .chosen-results
		    $.each(selectOptions, function(i, val) {
		      if(this != "") {
		        chosenResults.append('<li class="active-result" data-option-array-index="' + i + '">' + this + '</li>');
	      }
	    });
	  });

	  // Subtle select
	  $target.find('.chosen--simple select').chosen({
	    disable_search: true
	  });  
  }
});

})(jQuery);
