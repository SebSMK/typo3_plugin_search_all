(function ($) {

AjaxSolr.ResultListWidget = AjaxSolr.AbstractWidget.extend({
  
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
							
	//* load the html template		
	var template = Mustache.getTemplate('pi1/templates/template_list_artworks.html');  				
	
	//* file the loaded template with artworks' data
	var artwork_data = null;
	for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
	      var doc = this.manager.response.response.docs[i];
	      
	    //TO DO ------> the MIX between templating and jquery below is confusing ----> must be simplified
	      
	      //** load data for this artworl
	      artwork_data = self.getData(doc);	      
	      
	      //** merge data and template
	      var html = Mustache.to_html(template, artwork_data);
		  $target.append(html);
		  		  
		  //** manage clickhandlers
		  //* artwork ---> but if url has an image??? ררררר
		  if (artwork_data.img_id != null && artwork_data.img_id != ""){
			  var path = 'http://cstest:8180/collectionspace/tenant/smk/download/'+ doc.medium_image_data + '/Thumbnail';
			  self.getImage($target.find('#' + artwork_data.img_id), doc.id, path, true);
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
	
  },    
  
  getData: function (doc){
	  var data;
	  
	  var category = (doc.category.length > 0) && (doc.category[0] == "samlingercollectionspace") ? doc.category[0] : "others"; 
	  
	  switch(category)
	  {
		  //** artwork
		  case "samlingercollectionspace":

			 data = {
					 	img_id: "img_" + doc.id,
		  				ref_number: doc.id,
		  				artwork_date: new Date(doc.object_production_date_earliest).getFullYear() ,
		  				img_data_bool: doc.medium_image_data != null ? true :  false,
		  				non_img_data_bool: doc.medium_image_data != null ? false : true,		
		  				img_link: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Medium", doc.medium_image_data),
		  				title: doc.title_first,	  				
		  				artist_name_s: doc.artist_name_ss,	  				
		  				artist_auth_bool: (doc.artist_auth.length > 0 ) && (doc.artist_auth[0] != 'original') ? true : false,
		  				artist_auth: doc.artist_auth[0],
		  				url_bool: false
					};
			     	
		    break;	  
		    
		 //** url
		 case "others":
		 	
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
  
  getImage: function ($target, img_id, path, detail){
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
	    
	    // call detailed view on click on image
	    .click({detail_id: img_id, caller:this}, 
    		function (event) {
	    		event.preventDefault();
		    	$(event.data.caller).trigger({
					type: "smk_search_call_result_detail",
					detail_id: event.data.detail_id
				  });
		    	
		    	return;
		    	
	        	//return self.call_detail(event.data.detail_id);	            
	          })		

	    // *finally*, set the src attribute of the new image to our image
	    .attr('src', path); 
  },
    
  img_id_generator: function(text){	  	  	
	  	var hash = 0, i, char;
		//if (text.length == 0) return hash;
		for (i = 0, l = text.length; i < l; i++) {
		    char  = text.charCodeAt(i);
		    hash  = ((hash<<5)-hash)+char;
		    hash |= 0; // Convert to 32bit integer
		}		
	  	  
		return 'img_smk_' + hash;
  },
  
  call_previous_search: function () {
	  var self = this;
	  //self.manager.setShowDetail(false);

	  //* load solr parameters from the previous search
	  self.manager.store.load(true);   
      
      //self.doRequest();
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