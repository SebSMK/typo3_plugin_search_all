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
	  var rootsite = $.cookie("smk_search_all_plugin_dir_base"); // "rootsite" value is pasted to cookie in class.tx_smksearchall_pi1.php	 
	  var url = rootsite.concat('pi1/templates/template_list.html');	  
	  var template = Mustache.getTemplate(url);
	  
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
	  case "list":		 		  
		  switch(newstate["category"]){
			  case "Samlinger":		 			  			  
				  $target.find(".search_smk_result_detail").hide();
				  $target.find("#search_smk_header").show().children().show();
				  $target.find("#search_smk_left").show().children().show();
				  $target.find("#search_smk_right").show().children().show();
				break;	
			  default:		    			  			   
				  $target.find(".search_smk_result_detail").hide();
				  $target.find("#search_smk_header").show().children().show();
			  	  $target.find("#search_smk_left").hide();
			  	  $target.find("#search_smk_right").show().children().show();
				break;		  
		  } 
		  break;
	  case "detail":		    			  			   
		  $target.find("#search_smk_header").hide();
	  	  $target.find("#search_smk_left").hide();
	  	  $target.find("#search_smk_right").hide();
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
