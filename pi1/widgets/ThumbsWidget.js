(function ($) {

AjaxSolr.ThumbsWidget = AjaxSolr.AbstractWidget.extend({
  
  start: 0, 
  
  current_selec: null,

  afterRequest: function () {
	  
	var self = this;		
	var $target = $(this.target);
	
	if ($target.is(':hidden') || $(this.target).length == 0)
	  	return;		  			
	
	$target.empty();
	
	var artwork_data = null;
	for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
		var doc = this.manager.response.response.docs[i];  
		
		//* if not a multi-part work of art, return
		if(doc.multi_work_ref === undefined)
			return;
		
      	artwork_data = self.get_data(doc);
    }
		
	//* merge data and template
    var html = self.template_integration_json(artwork_data, 'pi1/templates/thumb.html');
        
    $target.html(html);
    
    //* add image + link to detail on click on image to the current article
    $target.find('.image_loading').each(function() {    	    	
	  		self.getImage($(this));
	});    			    			
 
  },  
  
  template_integration_json: function (data, templ_path){	  
		var template = Mustache.getTemplate(templ_path);	
		var json_data = {"thumbnails": data};
		var html = Mustache.to_html($(template).find('#thumbTemplate').html(), json_data);
		return html;
  },
  
  get_data: function (doc){
	  var data = null;	  		  	  
	  var thumbnails = new Array();
	  
	  var multi_works = doc.multi_work_ref.split(';-;');
	  var work_parent = new Array();
	  var work_siblings = new Array();
	  var work_children = new Array();
	  
	  if (this.current_selec == null)
		  this.current_selec = doc.id;
	  
	  for ( var i = 0, l = multi_works.length; i<l; ++i ) {
		  
		  var work = multi_works[i].split(';--;');
		  
		  switch(work[0]){
		  
		  	case "parent":
		  		work_parent.push(work);
		  		break;
		  	case "sibling":
		  		work_siblings.push(work);
		  		break;
		  	case "child":
		  		work_children.push(work);
		  		break;		  		  
		  };
	  }
	  	  	  	  
	  if (work_parent.length == 0){
		  thumbnails.push({
			  img_id : doc.id,
			  title : doc.title_first,
			  image : doc.medium_image_url,
			  current: this.current_selec == doc.id
		  }); 		
	  }
	  else{
		  for (var i = 0; i < work_parent.length; i++) {		  
			  this.push_work_til_thumb(work_parent[i], thumbnails);
		  }
	  };
		  
	  for (var i = 0; i < work_siblings.length; i++) {		  
		  this.push_work_til_thumb(work_siblings[i], thumbnails);
	  }		
	  
	  for (var i = 0; i < work_children.length; i++) {		  
		  this.push_work_til_thumb(work_children[i], thumbnails);
	  }
	  
	  data = {thumb : thumbnails};  	  
	  
	  return data;	  
  
  },     
  
  push_work_til_thumb: function(work, thumbnails){
	  var id = work[1];		  
	  var title = work[2];
	  var thumb = work[3];			   
	  
	  thumbnails.push({
			  img_id : id,
			  title : sprintf('%s - %s', id, title),
			  image : thumb,
			  current: this.current_selec == id
		  });  
	  
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
	        .find('a')
	        // call detailed view on click on image
	        .click({detail_id: img_id, caller:self}, 
    		function (event) {
	    		event.preventDefault();

	    		// if this view is the current view, do nothing 
	    		if ($(this).attr("class") == 'current')
	    			return;
	    		
	    		event.data.caller.current_selec = img_id;
	    		
//	    		// ...otherwise, change current selected thumnail
//	    		$(event.data.caller.target).find('a').removeClass('current');	    			    		
//	    		$(this).parent().addClass('current');	
//	    		
//	    		// the thumbnail gallery mustn't be frefreshed
//	    		//$(event.data.caller.target).addClass('no_refresh');	    			    			    		

		    	$(event.data.caller).trigger({
					type: "smk_search_call_detail",
					detail_id: event.data.detail_id
				  });
		    	
		    	return;
	      })		
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
	        .find('a')
	    	.append(sprintf('<img src="http://%s/%spi1/images/default_picture_2_small.png" alt="%s" title="%s"/>', 
	    				$.cookie("smk_search_all_plugin_server_name"), 
	    				$.cookie("smk_search_all_plugin_dir_base"),
	    				alt,
	    				alt
	    				));
	    	// call detailed view on click on image
		    $target.find('a')
		    .click({detail_id: img_id, caller:self}, 
		    		function (event) {
			    		event.preventDefault();

			    		// if this view is the current view, do nothing 
			    		if ($(this).parent().attr("class") == 'current')
			    			return;
			    		
			    		event.data.caller.current_selec = img_id;
			    		
//			    		// ...otherwise, change current selected thumnail
//			    		$(event.data.caller.target).find('a').removeClass('current');	    			    		
//			    		$(this).parent().addClass('current');	
//			    		
//			    		// the thumbnail gallery mustn't be frefreshed
//			    		//$(event.data.caller.target).addClass('no_refresh');	    			    			    		

				    	$(event.data.caller).trigger({
							type: "smk_search_call_detail",
							detail_id: event.data.detail_id
						  });
				    	
				    	return;
			 });
	    	$target.fadeIn();
	    	
	    	// trig "image loaded" event
	    	//if ($container.find('.image_loading').length == 0){
//		    	  $(self).trigger({
//		  			type: "smk_related_all_img_loaded"
//		  		  });  	    	  
		     // }
	    })	    	    

	    .attr('alt', alt)
	    
	    // *finally*, set the src attribute of the new image to our image
	    .attr('src', path); 
  }
  
});

})(jQuery);