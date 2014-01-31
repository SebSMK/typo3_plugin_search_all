(function ($) {

AjaxSolr.TeasersWidget = AjaxSolr.AbstractWidget.extend({  

  start: 0,		  

  init: function(){
	  
	var self = this;
	var $target = $(this.target);		
	
	//* load empty template
	var html = Mustache.getTemplate('pi1/templates/teasers.html');    
	$target.html($(html).find('#teaserInitTemplate').html());		
	
	$target.find('#teaser-container-grid article').hide();
	
	//* init masonry
    $target.find('#teaser-container-grid').masonry( {
        transitionDuration: 0
    });
	  
  },  

  afterRequest: function () {
	  
	if ($(this.target).is(':hidden'))
		  	return;		
	  
	var self = this;
	var $target = $(this.target);
	
	//* save current article visualization classes	
	var teaser_article_class = $target.find('#teaser-container-grid article').attr('class');	
				
	//* remove all articles
	var $all_articles = $target.find('#teaser-container-grid article');
	$target.find('#teaser-container-grid').masonry('remove', $all_articles);		
	
	
	//* in case there are no results, we create an empty-invisible article - but with the correct visualization class...
	if (this.manager.response.response.docs.length == 0){
		  var html = self.template_integration_json({}, 'pi1/templates/teasers.html');     
	      var $article = $(html);	      
	      //* load current article visualization classes
	      $article.removeClass().addClass(teaser_article_class);	      
	      $target.find('#teaser-container-grid').append($article);	      	        
	      $target.find('#teaser-container-grid').masonry('appended', $article);	 
	      $target.find('.image_loading').removeClass('image_loading').hide();
	      
	      // trig "this image is loaded" event	      
    	  $(self).trigger({
  			type: "smk_teasers_this_img_loaded"
  		  });
	      
    	  return;		
	}
	else{
		//* load data
		var artwork_data = null;		
		for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
		      var doc = this.manager.response.response.docs[i];	      	      	      
		      
		      //* load data for this artwork
		      artwork_data = self.getData(doc);	      	      
		      
		      //* merge data and template
		      var html = self.template_integration_json(artwork_data, 'pi1/templates/teasers.html');     
		      var $article = $(html);
		      
		      //* load current article visualization classes
		      $article.removeClass().addClass(teaser_article_class);		      
		      
		      //* if the current article is an artwork, add a link to detail on click on title
		      $article.find('.article_artwork')
		      .click({detail_id: artwork_data.img_id, caller:this}, 
		      		function (event) {
		  	    		event.preventDefault();
		  		    	$(event.data.caller).trigger({
		  					type: "smk_search_call_detail",
		  					detail_id: event.data.detail_id
		  				  });
		  		    	
		  		    	return;
		  	    })		
		      
		      //* append the current article to list
		      $target.find('#teaser-container-grid').append($article);	      
		      
		      //* refresh masonry
		      $target.find('#teaser-container-grid').masonry('appended', $article);	      
	    }						
		
		  //* add image + link to detail on click on image to all articles
		  $target.find('article').each(function() {    	    	
			self.getImage($(this), $(this).find('.image_loading'));
		  });
	}	   
    
  }, 
  
  template_integration_json: function (data, templ_path){	  
		var template = Mustache.getTemplate(templ_path);	
		var json_data = {"artworks": data};
		var html = Mustache.to_html($(template).find('#teaserArticleTemplate').html(), json_data);
		return html;
	  },
    
  getData: function (doc){
	  var data;
	  
	  var category = (doc.category.length > 0) && (doc.category[0] == "samlingercollectionspace") ? doc.category[0] : "others"; 
	  
	  switch(category)
	  {
		  //** artwork
		  case "samlingercollectionspace":

			 data = {
				  		id:doc.id,
				  		title:doc.title_first,	 
				  		//thumbnail: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Medium", doc.medium_image_data),
				  		thumbnail: doc.medium_image_url,
				  		categories: {name: "Samlinger", url:"#"},
				  		meta: {key: "Inv.num.", value: doc.id},				  		
				  		img_id: doc.id, // for verso and sub-artworks
				  		artist_data: doc.artist_name_ss === undefined ? '' : this.getArtistLabel(doc),	
				  		not_is_artwork: false,
				  		is_artwork: true,
				  		location: false,
				  		
		  				ref_number: doc.id,		  				
		  				artwork_date: doc.object_production_date_text === undefined? '?' : doc.object_production_date_text,
		  				img_data_bool: doc.medium_image_data != null ? true :  false,
		  				non_img_data_bool: doc.medium_image_data != null ? false : true,		
		  				img_link: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Medium", doc.medium_image_data),		  						  				  						  					  				
//		  				artist_auth_bool: (doc.artist_auth.length > 0 ) && (doc.artist_auth[0] != 'original') ? true : false,
		  				//artist_auth: sprintf('(%s)', doc.artist_auth),
		  				
					};
			 
			 if (location !== undefined)
				 data.location = {label: this.getlocationLabel(doc.location_name)};
			     	
		    break;	  
		    
		 //** url
		 case "others":
		 	
		 	data = {
				 		id:doc.id,
			 			title: doc.page_title,
			 			description: sprintf("%s...", doc.page_content.substring(0, 50)),
			 			url: doc.page_url,				 			
			 			meta: [{key: "last modified", value: sprintf("%s-%s-%s", (new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDay())}],
			 			is_artwork: false,
			 			not_is_artwork: true,
			 			
			 			img_id: this.img_id_generator(doc.id),
		  				ref_number: sprintf("%s(...)", doc.page_content.substring(0, 300)),			  				
		  				artwork_date: doc.page_url,
		  				img_data_bool: false,
		  				non_img_data_bool: true, // no image		  							  							  					  			
		  				artist_name_s: sprintf("%s-%s-%s", (new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDay()),	  				
		  				artist_auth_bool: false
					};
		 	break;
	 
		 default:
			  	data = null;

	  };
	  
	  return data;
  
  },  
  
  getArtistLabel: function(doc){
	  var artistLabel = new Array();
	  
	  if(doc.artist_name_ss.length != doc.artist_auth.length)
		  return doc.artist_name_ss;
	  
	  for (var i = 0, l = doc.artist_name_ss.length; i < l; i++) {
		  var name = doc.artist_name_ss[i];
		  var role = doc.artist_auth[i] != 'original' ? sprintf('<span>%s</span>', doc.artist_auth[i].toLowerCase()) : "";
		  var padding = i > 0 ? "<br>" : "";
		  var label = role == "" ? sprintf('%s%s', padding, name) : sprintf('%s%s&nbsp;%s', padding, role, name);
		  artistLabel.push(label);		  		  
	  }
	  
	  return artistLabel;
  },
  
  getImage: function ($container, $target){
	  var img_id = $target.attr("img_id");
	  var path = $target.attr("src");
	  var alt = $target.attr("alt");	  
	  var self = this;
	  
	  //
	  var img = new Image();
	  	   
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
	        .find('a')
	        // call detailed view on click on image
		    .click({detail_id: img_id, caller:self}, 
	    		function (event) {
		    		event.preventDefault();
			    	$(event.data.caller).trigger({
						type: "smk_search_call_detail",
						detail_id: event.data.detail_id
					  });
			    	
			    	return;
		     })	
	        .append(this);
	    
	      // fade our image in to create a nice effect
	      $(this).fadeIn();
	      
	      // trig "this image is loaded" event	      
    	  $(self).trigger({
  			type: "smk_teasers_this_img_loaded"
  		  });  	    	  
        	  
//	   	 // if all images are loaded & list view mode, align images
//    	  if ($container.find('.image_loading .teaser--list').length == 0){
//	    	  self.verticalAlign(); 
//	      }
		 
	    })
	    
	    // if there was an error loading the image, react accordingly
	    .error(function () {
	    	$target
	        // remove the loading class (so no background spinner), 
	        .removeClass('image_loading')
	        .find('a')
	    	.append(sprintf('<img src="http://%s/%spi1/images/default_picture_2_medium.png" />', $.cookie("smk_search_all_plugin_server_name"), $.cookie("smk_search_all_plugin_dir_base")));
	    	// call detailed view on click on image
		    $target.find('a').click({detail_id: img_id, caller:self}, 
	    		function (event) {
		    		event.preventDefault();
			    	$(event.data.caller).trigger({
						type: "smk_search_call_detail",
						detail_id: event.data.detail_id
					  });
			    	
			    	return;
		     });
	    	$target.fadeIn();
	    	
	    	// trig "this image is loaded" event	    	
	    	$(self).trigger({
	    		type: "smk_teasers_this_img_loaded"
	  		});  	    	  	     
	    	  
//	    	// all images are loaded
//	    	if ($container.find('.image_loading').length == 0){
//	    		self.verticalAlign(); 
//		    }
	    })	    	

	    .attr('alt', alt)
	    
	    // *finally*, set the src attribute of the new image to our image
	    .attr('src', path); 
  },

  
  getlocationLabel: function (location){
		  
	if(location !== undefined && location.toUpperCase().indexOf('SAL') != -1)
		return "Kan ses p&aring; museet";
		  
	return "Kan ses efter aftale";	  
	  
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
  
  switch_list_grid: function (view) {
	var self = this;  
	
	 switch(view)
	  {		  
		case "grid":
			self.setTeaserViewGrid();
			//$(this.target).find('#teaser-container-grid').masonry('layout');
			break;
		
		case "list":
			self.setTeaserViewList();
			break;
		
		default:
			self.setTeaserViewGrid();
	  }		
  },
  
//Grid view
  setTeaserViewGrid: function () {
	  var $target = $(this.target);	  
	// Restyling articles
	  var teasers = $target.find('article').each( function() {
	    if ( $(this).hasClass('teaser--list') ) {

	      // Switching classes
	      $(this).removeClass('teaser--list');
	      $(this).removeClass('teaser--two-columns');
	      $(this).addClass('teaser--grid');

	      // Removing inline css
	      $(this).attr('style', '');

	      // Adding CSS position (masonry doesn't add this automatically when rerun - see below)
	      $(this).css('position', 'absolute');

	      // Removing list style vertical alignment for thumbs
	      $(this).find('img').css('margin-top', 'auto');
	    } // end if
	  });

	  // Rerun masonry to enable grid
	  $target.find('#teaser-container-grid').masonry({
	    transitionDuration: 0
	  });
  }, // setTeaserViewGrid

  // List view
  setTeaserViewList: function () {
	  
	  var $target = $(this.target);
	// Resetting the height of the containing element
	  $target.find('#teaser-container-grid').css('height', 'auto');

	  // Restyling articles
	  $target.find('article').each( function() {
	    if ( $(this).hasClass('teaser--grid') ) {

	      // Switching classes
	      $(this).removeClass('teaser--grid');
	      $(this).addClass('teaser--list');

	      // Adjusting CSS
	      $(this).attr('style', '');
	    } // end if

	    // If the teaser container is full width, than make a two column layout.
	    if ( $target.find('#teaser-container-grid').hasClass('full-width') ) {
	      $(this).addClass('teaser--two-columns');
	    }else{
	      $(this).removeClass('teaser--two-columns');	
	    }
	  });
	  	  
	  this.verticalAlign();
	  
  }, // setTeaserViewGrid
  
  
  verticalAlign: function() {
	  
	  var $target = $(this.target);	  
	  
	  $(this.target).show().children().show();
	  
	  // Vertically align thumbs (in relation to their frames)
	  $target.find('.teaser--list img').each( function() {

	    // Calculating offset that will vertically center the thumb
	    // NOTE: 66 is the maximum thumb height in pixels
	    var thumbHeight = $(this).height();
	    var verticalOffset =  (66 - thumbHeight) / 2;

	    if( $(this).height() < 66 ) {
	      $(this).css('margin-top', verticalOffset + 'px');
	    }
	  });
  
  }
  
  
});

})(jQuery);