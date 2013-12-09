(function ($) {

AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
  
	constructor: function (attributes) {
	    AjaxSolr.ResultWidget.__super__.constructor.apply(this, arguments);
	    AjaxSolr.extend(this, {
	      target_detail: null
	    }, attributes);
	  },
	
  start: 0,
  
  type_data_doc: new Array("list", "detail"), 
  
  beforeRequest: function () {
    //$(this.target).html($('<img>').attr('src', 'images/ajax-loader.gif'));
  },

  afterRequest: function () {
	var self = this;

	if (!self.manager.getShowDetail()){
	//** list view
		var $target = $(this.target);
		
		$target.empty();
		
		//* save in a global variable the total number of results (not faceted)  
		//---> רררר TO DO (send event num_res_changed)
		//if (this.manager.store.values('fq').length == 0)
		if (window.refresh_numresultstotal == true){
			window.refresh_numresultstotal = false;
			window.numresultstotal = this.manager.response.response.numFound;
		}
			
								
		//* load the html template	
		var rootsite = $.cookie("smk_search_all_plugin_dir_base"); // the "rootsite" value is pasted to cookie in class.tx_smksearchall_pi1.php	 
		var url = rootsite.concat('pi1/templates/template_list_artworks.html');
		var template = self.get_template(url);  				
		
		//* file the loaded template with artworks' data
		var artwork_data = null;
		for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
		      var doc = this.manager.response.response.docs[i];
		      
		    //TO DO ------> the MIX between templating and jquery below is confusing ----> must be simplified
		      
		      artwork_data = self.get_data(self.type_data_doc[0], doc);	      
		      
		      var html = Mustache.to_html(template, artwork_data);
			  $target.append(html);
			  
			  //* artwork ---> but if url has an image??? ררררר
			  if (artwork_data.img_id != null && artwork_data.img_id != ""){
				  var path = 'http://cstest:8180/collectionspace/tenant/smk/download/'+ doc.medium_image_data + '/Thumbnail';
				  self.getimage($target.find('#' + artwork_data.img_id), doc.id, path, true);
			  };
			  //* url			  
			  if ((doc.category.length > 0) && (doc.category[0] != "samlingercollectionspace") && doc.page_url != null){				  
				  var id = this.img_id_generator(doc.id);				  
				  
				  $target.find('#' + id).click({url: artwork_data.url }, function(event){				  
					  window.open(event.data.url);
					  return false;
				  });
				  
			  };
	    }			
	} 
	else{
	//** detailed view		
		var $target_detail = $(this.target_detail);
		$target_detail.empty();
		self.show_detail();
		$target_detail.find('.list-work-text').append(
	        $('<a class="detail_switcher" href="#"></a>')
	         .html('<span>Return to search &lt;&lt;</span>')       
	         .click(function () {
	        	return self.call_previous_search();	            
	          })
		 );	
	}	
	
  },    

  get_template: function (url) {
	  var template;
	  $.ajax({
		  url: url,
		  async:false,
		  type:"get", 
		  success: function(data) {
			  template = data;
		  },
		  error: function(xhr) {
			  template  = null;
		  }
		});
	  
	  return template;
	  
  },
  
  get_data: function (type_doc, doc){
	  var data;
	  
	  var category = (doc.category.length > 0) && (doc.category[0] == "samlingercollectionspace") ? doc.category[0] : "others"; 
	  
	  switch(category)
	  {
		  //** artwork
		  case "samlingercollectionspace":
				 //* artwork list
				 if (type_doc == this.type_data_doc[0]){
					 data = {
							 	img_id: "img_" + doc.id,
				  				ref_number: doc.id,
				  				artwork_date: new Date(doc.object_production_date_earliest).getFullYear() ,
				  				img_data_bool: doc.medium_image_data != null ? true :  false,
				  				non_img_data_bool: doc.medium_image_data != null ? false : true,		
				  				img_link: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Medium", doc.medium_image_data),
				  				title: doc.title_first,	  				
				  				artist_name_s: doc.artist_name_s,	  				
				  				artist_auth_bool: (doc.artist_auth.length > 0 ) && (doc.artist_auth[0] != 'original') ? true : false,
				  				artist_auth: doc.artist_auth[0],
				  				url_bool: false
							};
				 }
				 //* artwork detail
				 else if (type_doc == this.type_data_doc[1]){
					 data = {
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
							};			 
				 }
				 else{
					 data = null;
				 }
			     	
		    break;	  
		    
		 //** url
		 case "others":
			 	//* url list			 	
			 	data = {
				 			img_id: this.img_id_generator(doc.id),
			  				ref_number: sprintf("%s(...)", doc.page_content.substring(0, 300)),
			  				artwork_date: doc.page_url,
			  				img_data_bool: false,
			  				non_img_data_bool: true, // no image
			  				url_bool: true,
			  				url: doc.page_url,
			  				title: doc.page_title,	  				
			  				artist_name_s: sprintf("%s-%s-%s", (new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDay()),	  				
			  				artist_auth_bool: false
						};
			 	break;
		 
		 default:
			  	data = null;

	  };
	  
	  return data;
  
  },  
  
  getimage: function ($target, img_id, path, detail){
	  var img = new Image();
	  //var path = 'http://cstest:8180/collectionspace/tenant/smk/download/'+ doc.medium_image_data + '/Thumbnail';
	  var self = this;
	  
	  //var img_id = doc.id; 
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
	    
	    // call detailed view on click on image
	    .click({img_link: img_id}, 
    		function (event) {					        	
	        	if(detail)	
	        		return self.call_detail(event.data.img_link);	            
	          })		

	    // *finally*, set the src attribute of the new image to our image
	    .attr('src', path); 
  },
  
  
  img_id_generator: function(text){	  
	  var id = text.replace(/[^\w\s]/gi, '_');
 	  return 'img_smk_' + id.substring(id.length - 6, id.length - 1);
  },
  
//  getimage_detail: function ($target, doc){
//	  var img = new Image();
//	  var path = 'http://cstest:8180/collectionspace/tenant/smk/download/'+ doc.medium_image_data + '/Original';
//	  var self = this;
//	  
//	  var img_id = doc.id; 
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
////	    // call detailed view on click on image
////	    .click({param1: img_id}, 
////    		function (event) {					        	
////	        	return self.call_detail(img_id);	            
////	          })		
//
//	    // *finally*, set the src attribute of the new image to our image
//	    .attr('src', path); 
//  },
  
  
  call_detail: function (art_id) {
	  var self = this;
	  self.manager.setShowDetail(true);			  
	  
	  //* save current solr parameters
	  self.manager.store.save();
      
      self.manager.store.exposedReset();
	  
  	  var param = new AjaxSolr.Parameter({name: "q", value: "id:" + art_id}); 
  	  self.manager.store.add(param.name, param);	     
      	      
      self.doRequest();
      return false;
  },
  
  show_detail: function () {
		var self = this;
		var $target_detail = $(this.target_detail);		
		
		$target_detail.empty();
		
		//* load the html template	
		var rootsite = $.cookie("smk_search_all_plugin_dir_base"); // the "rootsite" value is pasted to cookie in class.tx_smksearchall_pi1.php	 
		var url = rootsite.concat('pi1/templates/template_detail_artworks.html');
		var template = self.get_template(url);
	    
		var artwork_data = null;
		for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
			var doc = this.manager.response.response.docs[i];
	      
	      	artwork_data = self.get_data(self.type_data_doc[1], doc);
	            
	      	var html = Mustache.to_html(template, artwork_data);
	      	$target_detail.append(html);
	      
	      	var path = 'http://cstest:8180/collectionspace/tenant/smk/download/'+ doc.medium_image_data + '/Original';
			self.getimage($target_detail.find('#' + artwork_data.img_id), doc.id, path, false);	      		      
	    }
  },
  
  call_previous_search: function () {
	  var self = this;
	  self.manager.setShowDetail(false);

	  //* load solr parameters from the previous search
	  self.manager.store.load(true);   
      
      self.doRequest();
      return false;
  },
  
  switch_list_grid: function (event) {
	if (typeof event.data.caller === "undefined")
		return false;
 
	var $this_target = $(this.target);
	
	var caller = event.data.caller;
  	
	var artworks = $this_target;
	var artworks_li = $this_target.find("li");

	if(caller == "smk_search_gridview") {	
	
		// remove the list class and change to grid
		artworks.removeClass("explorerList");
		artworks.addClass("explorerGrid");
		
		artworks_li.removeClass("list-work");
		artworks_li.addClass("grid-work");
		
		var artworks_li_div_im = $this_target.find(".list-work-image");				
		artworks_li_div_im.removeClass("list-work-image");
		artworks_li_div_im.addClass("grid-work-image");
						
		var artworks_li_div_text = $this_target.find(".list-work-text");
		artworks_li_div_text.removeClass("list-work-text");
		artworks_li_div_text.addClass("grid-work-text");
	
	}	
	else if(caller == "smk_search_listview") {
			
		// remove the grid view and change to list
		artworks.removeClass("explorerGrid")
		artworks.addClass("explorerList");
		
		artworks_li.removeClass("grid-work");
		artworks_li.addClass("list-work");				
		
		var artworks_li_div_im = $this_target.find(".grid-work-image");				
		artworks_li_div_im.addClass("list-work-image");
		artworks_li_div_im.removeClass("grid-work-image");
						
		var artworks_li_div_text = $this_target.find(".grid-work-text");
		artworks_li_div_text.addClass("list-work-text");
		artworks_li_div_text.removeClass("grid-work-text");	
	} 

  }
  
});

})(jQuery);