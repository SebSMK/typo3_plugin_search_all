(function ($) {

AjaxSolr.DetailWidget = AjaxSolr.AbstractWidget.extend({
  
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
	
	var artwork_data = null;
	for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
		var doc = this.manager.response.response.docs[i];      
      	artwork_data = self.get_data(doc);              
    }
		
	//* merge data and template
    var html = self.template_integration_json(artwork_data, 'pi1/templates/detail.html');    
    $target.html(html);
	
    //* add link to previous search
	$target.find('.previous_search').click(
		  {caller:this}, 
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
	  return {
		  		media:[{
		  			title:doc.title_first,	 
			  		image: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Original", doc.medium_image_data),
			  		copyright: "copyright", 
			  		thumbnails: false
		  		}],
		  		
		  		info:[{
		  			title:doc.title_first,	
		  		    artist_name: doc.artist_name_ss,
		  		    artwork_date: new Date(doc.object_production_date_earliest).getFullYear(),
		  		    description:" Lorem ipsum dolor sit amet, sem praesent cras et quis, erat magna mattis vivamus vivamus lectus, sed eius mi fusce faucibus, iste magna sit orci, sit ac et etiam pharetra pede aliquam. Velit lectus, bibendum adipiscing ultrices. Velit ultricies massa, gravida dolor lectus viverra. Sodales id elit. Auctor felis suscipit suspendisse, pretium justo ligula neque etiam praesent dolor, augue dui.Odit sed massa est, eget enim, non tempor aliquam mollis sapien, in donec sed risus rhoncus ut facilisis, neque proin ipsum dis. Sem magna suspendisse enim duis, porta praesent sit malesuada nibh dolor amet, curae augue ut gravida nullam. Adipiscing vivamus mauris. Lacinia phasellus donec non condimentum, arcu duis dictum, scelerisque et nam suspendisse ipsum. Malesuada turpis a, ac metus. Class velit elit, consequat rutrum, vulputate a, suspendisse libero velit leo aenean. Lacus porta, felis venenatis a vitae metus nec. Integer libero consectetuer viverra lacus. Culpa vestibulum enim turpis vitae ut sed, euismod nulla quam dictum morbi. Feugiat nulla odio quisque nec ligula amet.",
		  		    meta: [{
		  		    	key: "inv.num.",  
		  		    	value: doc.id,
		  		    	'type-code': true
		  		    }],
		  		    prev: [{		  		    	 
		  		    	value: "Back to previous search"		  		    	
		  		    }]		  		    
		  		}]	  
			}			 	  
  
  },     
  
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
  },
  
  show_detail_deprecated: function () {
		var self = this;
		var $target = $(this.target);		
		
		$target.empty();
		
		//* load the html template	
		var template = Mustache.getTemplate('pi1/templates/template_detail_artworks.html');
	    
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
  }
  
});

})(jQuery);