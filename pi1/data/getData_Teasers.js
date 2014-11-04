(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var getdatateasers = {};
		factory(getdatateasers);
		if (typeof define === "function" && define.amd) {
			define(getdatateasers); // AMD
		} else {
			root.getData_Teasers = getdatateasers; // <script>
		}
	}
}(this, function (getdatateasers) {

	getdatateasers.constructor = function(caller){

		this.getData = function (doc){
			var data;

			var category = (doc.category.length > 0) && (doc.category[0] == "collections") ? doc.category[0] : "others"; 

			switch(category)
			{
			//** artwork
			case "collections":

				data = {
					id:doc.id,
					title:this.getTitle(doc),	 
					thumbnail: doc.medium_image_url !== undefined ? smkCommon.getScaledPicture(doc.medium_image_url, 'medium') : this.caller.default_picture_path,
					loading: true,
					categories: this.getArtworkCategory(doc),
					description: this.getTechnique(doc) == false ? false : smkCommon.firstCapital(this.getTechnique(doc)), 
					meta: {key: smkCommon.firstCapital(this.caller.manager.translator.getLabel("teaser_reference")), value: doc.id},				  		
					img_id: doc.id, // for verso and sub-artworks
					artist_data: doc.artist_name_ss === undefined ? '' : this.getArtist(doc),
					title_pad: doc.artist_name_ss === undefined ? false : true, 		
					artwork_date: this.getObjectProdDate(doc),
					not_is_artwork: false,
					is_artwork: true,
					location: {label: smkCommon.firstCapital(this.getLocation(doc.location_name))},
					copyright: smkCommon.computeCopyright(doc) != false ? smkCommon.computeCopyright(doc) :	this.caller.manager.translator.getLabel('copyright_def'),
					url: this.getDetailUrl(doc.id)
			};



				break;	  

				//** website
			case "others":

				data = {
					id:doc.id,
					title: doc.page_title,
					thumbnail: doc.medium_image_url !== undefined && doc.medium_image_url !== '' ?  smkCommon.getScaledPicture(doc.medium_image_url, 'medium', true) : '',
					loading: doc.medium_image_url !== undefined && doc.medium_image_url !== '' ? true : false,
					description: this.getDescription(doc),
					url: doc.page_url,				 			
					lastupdate: this.getLastUpdate(doc, (doc.category.length > 0) ? doc.category[0].toLowerCase() : ''),
					eventdato : this.getEventsDato(doc, (doc.category.length > 0) ? doc.category[0].toLowerCase() : ''),
					is_artwork: false,
					not_is_artwork: true,
					categories: this.getWebCategory(doc)	

			};
				break;

			default:
				data = null;

			};

			return data;

		};  

		
		this.getDetailUrl = function(id){						
			var params = {};
			params.q = id;
			params.view = 'detail';

			return UniqueURL.getUniqueURL(params);  
		};
		
		this.getWebCategory = function(doc){

			var category = doc.category !== undefined && doc.category.length > 0 ? doc.category[0].toLowerCase() : '';
			var cat_lab = category != '' ? this.caller.manager.translator.getLabel('label_cat_' + category) : '';
			var type = doc.page_eventType_stringS !== undefined ? doc.page_eventType_stringS.toLowerCase() : '';
			var type_lab = type != '' ? sprintf('%s', this.caller.manager.translator.getLabel('label_type_' + type)) : '';
			var name = type_lab != ''? type_lab  : cat_lab;   

			return {'name': name, 'url':'#'};
		};

		this.getLastUpdate = function(doc, category){	  
			var res;
			if (category != "kalender"){
				var date = doc.last_update != undefined ? new Date(doc.last_update) : new Date();		  	  
				var text = sprintf("%s. %s %s", date.getDate(), this.caller.manager.translator.getLabel("month_" + date.getMonth()), date.getFullYear());	
				res = [{key: smkCommon.firstCapital(this.caller.manager.translator.getLabel("teaser_last_update")), value: text}];		  
			}

			return res; 

		};

		this.getEventsDato = function(doc, category){
			var res;	  
			var start = doc.page_eventStartDate_dateS != undefined ? new Date(doc.page_eventStartDate_dateS) : doc.page_eventStartDate_dateS;
			var end =  doc.page_eventEndDate_dateS != undefined ? new Date(doc.page_eventEndDate_dateS) : doc.page_eventEndDate_dateS;

			if (category == "kalender"){
				if(start != undefined && end != undefined && (start.getDate() + start.getMonth() + start.getFullYear() != end.getDate() + end.getMonth() + end.getFullYear())){
					res = sprintf('%s. %s %s - %s. %s %s', start.getDate(), this.caller.manager.translator.getLabel("month_" + start.getMonth()), start.getFullYear(), end.getDate(), this.caller.manager.translator.getLabel("month_" + end.getMonth()), end.getFullYear());		  
				}else if(start != undefined){
					res = sprintf('%s. %s %s', start.getDate(), this.caller.manager.translator.getLabel("month_" + start.getMonth()), start.getFullYear());		  
				};	  
			};

			return res;

		};

		this.getDescription = function(doc){
			var res = sprintf("%s...", doc.page_description !== undefined && doc.page_description !== '' ? doc.page_description.substring(0, 100) : (doc.page_content !== undefined ? doc.page_content.substring(0, 100) : ''))
			return res.replace(/(<([^>]+)>)/ig,""); // filter HTML tags	  
		};

		this.getArtworkCategory = function (doc){	  
			var name = this.caller.manager.translator.getCollection(smkCommon.replace_dansk_char(doc.location_name));

			if (name == ""){
				if (doc.id.toLowerCase().indexOf('kms') != -1){
					name = this.caller.manager.translator.getLabel("label_cat_kms");
				} else if (doc.id.toLowerCase().indexOf('kks') != -1){
					name = this.caller.manager.translator.getLabel("label_cat_kks");
				} else if (doc.id.toLowerCase().indexOf('kas') != -1){
					name = this.caller.manager.translator.getLabel("label_cat_kas");
				} else if (doc.id.toLowerCase().indexOf('dep') != -1){
					name = this.caller.manager.translator.getLabel("label_cat_dep");
				} else{
					name = this.caller.manager.translator.getLabel("label_cat_default");			  
				}
			}

			return {'name': name, 'url':'#'};		  

		};

		this.getObjectProdDate = function (doc){
			var date;
			var default_value = "";

			switch(this.caller.manager.translator.getLanguage()){
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

			return date != default_value ? sprintf(',&nbsp;%s', date) : date;

		};

		this.getTechnique = function (doc){
			var technique;
			var default_value = false;

			switch(this.caller.manager.translator.getLanguage()){
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

		};

		this.getArtist = function(doc){
			var artistLabel = new Array();

			if (doc.artist_name_ss !== undefined){
				if(doc.artist_name_ss.length != doc.artist_auth.length)
					return doc.artist_name_ss;

				for (var i = 0, l = doc.artist_name_ss.length; i < l; i++) {
					var name = doc.artist_name_ss[i].trim();
					var role = doc.artist_auth[i] != 'original' && doc.artist_auth[i] != '' ? sprintf('<span>(%s)</span>', doc.artist_auth[i].toLowerCase()) : "";
					var padding = i > 0 ? "<br>" : "";
					var label = role == "" ? sprintf('%s%s', padding, name) : sprintf('%s%s&nbsp;%s', padding, name, role);
					artistLabel.push(label);		  		  
				}
			}	  

			return artistLabel;
		};

		this.getTitle = function(doc){

			var title;

			switch(this.caller.manager.translator.getLanguage()){
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
		};

		this.getLocation = function (location){

			if(location !== undefined)
				return this.caller.manager.translator.getLabel("teaser_on_display"); 

			return this.caller.manager.translator.getLabel("teaser_appoint");	  

		};

		this.getImage = function ($container, $target){

			var self = this.caller;

			if ($target === undefined || $target.length == 0){
				$(self).trigger({
					type: "smk_teasers_this_img_loaded"
				});  	
				return;
			}

			var img_id = $target.attr("img_id");
			var path = $target.attr("src");
			var alt = $target.attr("alt");
			var title = $target.attr("alt");

			//
			var img = new Image();

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
				.find('a')
				// call detailed view on click on image
				.click(function (event) {
					event.preventDefault();	
					// ... then ---> bubbles op to "click on title"	    		
				})	
				.append(this);

				$(this).addClass('not_displayed');				

				// fade our image in to create a nice effect
				var duration = 400;
				$(this).fadeIn({
					duration: duration, 
					complete: function(){
						$(this).removeClass('not_displayed');
						// trig "this image is loaded" event	      
						$(self).trigger({
							type: "smk_teasers_this_img_displayed"
						}); 						
					}
				}
				);

				// trig "this image is loaded" event	      
				$(self).trigger({
					type: "smk_teasers_this_img_loaded"
				});  	    	  

			})

			// if there was an error loading the image, react accordingly
			.error(function () {
				$target
				// remove the loading class (so no background spinner), 
				.removeClass('image_loading')
				.find('a')	    	
				.append(sprintf('<img src="%s" />', self.default_picture_path));
				// call detailed view on click on image
				$target.find('a').click(function (event) {
					event.preventDefault();
					// ... then ---> bubbles op to "click on title"		    	
				});
				$target.fadeIn();

				// trig "this image is loaded" event	    	
				$(self).trigger({
					type: "smk_teasers_this_img_loaded"
				});  	    	  	     
			})	    	

			.attr('alt', alt)
			.attr('title', title)

			// *finally*, set the src attribute of the new image to our image
			.attr('src', path); 
		};

		/*
		 * variables
		 */
		this.caller = caller;
	}

}));