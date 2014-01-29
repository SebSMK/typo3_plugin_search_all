(function ($) {

AjaxSolr.DetailWidget = AjaxSolr.AbstractWidget.extend({
  
	constructor: function (attributes) {
	    AjaxSolr.DetailWidget.__super__.constructor.apply(this, arguments);
	    AjaxSolr.extend(this, {
	      thumbnails_target: null
	    }, attributes);
	  },	
  
  start: 0,
	
  beforeRequest: function () {
    //$(this.target).html($('<img>').attr('src', 'images/ajax-loader.gif'));
  },

  afterRequest: function () {
	  
	if ($(this.target).is(':hidden'))
		  	return;		
  
	var self = this;		
	var $target = $(this.target);		
	
	$target.empty();
	
	var artwork_data = null;
	for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
		var doc = this.manager.response.response.docs[i];      
      	artwork_data = self.get_data(doc);              
    }
		
	//* merge data and template
    var html = self.template_integration_json(artwork_data, 'pi1/templates/detail.html');    
    $target.html(html);
    
    //* add main image
    $target.find('.gallery__main.image_loading').each(function() {    	    	
	  		self.getImage($(this));
	});      	
	
    //* add link to back button
	$target.find('a.back-button').click(
		  {caller:self}, 
		  function (event) {
    		event.preventDefault();
	    	$(event.data.caller).trigger({
				type: "smk_search_call_teasers"
			  });  		    	
	    	return;  		    		            
		  }
	);		
    
  },  
  
  template_integration_json: function (data, templ_path){	  
		var template = Mustache.getTemplate(templ_path);	
		var json_data = {"detail": data};
		var html = Mustache.to_html($(template).find('#detailTemplate').html(), json_data);
		return html;
  },
  
  get_data: function (doc){
	  var data =  {
		  		media:{
		  			title:doc.title_first,		  			
			  		//image: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Original", doc.medium_image_data),
		  			image: doc.medium_image_url,
			  		copyright: "copyright",
			  		img_id:doc.id
		  		},
		  		
		  		info:{
		  			
		  			title:doc.title_first,	
		  		    artist_name: doc.artist_name_ss,
		  		    artwork_date: doc.object_production_date_text === undefined? '-' : doc.object_production_date_text,
		  		    description: doc.description_note,
		  		    technique: {
		  		    	key: "technique",  
		  		    	value: doc.prod_technique
		  		    },
		  		    meta: {
		  		    	key: "inv.num.",  
		  		    	value: doc.id
		  		    },
		  		    
		  		    acq: false,
		  		    
		  		    dim: false,
		  		    
		  		    location:false,
	  		    
		  		}	  
			};	
	  
	  //* add acquisition data
	  if (doc.acq_date !== undefined || doc.acq_method !== undefined){
		  data.info.acq = {
			key: "erhvervelse",  
			date: doc.acq_date,
			method: doc.acq_method,
			note: doc.acq_note,
			source: doc.acq_source
		  };
		  
	  };
	  
	  
	  //* add dimension data
	  if (doc.heigth_net !== undefined || doc.width_net !== undefined || doc.heigth_brut !== undefined || doc.width_brut !== undefined){
		  
		  data.info.dim = {
	    	key: "dimension", 			    	
	    	net: false,
	    	brut: false
		  };
		  
		  if (doc.heigth_net !== undefined || doc.width_net !== undefined){
			  data.info.dim.net = {
	    		heigth : doc.heigth_net !== undefined ? doc.heigth_net : "-",
		    	width : doc.width_net !== undefined ? doc.width_net : "-",
		    	unit : doc.heigthunit_net
			  };	  		  
		  };
		  
		  if (doc.heigth_brut !== undefined || doc.width_brut !== undefined){
			  data.info.dim.brut = {
	    		heigth : doc.heigth_brut !== undefined ? doc.heigth_brut : "-",
		    	width : doc.width_brut !== undefined ? doc.width_brut : "-",
		    	unit : doc.heigthunit_brut
			 };		  		    			  		    				    				    	  		  
		  }; 
		  
	  };
	  
	  //* add location	  	 	  
	  data.info.location = {
			  key:"location",
			  value:doc.location_name
	  };	  	  
	  
	  return data;	  
  
  },     
  
  getImage: function ($target){
	  var img_id = $target.attr("img_id");
	  var path = $target.attr("src");
	  var alt = $target.attr("alt");	  
	  var img = new Image();
	  var self = this;
	  	   
	  // wrap our new image in jQuery, then:
	  $(img)
	    // once the image has loaded, execute this code
	    .load(function () {
	      // set the image hidden by default    
	      $target.hide();
	    
	      // with the holding div #loader, apply:
	      $target
	        // remove the loading class (so no background spinner), 
	        .removeClass('image_loading')
	        // then insert our image
	        .append(this);
	    
	      // fade our image in to create a nice effect
	      $target.fadeIn();
	      
	      // trig "image loaded" event
	      //if ($container.find('.image_loading').length == 0){
//	    	  $(self).trigger({
//	  			type: "smk_related_all_img_loaded"
//	  		  });  	    	  
	      //}
		 
	    })
	    
	    // if there was an error loading the image, react accordingly
	    .error(function () {
	    	$target
	        // remove the loading class (so no background spinner), 
	        .removeClass('image_loading')
	        .append(sprintf('<img src="http://%s/%spi1/images/default_picture_2_large.png" />', $.cookie("smk_search_all_plugin_server_name"), $.cookie("smk_search_all_plugin_dir_base")));
	    	$target.fadeIn();
	    	// has all images been loaded, trig event
//	    	if ($container.find('.image_loading').length == 0){
//		    	  $(self).trigger({
//		  			type: "smk_related_all_img_loaded"
//		  		  });  	    	  
//		      }
	    })
	    
//	    // call detailed view on click on image
//	    .click({detail_id: img_id, caller:this}, 
//    		function (event) {
//	    		event.preventDefault();
//
//	    		// if this view is the current view, do nothing 
//	    		if ($(this).parent().attr("class") == 'current')
//	    			return;
//	    		
//	    		// ...otherwise, change current selected thumnail
//	    		$(event.data.caller.target).find('a').removeClass('current');	    			    		
//	    		$(this).parent().addClass('current');	
//	    		
//	    		// the thumbnail gallery mustn't be frefreshed
//	    		$(event.data.caller.target).addClass('no_refresh');	    			    			    		
//
//		    	$(event.data.caller).trigger({
//					type: "smk_search_call_detail_from_thumb",
//					detail_id: event.data.detail_id
//				  });
//		    	
//		    	return;
//	          })		

	    .attr('alt', alt)
	    
	    // *finally*, set the src attribute of the new image to our image
	    .attr('src', path); 
  },
  
  
  call_detail: function (art_id, save_request) {
	  var self = this;
			  	  
	  if(save_request){
		  //* save current solr parameters
		  self.manager.store.save();      		  	
	  }
	  
	  //* delete current (exposed) solr parameters
	  self.manager.store.exposedReset();
	  
  	  var param = new AjaxSolr.Parameter({name: "q", value: "id:" + art_id}); 
  	  self.manager.store.add(param.name, param);	     
      	      
      self.doRequest();
      return false;
  }
  
});

})(jQuery);