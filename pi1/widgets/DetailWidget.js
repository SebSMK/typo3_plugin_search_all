(function ($) {

AjaxSolr.DetailWidget = AjaxSolr.AbstractWidget.extend({
  
	constructor: function (attributes) {
	    AjaxSolr.DetailWidget.__super__.constructor.apply(this, arguments);
	    AjaxSolr.extend(this, {
	      thumbnails_target: null
	    }, attributes);
	  },	
	  
  start: 0,
  
  current_language: null,
  
  default_picture_path: null, 
  
  init: function(){	  	    
	 this.default_picture_path = sprintf('http://%s/%spi1/images/default_picture_2_large.png', $.cookie("smk_search_all_plugin_server_name"), $.cookie("smk_search_all_plugin_dir_base"));
	 this.current_language = this.manager.translator.getLanguage();
  }, 

  afterRequest: function () {	  
	
	var self = this;		
	var $target = $(this.target);
	
	if (!self.getRefresh()){
		self.setRefresh(true);
		return;
	}	 		  	
	
	$target.empty();
	
	var artwork_data = null;
	for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
		var doc = this.manager.response.response.docs[i];      
      	artwork_data = self.get_data(doc);              
    }
		
	//* merge data and template
    var html = self.template_integration_json(artwork_data, 'pi1/templates/detail.html');    
    $target.html(html);
    
    //* add main image
    $target.find('.gallery__main.image_loading').each(function() {    	    	
	  		self.getImage($(this));
	});      	
	
    //* add link to back button
	$target.find('a.back-button').click(
		  {caller:self}, 
		  function (event) {
    		event.preventDefault();
    		
    		//restore previous search request
    		event.data.caller.manager.store.load(true); 
    		
    		// send call to teaser view
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
		  			title: this.getTitle(doc),		  			
		  			image: doc.medium_image_url !== undefined ? doc.medium_image_url : this.default_picture_path,
			  		copyright: "copyright",
			  		img_id:doc.id
		  		},
		  		
		  		info:{
		  			
		  			title: this.getTitle(doc),	
		  			artist_data: doc.artist_name_ss === undefined ? '' : this.getArtist(doc),
		  		    artwork_date: doc.object_production_date_text === undefined? '?' : doc.object_production_date_text.replace(/[()]/g, ''),
		  		    description: this.getDescriptionNote(doc),
		  		    technique: {
		  		    	key: this.manager.translator.getLabel('detail_technique'),  
		  		    	value: smkCommon.firstCapital(this.getTechnique(doc)) 
		  		    },
		  		    meta: {
		  		    	key: this.manager.translator.getLabel('detail_reference'),
		  		    	value: doc.id
		  		    },
		  		    
		  		    acq: false,
		  		    
		  		    dim: false,
		  		    
		  		    location:false,
	  		    
		  		}	  
			};	
	  
	  //* add acquisition data
	  if (doc.acq_date !== undefined || doc.acq_method !== undefined){
		  data.info.acq = {
			key: this.manager.translator.getLabel('detail_acquisition'),  
			date: doc.acq_date,
			method: doc.acq_method !== undefined ? sprintf('%s, ', smkCommon.firstCapital(doc.acq_method)) : null,
			source: doc.acq_source !== undefined ? sprintf('%s - ', doc.acq_source) : null
		  };
		  
	  };
	  
	  
	  //* add dimension data
	  if (doc.heigth_net !== undefined || doc.width_net !== undefined || doc.heigth_brut !== undefined || doc.width_brut !== undefined){
		  
		  data.info.dim = {
			key: this.manager.translator.getLabel('detail_dimension'),			    	
	    	net: false,
	    	net_label: smkCommon.firstCapital(this.manager.translator.getLabel('detail_dimension_net')),
	    	brut: false,
	    	brut_label: smkCommon.firstCapital(this.manager.translator.getLabel('detail_dimension_brut'))
		  };
		  
		  if (doc.heigth_net !== undefined || doc.width_net !== undefined){
			  data.info.dim.net = {
	    		heigth : doc.heigth_net !== undefined ? doc.heigth_net : "-",
		    	width : doc.width_net !== undefined ? doc.width_net : "-",
		    	unit : doc.heigthunit_net
			  };	  		  
		  };
		  
		  if (doc.heigth_brut !== undefined || doc.width_brut !== undefined){
			  data.info.dim.brut = {
	    		heigth : doc.heigth_brut !== undefined ? doc.heigth_brut : "-",
		    	width : doc.width_brut !== undefined ? doc.width_brut : "-",
		    	unit : doc.heigthunit_brut
			 };		  		    			  		    				    				    	  		  
		  }; 
		  
	  };
	  
	  //* add location	 
	  if (this.getlocation(doc.location_name))
		  	data.info.location = {
			  key: this.manager.translator.getLabel('detail_location'),
			  value:doc.location_name
	  		};	  	  
	  
	  return data;	  
  
  },     
  
  getTechnique: function (doc){
	  var technique;
	  var default_value = "-";
	  
	  switch(this.current_language){
		  case "dk":		 			  			  			  
			  technique = doc.prod_technique_dk !== undefined ? doc.prod_technique_dk : default_value;					  			  			  
			  break;
		  case "en":
			  technique = doc.prod_technique_en !== undefined ? doc.prod_technique_en : default_value;
			  break;
		  default:	
			  technique = default_value;
		  	  break;		  
	  }
	  
	  return technique;
  
  },

  getDescriptionNote: function (doc){
	  var note;
	  var default_value = "";
	  
	  switch(this.current_language){
		  case "dk":		 			  			  			  
			  note = doc.description_note_dk !== undefined ? doc.description_note_dk : default_value;					  			  			  
			  break;
		  case "en":
			  note = doc.description_note_en !== undefined ? doc.description_note_en : default_value;
			  break;
		  default:		
			  technique = default_value;
		  	  break;		  
	  }
	  
	  return note;
  
  },
  
  
  getArtist: function(doc){
	  var artistLabel = new Array();
	  
	  if((doc.artist_name_ss.length != doc.artist_auth.length) && (doc.artist_name_ss.length != doc.artist_birth.length) && (doc.artist_name_ss.length != doc.artist_death.length))
		  return doc.artist_name_ss;
	  
	  for (var i = 0, l = doc.artist_name_ss.length; i < l; i++) {
		  var name = doc.artist_name_ss[i];
		  var role = doc.artist_auth[i] != 'original' ? sprintf('<span>%s</span>', doc.artist_auth[i].toLowerCase()) : "";
		  var birth = doc.artist_birth[i];
		  var death = doc.artist_death[i] != '(?)' ? doc.artist_death[i] : (doc.artist_death[i] < 1800) ? doc.artist_death[i] : "";
		  var dates = sprintf('(%s - %s)', birth, death);
		  var padding = i > 0 ? "<br>" : "";
		  var label = role == "" ? sprintf('%s%s&nbsp;<span>%s</span>', padding, name, dates) : sprintf('%s%s&nbsp;%s&nbsp;<span>%s</span>', padding, role, name, dates);
		  artistLabel.push(label);		  		  
	  }
	  
	  return artistLabel;
  },
  
  
  getTitle: function(doc){
	  
	  var title;
	  
	  switch(this.current_language){
		  case "dk":		 			  			  			  
			  title = doc.title_dk !== undefined ? doc.title_dk : doc.title_first;					  			  			  
			  break;
		  case "en":
			  title = doc.title_eng !== undefined ? doc.title_eng : (doc.title_dk !== undefined ? doc.title_dk : doc.title_first);
			  break;
		  default:		    			  			   							  
		  	  title = doc.title_first		  	 		  	  
		  	  break;		  
	  }
	  
	  return title;
  },
  
  getImage: function ($target){
	  var img_id = $target.attr("img_id");
	  var path = $target.attr("src");
	  var alt = $target.attr("alt");
	  var title = $target.attr("alt");
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
	        .append(this);
	    
	      // fade our image in to create a nice effect
	      $target.fadeIn();
	      
	      // trig "this image is loaded" event	      
    	  $(self).trigger({
  			type: "smk_detail_this_img_loaded"
  		  }); 
		 
	    })
	    
	    // if there was an error loading the image, react accordingly
	    .error(function () {
	    	$target
	        // remove the loading class (so no background spinner), 
	        .removeClass('image_loading')
	        .append(sprintf('<img src="%s" />', self.default_picture_path));
	    	$target.fadeIn();
	    	
	    	// trig "this image is loaded" event	      
	    	$(self).trigger({
	    		type: "smk_detail_this_img_loaded"
	  		});
	    })
	    
//	    // call detailed view on click on image
//	    .click({detail_id: img_id, caller:this}, 
//    		function (event) {
//	    		event.preventDefault();
//
//	    		// if this view is the current view, do nothing 
//	    		if ($(this).parent().attr("class") == 'current')
//	    			return;
//	    		
//	    		// ...otherwise, change current selected thumnail
//	    		$(event.data.caller.target).find('a').removeClass('current');	    			    		
//	    		$(this).parent().addClass('current');	
//	    		
//	    		// the thumbnail gallery mustn't be frefreshed
//	    		$(event.data.caller.target).addClass('no_refresh');	    			    			    		
//
//		    	$(event.data.caller).trigger({
//					type: "smk_search_call_detail_from_thumb",
//					detail_id: event.data.detail_id
//				  });
//		    	
//		    	return;
//	          })		

	    .attr('alt', alt)
	    .attr('title', title)
	    
	    // *finally*, set the src attribute of the new image to our image
	    .attr('src', path); 
  },
  
  getlocation: function (location){
	  
		if(location !== undefined)
			return true;
			  
		return false;	  
		  
	  },
  
  call_detail: function (art_id, save_request) {
	  var self = this;
			  	  
	  if(save_request){
		  //* save current solr parameters
		  self.manager.store.save();      		  	
	  }
	  
	  //* delete current (exposed) solr parameters
	  self.manager.store.exposedReset();
	  
  	  var param = new AjaxSolr.Parameter({name: "q", value: 'id_s:"' + art_id +'"'}); 
  	  self.manager.store.add(param.name, param);	     
      	      
      self.doRequest();
      return false;
  }
  
});

})(jQuery);