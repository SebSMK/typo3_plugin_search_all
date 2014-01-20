(function ($) {

AjaxSolr.RelatedWidget = AjaxSolr.AbstractWidget.extend({  

  start: 0,		  

  init: function(){
	  
	var self = this;
	var $target = $(this.target);		
	
	//* load empty template
	var html = Mustache.getTemplate('pi1/templates/related.html');    
	$target.html($(html).find('#relatedInitTemplate').html());		
	
	$target.find('#related-container-grid article').hide();
	
	//* init masonry
    $target.find('#related-container-grid').masonry( {
        transitionDuration: 0
    });
	  
  },  

  afterRequest: function () {
	  
	if ($(this.target).is(':hidden'))
		  	return;		
	  
	var self = this;
	var $target = $(this.target);
				
	//* remove all articles
	var $all_articles = $target.find('#related-container-grid article');
	$target.find('#related-container-grid').masonry('remove', $all_articles);		
		
	//* in case there are no results, we create an empty-invisible article - but with the correct visualization class...
	for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
		//* load data
		var artwork_data = null;						
		var doc = this.manager.response.response.docs[i];	      	      	      
		
		if (doc.related_id !== undefined){ 
			
			doc.related_id.split(';-;').forEach( function(entry){
				  //* load data for this artwork
			      artwork_data = self.getData(entry);	      	      
			      
			      //* merge data and template
			      var html = self.template_integration_json(artwork_data, 'pi1/templates/related.html');     
			      var $article = $(html);

			      //* add image + click on image to the current article
			      $article.find('.image_loading').each(function() {    	    	
				  		self.getImage($article, $(this));
				  });
			      
			      //* append the current article to list
			      $target.find('#related-container-grid').append($article);	      
			      
			      //* refresh masonry
			      $target.find('#related-container-grid').masonry('appended', $article);	  				
				
				}					
			);								        
	    }						
	}	   
    
  }, 
  
  template_integration_json: function (data, templ_path){	  
		var template = Mustache.getTemplate(templ_path);	
		var json_data = {"artworks": data};
		var html = Mustache.to_html($(template).find('#relatedArticleTemplate').html(), json_data);
		return html;
	  },
    
  getData: function (entry){
	  
	  var title_first = entry.split(';--;')[2];
	  var medium_image_data = entry.split(';--;')[3];
	  var id = entry.split(';--;')[0];
	  var artist_name = entry.split(';--;')[1];
	  
	  return {
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
	  			type: "smk_related_all_img_loaded"
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
		  			type: "smk_related_all_img_loaded"
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