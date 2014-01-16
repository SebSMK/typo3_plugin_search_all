(function ($) {

AjaxSolr.SearchFiltersWidget = AjaxSolr.AbstractFacetWidget.extend({

constructor: function (attributes) {
    AjaxSolr.SearchFiltersWidget.__super__.constructor.apply(this, arguments);
    AjaxSolr.extend(this, {
      title: null
    }, attributes);
  },

  init: function () {
	  var self = this;
	  var $target = $(this.target);
	  var templ_path = 'pi1/templates/chosen.html';
	  	  
	  //$target.hide('fast'); // hide until all styling is ready
	  
	  var json_data = {"options" : new Array({title:this.title, values:[{ "value": 'value', "text": ''}]})};	 
	  var html = self.template_integration_json(json_data, templ_path); 				  
	  $target.html(html);	  
	  
	  //* init 'chosen' plugin
	  self.init_chosen();
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
	      objectedItems.push({ "value": facet, "text": facet, "count": count });
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
	  	$select.empty();	  	
	  	//*... and copy the new option list
	  	$select.append($(html).find('option'));	  	
	  	
//	  	$target.empty();	  	
////	  	//*... and copy the new option list
//	  	$target.html(html);
	  	
		//* add previous selected values in the target 'select' component
		if (previous_values.length > 0)
			$target.find('select').val(previous_values);
		//**
		
		//* add behaviour on select change
		$target.find('select').change(self.clickHandler());
		
//		//* init 'chosen' plugin
		//self.init_chosen();
		
		$target.find('select').trigger("chosen:updated");
		
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
		
		
//	  	$select.change(function(event) {
//	  		var value = $(this).find("option:selected").text().split('(')[0] ;
//	  		$(this).find("input").val(value);
//	  		$(this).change();
//	  	});
		
		//* show component
		$target.fadeIn();				    
  },
  
  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully adds a
   *   filter query with the given value.
   */
  clickHandler: function () {
    var self = this, meth = this.multivalue ? 'add' : 'set';
    return function (event, params) {
    	event.stopImmediatePropagation(); 
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
