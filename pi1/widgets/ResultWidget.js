(function ($) {

AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
  
	constructor: function (attributes) {
	    AjaxSolr.ResultWidget.__super__.constructor.apply(this, arguments);
	    AjaxSolr.extend(this, {
	      target_detail: null
	    }, attributes);
	  },
	
  start: 0,
  
  beforeRequest: function () {
    //$(this.target).html($('<img>').attr('src', 'images/ajax-loader.gif'));
  },

  afterRequest: function () {
	var self = this;

	if (!self.manager.getShowDetail()){
	//** search view
		var $target = $(this.target);
		var artwork_data = null;
		
		$target.empty();
		
		// save in a global variable the total number of results (not faceted)
		if (this.manager.store.values('fq').length == 0)
			window.numresultstotal = this.manager.response.response.numFound;
		
		self.images_for_loading = this.manager.response.response.docs.length;		
		
	    for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
	      var doc = this.manager.response.response.docs[i];
	      artwork_data = {img_id: "img_" + doc.id,
	  				ref_number: doc.id,
	  				obj_date_earliest: doc.object_production_date_earliest,
	  				img_data: doc.medium_image_data,
	  				title: doc.title_first,	  				
	  				artist_name_s: doc.artist_name_s,	  				
	  				artist_auth: doc.artist_auth
					};    
	      
	      $target.append(this.template(artwork_data));
	      self.getimage($target.find('#' + artwork_data.img_id), doc);	      
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
		var artwork_data = null;
		
		$target_detail.empty();
	    
		for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
	      var doc = this.manager.response.response.docs[i];
	      artwork_data = {img_id: "img_" + doc.id,
	  				ref_number: doc.id,
	  				obj_date_earliest: doc.object_production_date_earliest,
	  				img_data: doc.medium_image_data,
	  				title: doc.title_first,	  				
	  				artist_name_s: doc.artist_name_s,
	  				artist_birth: doc.artist_birth,
	  				artist_death: doc.artist_death,
	  				artist_natio: doc.artist_natio,
	  				artist_auth: doc.artist_auth,	  				
	  				heigth_brut:doc.heigth_brut,
	  				width_brut:doc.width_brut,
	  				heigthunit_brut:doc.heigthunit_brut,
	  				widthunit_brut:doc.widthunit_brut,
	  				technique:doc.prod_technique_s
					};      
	      
	      $(this.template_detail(artwork_data)).appendTo($target_detail);
	      
	      
//	      $.get('templates/template_result_works.html', function(template) {	    	  
//	    	  $.tmpl(template, artwork_data).appendTo($target_detail);
//	      });
	      
	      self.getimage_detail($target_detail.find('#' + artwork_data.img_id), doc);
	      
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
  
 
  
  template: function (artwork_data) {    
	    var output = '<li class="list-work">' 
	    	    
	    // image
	    output += '<div id="' + artwork_data.img_id +  '" class="list-work-image image_loading">';	    	    
	    if (artwork_data.img_data != ''){	    	
	    	output += '<a class="work-image" href="http://cstest:8180/collectionspace/tenant/smk/download/'+ artwork_data.img_data + '/Medium">';
	    	output += '</a>';
	    };
	    output += '</div>';
	    //---- end image
	    	
	    // text
	    output +='<div class="list-work-text">';	    	            
	    	    
		    //artist name
		    output += '<div class="artist">';			    
			    output += '<span class="artist-name">' + artwork_data.artist_name_s + '</span>';
			    if (artwork_data.artist_auth != 'original'){	
			    	output += '<span class="artist_auth">' + sprintf('(%s)', artwork_data.artist_auth) + '</span>';
			    };
		    output += '</div>';
		    //--- end artist name
		    
	    	// title
	    	var artwork_date = new Date(artwork_data.obj_date_earliest).getFullYear();
	    	output += '<div class="title-and-date">';
	    	output +=  '<span class="title-dk">' + artwork_data.title + '</span>';
	    	output += '<span class="dates">' + artwork_date + '</span>';
	    	output += '</div>';	    	
	    	//----- end title
		    
		    output += '<div class="ref">' + artwork_data.ref_number + '</div>';
	    
	    output += '</div>';
	    //---- end text

	    output += '</li>'
	    return output;
  },
  
  
  template_detail: function (artwork_data) {    
	    var output = '<div class="list-work">' 
	    	    
		    // image
		    output += '<div id="' + artwork_data.img_id +  '" class="list-work-image image_loading">';	   
		    if (artwork_data.img_data != ''){	    	
		    	output += '<a class="work-image" href="http://cstest:8180/collectionspace/tenant/smk/download/'+ artwork_data.img_data + '/Original">';
		    	output += '</a>';
		    };
		    output += '</div>';
		    //---- end image
		    	
		    // text
		    output +='<div class="list-work-text">';	    	            
		    
		    	// title
		    	var artwork_date = new Date(artwork_data.obj_date_earliest).getFullYear();
		    	output += '<div class="title-and-date">';
			    	output +=  '<span class="title-dk">' + artwork_data.title + '</span>';
			    	output += '<span class="dates">' + artwork_date + '</span>';
		    	output += '</div>';	    	
		    	//----- end title
		    
			    //artist data
			    output += '<div class="artist">';
			    	output += '<span class="artist-name">' + artwork_data.artist_name_s + '</span>';
				    if (artwork_data.artist_auth != 'original'){	
				    	output += '<span class="artist_auth">' + sprintf('(%s)', artwork_data.artist_auth) + '</span>';
				    };
				    
				    output += '<div class="artist-other-infos">';
					    output += '<span class="artist-natio">' + artwork_data.artist_natio + '</span>';
					    output += '<span class="artist-dates">' + sprintf('(%s - %s)', artwork_data.artist_birth, artwork_data.artist_death )+ '</span>';
					output += '</div>';
			    output += '</div>';
			    //--- end artist data
			    		    
			    output += '<div class="technique">' + artwork_data.technique + '</div>';
			    output += '<div><span class="dim_brut">' + sprintf('%s%s x %s%s', artwork_data.width_brut, artwork_data.widthunit_brut, artwork_data.heigth_brut, artwork_data.heigthunit_brut) + '</span></div>';
		    	output += '<div class="ref">' + artwork_data.ref_number + '</div>';
		    
		    output += '</div>';
		    //---- end text

	    output += '</div>'
    	 //---- end list-work
	    	
	    	
	    return output;
},
  
  getimage: function ($target, doc){
	  var img = new Image();
	  var path = 'http://cstest:8180/collectionspace/tenant/smk/download/'+ doc.medium_image_data + '/Thumbnail';
	  var self = this;
	  
	  var img_id = doc.id; 
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
	        .removeClass('image_loading');
	    	 
	    	//self.images_event_launcher();
	    })
	    
	    // call detailed view on click on image
	    .click({param1: img_id}, 
    		function (event) {					        	
	        	return self.call_detail(img_id);	            
	          })		

	    // *finally*, set the src attribute of the new image to our image
	    .attr('src', path); 
  },
  
  
  getimage_detail: function ($target, doc){
	  var img = new Image();
	  var path = 'http://cstest:8180/collectionspace/tenant/smk/download/'+ doc.medium_image_data + '/Original';
	  var self = this;
	  
	  var img_id = doc.id; 
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
	        .removeClass('image_loading');
	    	 
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
  
  
//  ,
//
//  init: function () {
//    $(document).on('click', 'a.more', function () {
//      var $this = $(this),
//          span = $this.parent().find('span');
//
//      if (span.is(':visible')) {
//        span.hide();
//        $this.text('more');
//      }
//      else {
//        span.show();
//        $this.text('less');
//      }
//
//      return false;
//    });
//  }
});

})(jQuery);