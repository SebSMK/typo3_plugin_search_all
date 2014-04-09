(function ($) {

AjaxSolr.DetailWidget = AjaxSolr.AbstractWidget.extend({
  
	constructor: function (attributes) {
	    AjaxSolr.DetailWidget.__super__.constructor.apply(this, arguments);
	    AjaxSolr.extend(this, {
	      thumbnails_target: null
	    }, attributes);
	  },	
	  
  start: 0,
  
  current_language: null,
  
  default_picture_path: null, 
  
  init: function(){	  	    
	 this.default_picture_path = smkCommon.getDefaultPicture('large');
	 this.current_language = this.manager.translator.getLanguage();
  }, 

  afterRequest: function () {	  
	
	var self = this;		
	var $target = $(this.target);
	
	if (!self.getRefresh()){
		self.setRefresh(true);
		return;
	}	

	$target.empty();
	
	// in case there are no results
	if (this.manager.response.response.docs.length == 0){
		$target
        // remove the loading class (so the StateManager can remove background spinner), 
        .removeClass('image_loading')
        .html(this.manager.translator.getLabel("no_results"))	
	  // trig "this image is loaded" event	      
  	  $(self).trigger({
			type: "smk_detail_this_img_loaded"
	  });
  	  return;		
	}
	
	var artwork_data = null;
	var dataHandler = new getData_Detail.constructor(this);
	
	for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
		var doc = this.manager.response.response.docs[i];      
      	artwork_data = dataHandler.get_data(doc);              
    }
		
	//* merge data and template
    var html = self.template_integration_json({"detail": artwork_data}, '#detailTemplate');    
    $target.html(html);    
    
    //* add main image
    $target.find('.gallery__main.image_loading').each(function() {    	    	
	  	dataHandler.getImage($(this));
	});      	
	
    //* add link to back button	  
    //$target.find('a.back-button').css('opacity', '1');
	$target.find('a.back-button').click(
		  function (event) {
    		event.preventDefault();
    		// send call to teaser view restoring (but without sending a request to Solr)
	    	$(self).trigger({
				type: "smk_search_call_teasers"
			});  		    		    		    			
	    	return;  		    		            
		  }
	);
	
    
  },  
   
  template_integration_json: function (json_data, templ_id){	  
		var template = this.template; 	
		var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
		return html;
  }  
  
});

})(jQuery);