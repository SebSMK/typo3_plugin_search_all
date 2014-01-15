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
	  
	  this.stateChanged(this.currentState);
  },
  
  /**
   */
  stateChanged: function (stateChange) {        	    
    var $target = $(this.target);
    
    var newstate = this.getNewState(stateChange);
    
    if (newstate["view"] === undefined && newstate["category"] === undefined )
    	return;
    
    switch(newstate["view"]){
	  case "teasers":		  
		  $target.find(".search_smk_result_detail").hide();
		  $target.find("#category").show().children().show();	
		  $target.find("#viewpicker").show().children().show();	
		  
		  switch(newstate["category"]){
			  case "samlingercollectionspace":		 			  			  
				  
				  $target.find("#search-filters").show().children().show();		
				  $target.find('.view  #smk_teasers #teaser-container-grid').removeClass('col_3-grid').addClass('col_4-grid').show().children().show();
				  $target.find('.view  #smk_teasers #teaser-container-grid .teaser--grid').removeClass('col_3--grid').addClass('col_4--grid').show().children().show();				  
				  
				  break;	
			  default:		    			  			   							  
			  	  $target.find("#search-filters").hide();
			  	  $target.find('.view  #smk_teasers #teaser-container-grid').removeClass('col_4-grid').addClass('col_3-grid').show().children().show();
			  	  $target.find('.view  #smk_teasers #teaser-container-grid .teaser--grid').removeClass('col_4--grid').addClass('col_3--grid').show().children().show();
			  	  
			  	  break;		  
		  }
		  
		  $target.find("#smk_teasers").show().children().show();
		  $target.find('.view  #smk_teasers #teaser-container-grid').masonry('layout');
		  
		  break;
	  case "detail":	
		  $target.find("#category").hide();
		  $target.find("#viewpicker").hide();
		  $target.find("#search-filters").hide();
		  $target.find("#smk_teasers").hide();		  
		  $target.find(".search_smk_result_detail").show().children().show();
		  break;		  
	  } 	

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
