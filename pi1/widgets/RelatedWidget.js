(function ($) {

AjaxSolr.RelatedWidget = AjaxSolr.AbstractWidget.extend({  

  start: 0,	
  
  default_picture_path: null, 

  init: function(){
	  
	var self = this;
	var $target = $(this.target);		
	
	//* load empty template
	var html = Mustache.getTemplate('pi1/templates/related.html');    
	$target.html($(html).find('#relatedInitTemplate').html());		
	
	$target.find('#teaser-container-grid article').hide();
	
	//* init masonry
    $target.find('#teaser-container-grid').masonry( {
        transitionDuration: 0
    });
    
    this.default_picture_path = sprintf('http://%s/%spi1/images/default_picture_2_large.png', $.cookie("smk_search_all_plugin_server_name"), $.cookie("smk_search_all_plugin_dir_base"));
	  
  },  

  afterRequest: function () {	  				  
	var self = this;
	var $target = $(this.target);
	
	if (!self.getRefresh()){
		self.setRefresh(true);
		return;
	}	 		  
				
	//* remove all existing articles
	var $all_articles = $target.find('#teaser-container-grid article');
	$target.find('#teaser-container-grid').masonry('remove', $all_articles);		
			
	//* create new articles
	for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
		//* load data
		var artwork_data = null;						
		var doc = this.manager.response.response.docs[i];	      	      	      
		
		//* in case there are no results, remove all ".image_loading" class in the widget and send "widget loaded" event
		if (doc.related_id === undefined){
			$target.removeClass('.image_loading');
			$(self).trigger({
	  			type: "smk_related_this_img_loaded"
	  		});
			$target.hide();
			return;			
		} 
			
		doc.related_id.split(';-;').forEach( function(entry){
			  //* load data for this artwork
		      artwork_data = self.getData(entry);	      	      
		      
		      //* merge data and template
		      var html = self.template_integration_json(artwork_data, 'pi1/templates/related.html');     
		      var $article = $(html);

//			      //* add image + link to detail on click on image to the current article
//			      $article.find('.image_loading').each(function() {    	    	
//				  		self.getImage($article, $(this));
//				  });
		      
		      //* add a link to detail on click on title
		      $article.find('.article_artwork')
		      .click({detail_id: artwork_data.img_id, caller:self}, 
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
		);								        
    						
	 };	
	
	 //* add image + link to detail on click on image to all articles
	 $target.find('article').each(function() {    	    	
		self.getImage($(this), $(this).find('.image_loading'));
	 });		


    
  }, 
  
  template_integration_json: function (data, templ_path){	  
		var template = Mustache.getTemplate(templ_path);	
		var json_data = {"artworks": data};
		var html = Mustache.to_html($(template).find('#relatedArticleTemplate').html(), json_data);
		return html;
	  },
    
  getData: function (entry){
	  
	  var title_first = entry.split(';--;')[2];
	  var medium_image_data = entry.split(';--;')[3] != "" ? entry.split(';--;')[3] : this.default_picture_path;
	  var id = entry.split(';--;')[0];
	  var artist_name = entry.split(';--;')[1];
	  
	  return {
		  		id: id,
		  		title: title_first,	 
		  		thumbnail: medium_image_data,				  						  		
		  		meta: [{key: "inv.num.", value: id}],				  		
		  		img_id: id,
		  		artist_name: artist_name			  				
    };
  
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
	  			type: "smk_related_this_img_loaded"
	  		  });  	    	  
	      //}
		 
	    })
	    
	    // if there was an error loading the image, react accordingly
	    .error(function () {
	    	$target
	        // remove the loading class (so no background spinner), 
	        .removeClass('image_loading')
	        .find('a')
	    	.append(sprintf('<img src="%s" />', self.default_picture_path));
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
	    	
	    	// trig "image loaded" event
	    	//if ($container.find('.image_loading').length == 0){
		    	  $(self).trigger({
		  			type: "smk_related_this_img_loaded"
		  		  });  	    	  
		     // }
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

  img_id_generator: function(id){	  	  	
	  	var hash = 0, i, char;
		//if (text.length == 0) return hash;
		for (i = 0, l = id.length; i < l; i++) {
		    char  = id.charCodeAt(i);
		    hash  = ((hash<<5)-hash)+char;
		    hash |= 0; // Convert to 32bit integer
		}		
	  	  
		return 'img_smk_' + hash;
  }
  
});

})(jQuery);