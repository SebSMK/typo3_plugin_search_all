(function ($) {

AjaxSolr.RelatedWidget = AjaxSolr.AbstractWidget.extend({  

  start: 0,	
  
  default_picture_path: null, 

  init: function(){
	  
	var self = this;
	var $target = $(this.target);		
	
	//* load empty template
	var html = self.template_integration_json(
			{"artworks": 
				{"label": smkCommon.firstCapital(this.manager.translator.getLabel("related_label"))}
  			}, 
			'#relatedInitTemplate');
	$target.html(html);
	
	$target.find('#teaser-container-grid article').hide();
	
	//* init masonry
    $target.find('#teaser-container-grid').masonry( {
        transitionDuration: 0
    });
    
    this.default_picture_path = smkCommon.getDefaultPicture('medium');
	  
  },  

  afterRequest: function () {	  				  
	var self = this;
	var $target = $(this.target);
	
	if (!self.getRefresh()){
		self.setRefresh(true);
		return;
	}	 		  
				
	//* remove all existing articles
	self.removeAllArticles();
	
	//* in case there's no results back from Solr, remove all ".image_loading" class in the widget and send "widget loaded" event
	if (this.manager.response.response.docs.length == 0){
		$target.removeClass('.image_loading');
		$(self).trigger({
  			type: "smk_related_this_img_loaded"
  		});
		$target.hide();
		return;			
	}
	
	var dataHandler = new getData_Related.constructor(this);
	
	//* create new articles
	for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
		//* load data
		var artwork_data = null;			
		var doc = this.manager.response.response.docs[i];			  
		
		//* in case there are no related works, remove all ".image_loading" class in the widget and send "widget loaded" event
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
		      artwork_data = dataHandler.getData(entry);	      	      
		      
		      //* merge data and template
		      var html = self.template_integration_json({"artworks": artwork_data}, '#relatedArticleTemplate');     
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
		  					detail_id: event.data.detail_id,
		  					save_current_request: false
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
		 dataHandler.getImage($(this), $(this).find('.image_loading'));
	 });
	 
	 //* show the whole widget (in case some parts were hidden)	 
	 $target.show().children().show();
  }, 
  
  removeAllArticles: function(){
	  var $target = $(this.target); 
	  var $all_articles = $target.find('#teaser-container-grid article');
	  
	  if($all_articles.length > 0 )
		  $target.find('#teaser-container-grid').masonry('remove', $all_articles);		 	  
  },  
	  
  template_integration_json: function (json_data, templ_id){	  
		var template = this.template; 	
		var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
		return html;
  }	    
  
});

})(jQuery);