(function ($) {

AjaxSolr.StateManager = AjaxSolr.AbstractWidget.extend({
	
	/**
	   * @param {Object} [attributes]
	   * @param {Number} [attributes.start] This widget will by default set the
	   *   offset parameter to 0 on each request.
	   */
	constructor: function (attributes) {
	    AjaxSolr.AbstractWidget.__super__.constructor.apply(this, arguments);
	    AjaxSolr.extend(this, {
	      currentState:{}
	    }, attributes);
	  },
	
	init: function () {
	  var self = this;
	  var $target = $(this.target);	  	  
	  var template = Mustache.getTemplate('pi1/templates/general_template.html');
	  
	  $target.empty();	  
	  $target.append(template);	
	  
	  this.viewChanged(this.currentState);
	  this.categoryChanged(this.currentState);
  },
  
  /**
   */
  viewChanged: function (stateChange) {        	    
    var $target = $(this.target);
    
    var newstate = this.getNewState(stateChange);
    
    if (newstate["view"] === undefined && newstate["category"] === undefined )
    	return;
    
    switch(newstate["view"]){
	  case "teasers":		  
		  $target.find("#thumbnails").hide();
		  $target.find("#smk_detail").hide();		  
		  $target.find("#related-artworks").hide();
		  
		  $target.find("#currentsearch").show().children().show();
		  		  
		  $target.find("#category").show().children().show();	
		  $target.find("#viewpicker").show().children().show();
		  $target.find("#pager").show().children().show();
		  $target.find("#pager-header").show().children().show();	
		  
		  $target.find('#smk_teasers').show().children().show();
		  
		  switch(newstate["category"]){
		  case "samlingercollectionspace":		 			  			  			  
			  $target.find("#search-filters").show().children().show();					  			  			  
			  break;	
		  default:		    			  			   							  
		  	  $target.find("#search-filters").hide();		  	 		  	  
		  	  break;		  
		  }
		  
		  break;
		  
	  case "detail":	
		  $target.find("#currentsearch").hide();
		  $target.find("#category").hide();
		  $target.find("#viewpicker").hide();
		  $target.find("#pager").hide();
		  $target.find("#pager-header").hide();
		  
		  $target.find("#search-filters").hide();
		  $target.find("#smk_teasers").hide();		
		  
		  $target.find("#smk_detail").show().children().show();
		  $target.find("#thumbnails").show().children().show();
		  $target.find("#related-artworks").show().children().show();
		  
		  $target.find('.view  #related-artworks #teaser-container-grid').masonry('layout');
		  
		  break;		  
	  } 	

    return;
  },
  
  categoryChanged: function (stateChange) {        	    
	    var $target = $(this.target);
	    
	    var newstate = this.getNewState(stateChange);
	    
	    if (newstate["category"] === undefined )
	    	return;
  
		  switch(newstate["category"]){
			  case "samlingercollectionspace":		 			  			  
				  
				  $target.find("#search-filters").show().children().show();		
				  $target.find('.view  #smk_teasers #teaser-container-grid').removeClass('full-width').hide();
				  //$target.find('.view  #smk_teasers #teaser-container-grid').addClass('teaser--two-columns').show().children().show();
				  //$target.find('.view  #smk_teasers #teaser-container-grid').removeClass('col_3-grid').addClass('col_4-grid').show().children().show();
				  //$target.find('.view  #smk_teasers #teaser-container-grid .teaser--grid').removeClass('col_3--grid').addClass('col_4--grid').show().children().show();				  
				  
				  break;	
			  default:		    			  			   							  
			  	  $target.find("#search-filters").hide();
			  	  $target.find('.view  #smk_teasers #teaser-container-grid').addClass('full-width').hide();
			  	  //$target.find('.view  #smk_teasers #teaser-container-grid').removeClass('teaser--two-columns').show().children().show();
			  	  //$target.find('.view  #smk_teasers #teaser-container-grid').removeClass('col_4-grid').addClass('col_3-grid').show().children().show();
			  	  //$target.find('.view  #smk_teasers #teaser-container-grid .teaser--grid').removeClass('col_4--grid').addClass('col_3--grid').show().children().show();
			  	  
			  	  break;		  
		  }
  
		  if($target.find('.view  #smk_teasers #teaser-container-grid .teaser--grid').length > 0){
			  //* grid view mode
			  $(this).trigger({
					type: "current_view_mode",
					value:'grid'
				 });
			  
		  }else{
			  //* list view mode
			  $(this).trigger({
					type: "current_view_mode",
					value:'list'
				 });
		  }
		
		  $target.find("#smk_teasers").show().children().show();
		  
		  if($target.find('.view  #smk_teasers #teaser-container-grid .teaser--grid').length > 0)
			  $target.find('.view  #smk_teasers #teaser-container-grid').masonry('layout');
			  		
	    return;
	  },
  
  getNewState: function(stateChange) {
	  
	  if (stateChange["view"] !== undefined){
		  this.currentState["view"] = stateChange["view"];			 
	  } 
	  else if (stateChange["category"] !== undefined){
		  this.currentState["category"] = stateChange["category"];
	  }
	  
	  return this.currentState;
  }

});

})(jQuery);
