(function ($) {

AjaxSolr.SearchFiltersWidget = AjaxSolr.AbstractFacetWidget.extend({

constructor: function (attributes) {
    AjaxSolr.SearchFiltersWidget.__super__.constructor.apply(this, arguments);
    AjaxSolr.extend(this, {
      title: null
    }, attributes);
  },
	
  afterRequest: function () {
	  	var self = this;
	  	var $target = $(this.target);
	  	
	  	if ($target.is(':hidden'))
		  	return;			  
		  
		if (self.manager.response.facet_counts.facet_fields[self.field] === undefined) {
			$target.html('no items found in current selection');
	      return;
	    }
	
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
 
	    
	    $target.empty();
	    	
	    var options_json = {"options" : new Array({title:this.title, values:objectedItems}) };	    	    
	    
	    var html = self.template_integration_json(options_json, 'pi1/templates/chosen.html') 
		$target.html(html);
		
//
//    
//    
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

		
	    self.init_chosen();
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
	  $('.chosen select').chosen();

	  // Multiple select
	  $('.chosen--multiple select').chosen({
	    width: "100%"
	  });

	  // Multiple select (always open).
	  $('.chosen--multiple.chosen--open').each( function() {
	    
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
	  $('.chosen--simple select').chosen({
	    disable_search: true
	  });  
  }
});

})(jQuery);
