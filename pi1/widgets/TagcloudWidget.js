(function ($) {

AjaxSolr.TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
	
  afterRequest: function () {
	  
		if (!this.handleCategory(this.currentCategory))
			  return;
		  
		if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
	      $(this.target).html('no items found in current selection');
	      return;
	    }
	
	    var maxCount = 0;
	    var objectedItems = [];
	    for (var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
	      var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
	      if (count > maxCount) {
	        maxCount = count;
	      }
	      objectedItems.push({ facet: facet, count: count });
	    }
	    objectedItems.sort(function (a, b) {
	      return a.facet < b.facet ? -1 : 1;
	    });
	
	    var max_visible = 20;    
	    
	    $(this.target).empty();
	    
	    var title = '';
	    
	    switch(this.field)
		  {
		  case "object_production_century_earliest":		    
			  title = "Periods";  			  
			  break;
		  case "prod_technique":		    
			  title = "Techniques";  			  
			  break;
		  case "artist_natio":		    
			  title = "Countries";  			  
			  break;		  
		  }
	    
	    if(objectedItems.length > 0)
	    	$(this.target).append($('<h2 ></h2>').text(title));
	    
	  	   
	    
	    for (var i = 0, l = objectedItems.length; i < l; i++) {
		      var facet = null; 
	
		      if (this.field == 'object_production_century_earliest'){
		    	  var cent = {"15.0":"15th", "16.0":"16th", "17.0":"17th", "18.0":"18th", "19.0":"19th", "20.0":"20th"};
		    	  facet = cent[objectedItems[i].facet] +' (' + objectedItems[i].count +')';
		    	  
		      }else{
		    	  facet = objectedItems[i].facet.charAt(0).toUpperCase() + objectedItems[i].facet.slice(1) +' (' + objectedItems[i].count +')'; 
		      }
		      var facetclick = objectedItems[i].facet;
		      
		      
		      if (i < max_visible){
		    	  $(this.target).append(
		    		        $('<a href="#" class="tagcloud_item"></a>')
		    		        .text(facet)        
		    		        .click(this.clickHandler(facetclick))
		    		      );  
		      }
		      else{
		    	  $(this.target).append(
		    		        $('<a href="#" class="tagcloud_item moreless_switch_target" style="display:none;"></a>')
		    		        .text(facet)        
		    		        .click(this.clickHandler(facetclick))
		    		      );
		      }	  
	    }
	    
	    if (objectedItems.length > max_visible){
	    	var self = this;
	    	$(this.target).append(
	    	        $('<a class="moreless_switcher" href="#"></a>')
	    	         .html('<span>View more &gt;</span>')       
	    	        .click(function( event ) {
	    				self.moreLessSwitcher(event);		
	    			})
	    	      );
	    }
	    
	  },
  
  moreLessSwitcher: function (event) {
	  event.preventDefault();
	  
	  var $this = $(this);
	  var $event_target = $(event.target);	  
	  	 
	  if ($event_target.text() == 'View more >'){
		  $event_target.parent().parent().find('.moreless_switch_target').show();
		  $event_target.text('View less <') 
	  }
	  else{
		  $event_target.parent().parent().find('.moreless_switch_target').hide();
		  $event_target.text('View more >') 
	  }
	},
	

  setCurrentCategory: function (cat) { 
		  this.currentCategory = cat;
		  
		  this.handleCategory(this.currentCategory);
	  },
	  
	handleCategory: function(cat) { 
		  
			res = false;
		
		  switch(cat)
		  {
		  case "Samlinger":		    
			  $(this.target).show(); 
			  res = true;
			  break;		 
		  default:
			  $(this.target).hide();
		  	  res = false;
		  }
		  
		  return res;
	  }, 

	

});

})(jQuery);
