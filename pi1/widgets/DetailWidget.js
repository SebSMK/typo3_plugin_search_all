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
	 this.default_picture_path = smkCommon.getDefaultPicture('large');
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
	
	// in case there are no results
	if (this.manager.response.response.docs.length == 0){
		$target
        // remove the loading class (so the StateManager can remove background spinner), 
        .removeClass('image_loading')
        .html(this.manager.translator.getLabel("no_results"))	
	  // trig "this image is loaded" event	      
  	  $(self).trigger({
			type: "smk_detail_this_img_loaded"
	  });
  	  return;		
	}
	
	var artwork_data = null;
	for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
		var doc = this.manager.response.response.docs[i];      
      	artwork_data = self.get_data(doc);              
    }
		
	//* merge data and template
    var html = self.template_integration_json({"detail": artwork_data}, '#detailTemplate');    
    $target.html(html);
    
    //* add main image
    $target.find('.gallery__main.image_loading').each(function() {    	    	
	  		self.getImage($(this));
	});      	
	
    //* add link to back button	  
    //$target.find('a.back-button').css('opacity', '1');
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
   
  template_integration_json: function (json_data, templ_id){	  
		var template = this.template; 	
		var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
		return html;
  },
  
  get_data: function (doc){
	  var data =  {
		  		media:{
		  			title: this.getTitle(doc),	
		  			alt: this.getAlt(doc),		  						
		  			image: doc.medium_image_url !== undefined ? doc.medium_image_url : this.default_picture_path,
			  		copyright: doc.medium_image_url !== undefined ? smkCommon.computeCopyright(doc) : this.manager.translator.getLabel("detail_no_photo"),
			  		img_id:doc.id
		  		},
		  		
		  		info:{
		  			
		  			title: this.getTitle(doc),	
		  			artist: doc.artist_name_ss === undefined ? '' : this.getArtist(doc),
		  			artwork_date: this.getObjectProdDate(doc),
		  		    description: this.getDescriptionNote(doc),
		  		    technique: {
		  		    	key: this.manager.translator.getLabel('detail_technique'),  
		  		    	value: smkCommon.firstCapital(this.getTechnique(doc)) 
		  		    },
		  		    meta: {
		  		    	key: this.manager.translator.getLabel('detail_reference'),
		  		    	value: doc.id
		  		    },
		  		    
		  		    image: doc.medium_image_url !== undefined ? doc.medium_image_url : this.default_picture_path,
		  		    
		  		    acq: false,
		  		    
		  		    dim: false,
		  		    
		  		    location:false,
		  		    
		  		    proveniens:false
	  		    
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
	  if (doc.heigth !== undefined || doc.width !== undefined || doc.depth !== undefined ){
		  
		  data.info.dim = {
			key: this.manager.translator.getLabel('detail_dimension'),			    	
			heigth : doc.heigth !== undefined ? doc.heigth : "-",
			width : doc.width !== undefined ? sprintf(' x %s', doc.width) : " x -",
			depth : doc.depth !== undefined ? sprintf(' x %s', doc.depth) : "",
			unit : doc.heigthunit
		  };
		  
	  };
	  
	  //* add location	 
	  if (this.getlocation(doc.location_name))
		  	data.info.location = {
			  key: this.manager.translator.getLabel('detail_location'),
			  value:doc.location_name
	  		};	  	  

	  
	  //* add provenance	 
	  if (this.getProvenance(doc))	  
		  	data.info.proveniens = {
			  key: this.manager.translator.getLabel('detail_provenance'),
			  value: doc.proveniens
	  		};	  	  

	  
	  return data;	  
  
  },   
  
  getObjectProdDate: function (doc){
	  var date;
	  var default_value = "";
	  
	  switch(this.manager.translator.getLanguage()){
		  case "dk":		 			  			  			  
			  date = doc.object_production_date_text_dk !== undefined ? doc.object_production_date_text_dk : default_value;					  			  			  
			  break;
		  case "en":
			  date = doc.object_production_date_text_en !== undefined ? doc.object_production_date_text_en : default_value;
			  break;
		  default:	
			  date = default_value;
		  	  break;		  
	  }
	  
	  return date;
  
  },
  
  getProvenance: function(doc){
	 return this.current_language == "dk" && doc.proveniens !== undefined ? true : false 
  },
  
  
  getAlt: function (doc){	  
	  var artist = this.getArtistName(doc) == '' ? '' : this.getArtistName(doc) + ' - ';
	  var title = this.getTitle(doc);
	  var copyright = smkCommon.computeCopyright(doc); 
	  
	  return  copyright == false ? sprintf('%s%s', artist, title) : sprintf('%s - %s', copyright, title); 	  
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
	  var docBirth;
	  var docDeath;
	  
	  switch(this.current_language){
	  case "dk":		 			  			  			  
		  docBirth = doc.artist_birth_dk;
		  docDeath = doc.artist_death_dk;					  			  			  
		  break;
	  case "en":
		  docBirth = doc.artist_birth_en;
		  docDeath = doc.artist_death_en;
		  break;
	  }
	  
	  
	  if (doc.artist_name_ss !== undefined){
		  // check if all arrays containing artist's data have the same size
		  if((doc.artist_name_ss.length != doc.artist_auth.length) && (doc.artist_name_ss.length != doc.artist_natio.length)  && (doc.artist_name_ss.length != docBirth.length) && (doc.artist_name_ss.length != docDeath.length))
			  return doc.artist_name_ss;
		  
		  for (var i = 0, l = doc.artist_name_ss.length; i < l; i++) {
			  var name = doc.artist_name_ss[i];
			  var role = doc.artist_auth[i] != 'original' ? sprintf('(%s)', doc.artist_auth[i].toLowerCase()) : "";
			  var birth = docBirth[i];
			  var death = docDeath[i] != '(?)' ? docDeath[i] : (docDeath[i] < 1800) ? docDeath[i] : "";
			  var dates = sprintf('%s - %s', birth, death);
			  var nationality = doc.artist_natio[i] != '(?)' ? sprintf('%s, ', doc.artist_natio[i]) : ""
			  var padding = "";
			  
			  var label = sprintf('%s%s&nbsp;<span>%s</span> <br><span>%s%s</span>', padding, name, role, nationality, dates);
			  artistLabel.push({'artist_data' : label});		  		  
		  }		  		  
	  }	  

	  return artistLabel;
  },
  
  
  getArtistName: function(doc){	  	  	  
	  // we take only the first name
	  if (doc.artist_name_ss === undefined)
		  return '';
	  
	  for (var i = 0, l = doc.artist_name_ss.length; i < l; i++) {
		  return doc.artist_name_ss[i];		  		  		  
	  }
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

	      //* if not default picture
	      if ($(this).attr("src") != self.default_picture_path){
	    	  // with the holding div #loader, apply:
		      $target
		        // remove the loading class (so the StateManager can remove background spinner), 
		        .removeClass('image_loading')
		        .find('a')
		        // then insert our image
		        .append(this);
	    	  
	    	  // add fancybox
		      $target.find('a').addClass('fancybox');
		      $(this).fancybox({
	    		  afterClose: function(){
	    		   	 $target.find('img').show();
	    		  }
	      	  });
	      }
	      //* default picture
	      else{
	    	
	    	  $target
	    	  	// remove the loading class (so the StateManager can remove background spinner), 
		        .removeClass('image_loading')
		        // remove link
		        .remove('a')
		        // then insert our image
		        .append(this);
	      };	          
	      
	      // fade our image in to create a nice effect
	      $target.show();
	      
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
	        .remove('a')
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