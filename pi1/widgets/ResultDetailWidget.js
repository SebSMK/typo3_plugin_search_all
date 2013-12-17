(function ($) {

AjaxSolr.ResultDetailWidget = AjaxSolr.AbstractWidget.extend({
  
//	constructor: function (attributes) {
//	    AjaxSolr.ResultWidget.__super__.constructor.apply(this, arguments);
//	    AjaxSolr.extend(this, {
//	      target_detail: null
//	    }, attributes);
//	  },	
  
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
	self.show_detail();
	$target.find('.list-work-text').append(
        $('<a class="detail_switcher" href="#"></a>')
         .html('<span>Return to search &lt;&lt;</span>')       
//         .click(function () {
//        	return self.call_previous_search();	            
//          })
          
          .click({caller:this}, function (event) {
  	    		event.preventDefault();
  		    	$(event.data.caller).trigger({
  					type: "smk_search_call_result_list"
  				  });  		    	
  		    	return;  		    	
  	        	//return self.call_detail(event.data.detail_id);	            
  	        })		
	 );				
  },    
  
  get_data: function (doc){
	  return {
			 	img_id: "img_" + doc.id,
  				ref_number: doc.id,
  				artwork_date: new Date(doc.object_production_date_earliest).getFullYear() ,
  				img_data_bool: doc.medium_image_data != null ? true :  false,
  				non_img_data_bool: doc.medium_image_data != null ? false : true,
  				img_link: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Original", doc.medium_image_data),
  				title: doc.title_first,	  				
  				artist_name_s: doc.artist_name_s,
  				artist_birth: doc.artist_birth,
  				artist_death: doc.artist_death,
  				artist_natio: doc.artist_natio,
  				artist_auth_bool: (doc.artist_auth.length > 0 ) && (doc.artist_auth[0] != 'original') ? true : false,
  				artist_auth: doc.artist_auth[0],
  				heigth_brut:doc.heigth_brut,
  				width_brut:doc.width_brut,
  				heigthunit_brut:doc.heigthunit_brut,
  				widthunit_brut:doc.widthunit_brut,
  				technique:doc.prod_technique_s,
  				url_bool: false
			}			 	  
  
  },  
  
  show_detail: function () {
		var self = this;
		var $target = $(this.target);		
		
		$target.empty();
		
		//* load the html template	
		var rootsite = $.cookie("smk_search_all_plugin_dir_base"); // the "rootsite" value is pasted to cookie in class.tx_smksearchall_pi1.php	 
		var url = rootsite.concat('pi1/templates/template_detail_artworks.html');
		var template = Mustache.getTemplate(url);
	    
		var artwork_data = null;
		for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
			var doc = this.manager.response.response.docs[i];
	      
	      	artwork_data = self.get_data(doc);
	        
	      	if (i == 0){
	      		var html = Mustache.to_html(template, artwork_data);
		      	$target.append(html);
		      
		      	var path = 'http://cstest:8180/collectionspace/tenant/smk/download/'+ doc.medium_image_data + '/Original';
				self.getimage($target.find('#' + artwork_data.img_id), doc.id, path, false);		      			      		
	      	}
	    }
},
  
//  getimage: function ($target, img_id, path, detail){
//	  var img = new Image();
//	  //var path = 'http://cstest:8180/collectionspace/tenant/smk/download/'+ doc.medium_image_data + '/Thumbnail';
//	  var self = this;
//	  
//	  //var img_id = doc.id; 
//	  // wrap our new image in jQuery, then:
//	  $(img)
//	    // once the image has loaded, execute this code
//	    .load(function () {
//	      // set the image hidden by default    
//	      $(this).hide();
//	    
//	      // with the holding div #loader, apply:
//	      $target
//	        // remove the loading class (so no background spinner), 
//	        .removeClass('image_loading')
//	        // then insert our image
//	        .find('a').append(this);
//	    
//	      // fade our image in to create a nice effect
//	      $(this).fadeIn();
//	      
//	      //self.images_event_launcher();
//		 
//	    })
//	    
//	    // if there was an error loading the image, react accordingly
//	    .error(function () {
//	    	$target
//	        // remove the loading class (so no background spinner), 
//	        .removeClass('image_loading')
//	    	.addClass('image_default');
//	    	 
//	    	//self.images_event_launcher();
//	    })
//	    
//	    // call detailed view on click on image
//	    .click({img_link: img_id}, 
//    		function (event) {					        	
//	        	if(detail)	
//	        		return self.call_detail(event.data.img_link);	            
//	          })		
//
//	    // *finally*, set the src attribute of the new image to our image
//	    .attr('src', path); 
//  },
  
  
	getimage: function ($target, img_id, path, detail){
	  var img = new Image();
	  var self = this;

	  // wrap our new image in jQuery, then:
	  $(img)
	    // once the image has loaded, execute this code
	    .load(function () {
	      // set the image hidden by default    
	      $(this).hide();
	    
	      // with the holding div #loader, apply:
	      $target
	        // remove the loading class (so no background spinner), 
	        .removeClass('image_loading')
	        // then insert our image
	        .find('a').append(this);
	    
	      // fade our image in to create a nice effect
	      $(this).fadeIn();
	      
	      //self.images_event_launcher();
		 
	    })
	    
	    // if there was an error loading the image, react accordingly
	    .error(function () {
	    	$target
	        // remove the loading class (so no background spinner), 
	        .removeClass('image_loading')
	    	.addClass('image_default');
	    	 
	    	//self.images_event_launcher();
	    })
	    
//	    // call detailed view on click on image
//	    .click({param1: img_id}, 
//    		function (event) {					        	
//	        	return self.call_detail(img_id);	            
//	          })		

	    // *finally*, set the src attribute of the new image to our image
	    .attr('src', path); 
  },
  
  
  call_detail: function (art_id) {
	  var self = this;
	  //self.manager.setShowDetail(true);			  
	  
	  //* save current solr parameters
	  self.manager.store.save();
      
      self.manager.store.exposedReset();
	  
  	  var param = new AjaxSolr.Parameter({name: "q", value: "id:" + art_id}); 
  	  self.manager.store.add(param.name, param);	     
      	      
      self.doRequest();
      return false;
  }
  
});

})(jQuery);