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
	  var data =  {
		  		media:{
		  			title:doc.title_first,	 
			  		//image: sprintf("http://cstest:8180/collectionspace/tenant/smk/download/%s/Original", doc.medium_image_data),
		  			image: doc.medium_image_url,
			  		copyright: "copyright", 
			  		thumbnails: false
		  		},
		  		
		  		info:{
		  			
		  			title:doc.title_first,	
		  		    artist_name: doc.artist_name_ss,
		  		    artwork_date: new Date(doc.object_production_date_earliest).getFullYear(),
		  		    description: doc.content_note,
		  		    technique: {
		  		    	key: "technique",  
		  		    	value: doc.prod_technique_s
		  		    },
		  		    meta: {
		  		    	key: "inv.num.",  
		  		    	value: doc.id
		  		    },
		  		    
		  		    acq: false,
		  		    
		  		    dim: false,
		  		    
		  		    location:false,
		  		    
		  		    prev: {		  		    	 
		  		    	value: "Back to previous search"		  		    	
		  		    }		  		    
		  		}	  
			};	
	  
	  //* add acquisition data
	  if (doc.acq_date !== undefined || doc.acq_method !== undefined){
		  data.info.acq = {
			    	key: "erhvervelse",  
				    	date: doc.acq_date,
				    	method: doc.acq_method,
				    	note: doc.acq_note,
				    	source: doc.acq_source
		  };
		  
	  };
	  
	  
	  //* add dimension data
	  if (doc.heigth_net !== undefined || doc.width_net !== undefined || doc.heigth_brut !== undefined || doc.width_brut !== undefined){
		  
		  data.info.dim = {
			    	key: "dimension", 			    	
			    	net: false,
			    	brut: false
		  };
		  
		  if (doc.heigth_net !== undefined || doc.width_net !== undefined){
			  data.info.dim.net = 
			  			{
				    		heigth : doc.heigth_net !== undefined ? doc.heigth_net : "-",
					    	width : doc.width_net !== undefined ? doc.width_net : "-",
					    	unit : doc.heigthunit_net
				    	};	  		  
		  };
		  
		  if (doc.heigth_brut !== undefined || doc.width_brut !== undefined){
			  data.info.dim.brut = 
			  			{
				    		heigth : doc.heigth_brut !== undefined ? doc.heigth_brut : "-",
					    	width : doc.width_net !== undefined ? doc.width_net : "-",
					    	unit : doc.heigthunit_brut
				    	};		  		    			  		    				    				    	  		  
		  }; 
		  
	  };
	  
	  //* add location	  	 	  
	  data.info.location = {
			  key:"location",
			  value:doc.location_name
	  };
	  	  
	  return data;	  
  
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