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
	
	
	//* in case there are no result, we create an empty-invisible article
	if (this.manager.response.response.docs.length == 0){
		  var html = self.template_integration_json({}, 'pi1/templates/teasers.html');     
	      var $article = $(html);	      
	      //* load current article visualization classes
	      $article.removeClass().addClass(teaser_article_class);	      
	      $target.find('#teaser-container-grid').append($article);	      	        
	      $target.find('#teaser-container-grid').masonry('appended', $article);	 
	      $target.find('#teaser-container-grid article').hide();
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
		      
		      $target.find('#teaser-container-grid').append($article);	      
		      $target.find('#teaser-container-grid .image_loading[img_id='+artwork_data.img_id +']' ).each(function() {    	    	
		  		self.getImage($target, $(this));
		      });  
		      $target.find('#teaser-container-grid').masonry('appended', $article);	      
	    }						
	}
	
				
	
	 //$target.find('#teaser-container-grid').masonry('layout');
	
//    //* merge data and template
//    var html = self.template_integration_json(objectedItems, 'pi1/templates/teasers.html');    
//    $target.html(html);
//
//    
//    //* load saved classes
//    $target.find('#teaser-container-grid').removeClass().addClass(self.teaser_class );
//	$target.find('#teaser-container-grid article').removeClass().addClass(self.teaser_grid_class);
//    
//	//* start masonry jquery
//    $target.find('#teaser-container-grid').masonry( {
//        transitionDuration: 0
//    });
//    
//    //* add images and associated click handling
//    $target.find( ".image_loading" ).each(function() {    	    	
//		self.getImage($target, $(this));
//    });        
    
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
				  		title:doc.title_first,	 
				  		thumbnail: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Medium", doc.medium_image_data),				  		
				  		categories: [{name: "Samlinger", url:"#"}],
				  		meta: [{key: "inv.num.", value: doc.id}],				  		
				  		img_id: doc.id,
				  		artist_name: doc.artist_name_ss,	
				  		not_is_artwork: false,
				  		is_artwork: true,
				  		
		  				ref_number: doc.id,		  				
		  				artwork_date: new Date(doc.object_production_date_earliest).getFullYear() ,
		  				img_data_bool: doc.medium_image_data != null ? true :  false,
		  				non_img_data_bool: doc.medium_image_data != null ? false : true,		
		  				img_link: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Medium", doc.medium_image_data),		  						  				  						  					  				
//		  				artist_auth_bool: (doc.artist_auth.length > 0 ) && (doc.artist_auth[0] != 'original') ? true : false,
//		  				artist_auth: doc.artist_auth[0],
		  				
					};
			     	
		    break;	  
		    
		 //** url
		 case "others":
		 	
		 	data = {
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
  
  getImage: function ($container, $target){
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
	      $(this).hide();
	    
	      // with the holding div #loader, apply:
	      $target
	        // remove the loading class (so no background spinner), 
	        .removeClass('image_loading')
	        // then insert our image
	        .find('a').append(this);
	    
	      // fade our image in to create a nice effect
	      $(this).fadeIn();
	      
	      // trig "image loaded" event
	      //if ($container.find('.image_loading').length == 0){
	    	  $(self).trigger({
	  			type: "smk_teasers_all_img_loaded"
	  		  });  	    	  
	      //}
		 
	    })
	    
	    // if there was an error loading the image, react accordingly
	    .error(function () {
	    	$target
	        // remove the loading class (so no background spinner), 
	        .removeClass('image_loading')
	    	.addClass('image_default');
	    	
	    	// has all images been loaded, trig event
	    	if ($container.find('.image_loading').length == 0){
		    	  $(self).trigger({
		  			type: "smk_teasers_all_img_loaded"
		  		  });  	    	  
		      }
	    })
	    
	    // call detailed view on click on image
	    .click({detail_id: img_id, caller:this}, 
    		function (event) {
	    		event.preventDefault();
		    	$(event.data.caller).trigger({
					type: "smk_search_call_detail",
					detail_id: event.data.detail_id
				  });
		    	
		    	return;
	          })		

	    .attr('alt', alt)
	    
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
  
  switch_list_grid: function (view) {
	var self = this;  
	
	 switch(view)
	  {		  
		case "grid":
			self.setTeaserViewGrid();
			break;
		
		case "list":
			self.setTeaserViewList();
			break;
		
		default:
			self.setTeaserViewGrid();
	  }		
		
	 $(this.target).find('#teaser-container-grid').masonry('layout');    

  },
  
//Grid view
  setTeaserViewGrid: function () {

	  $(this.target).find('#teaser-container-grid article').removeClass('teaser--list').addClass('teaser--grid');
	  
//    // Restyling articles
//    var teasers = $('article').each( function() {
//      if ( $(this).hasClass('teaser--list') ) {
//
//        // Switching classes
//        $(this).removeClass('teaser--list');
//        $(this).addClass('teaser--grid');
//
//        // Removing list style css
//        $(this).attr('style', '');
//
//        // Adding CSS position (masonry doesn't add this automatically when rerun - see below)
//        $(this).css('position', 'absolute');
//      } // end if
//    });
//
//    // Rerun masonry to enable grid
//    $('#teaser-container-grid').masonry({
//      transitionDuration: 0
//    });
  }, // setTeaserViewGrid

  // List view
  setTeaserViewList: function () {
	  
	  $(this.target).find('#teaser-container-grid article').removeClass('teaser--grid').addClass('teaser--list');
	  
//    // Resetting the height of the containing element
//    $('#teaser-container-grid').css('height', 'auto');
//
//    // Restyling articles
//    $('article').each( function() {
//      if ( $(this).hasClass('teaser--grid') ) {
//
//        // Switching classes
//        $(this).removeClass('teaser--grid');
//        $(this).addClass('teaser--list');
//
//        // Adjusting CSS
//        $(this).css('position', 'relative');
//        $(this).css('float', 'none');
//        $(this).css('width', 'auto');
//        $(this).css('top', 'auto');
//        $(this).css('right', 'auto');
//        $(this).css('bottom', 'auto');
//        $(this).css('left', 'auto');
//      } // end if
//    });
  } // setTeaserViewGrid
  
});

})(jQuery);