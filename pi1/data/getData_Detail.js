(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var getdatadetail = {};
		factory(getdatadetail);
		if (typeof define === "function" && define.amd) {
			define(getdatadetail); // AMD
		} else {
			root.getData_Detail = getdatadetail; // <script>
		}
	}
}(this, function (getdatadetail) {

	getdatadetail.constructor = function(caller){

		this.get_data = function (doc){
			var data =  {
					media:{
						title: this.getTitle(doc),	
						alt: this.getAlt(doc),		  						
						image: doc.medium_image_url !== undefined ? doc.medium_image_url : this.caller.default_picture_path,
						copyright: doc.medium_image_url !== undefined ? 
										smkCommon.computeCopyright(doc) != false ?
											smkCommon.computeCopyright(doc)
										:
											this.caller.manager.translator.getLabel('copyright_def')
									: 
										this.caller.manager.translator.getLabel("detail_no_photo"),
						copyright_default: !smkCommon.computeCopyright(doc),
						copyright_valid: smkCommon.computeCopyright(doc),
						img_id:doc.id
					},

					info:{

						title: this.getTitle(doc),	
						artist: doc.artist_name_ss === undefined ? '' : this.getArtist(doc),
						artwork_date: this.getObjectProdDate(doc),
						description: this.getDescriptionNote(doc),
						technique: {
							key: this.caller.manager.translator.getLabel('detail_technique'),  
							value: smkCommon.firstCapital(this.getTechnique(doc)) 
						},
						meta: {
							key: this.caller.manager.translator.getLabel('detail_reference'),
							value: doc.id
						},
						media: {
							fb: sprintf('%s%s?%s%s%s', 
								smkCommon.getPluginURL(),
								'pi1/media/fb.php',
								'image=' + doc.medium_image_url,
								'&title=' + this.get_OG_title(doc),
								'&description=' + this.get_OG_description(doc)
							),
							google: sprintf('%s%s?%s%s%s', 
										smkCommon.getPluginURL(),
										'pi1/media/google.php',
										'image=' + doc.medium_image_url,
										'&title=' + this.get_OG_title(doc),
										'&description=' + this.get_OG_description(doc)
								),
							twitter:{		  		    	
								url: $(location).attr('href').substr(0,$(location).attr('href').indexOf('#')),
								description: sprintf('%s   %s', this.get_OG_title(doc), this.get_OG_description(doc))
							},
							pinterest:{
								image: doc.medium_image_url,
								url: $(location).attr('href').substr(0,$(location).attr('href').indexOf('#')),
								description: sprintf('StatensMuseumForKunst - %s   %s', this.get_OG_title(doc), this.get_OG_description(doc))
							}
						},	

						image: doc.medium_image_url !== undefined ? doc.medium_image_url : this.caller.default_picture_path,
						acq: false,
						dim: false,
						location:false,
						proveniens:false
					},
					
					subwidget:{
						req_multiwork: this.getReq_multiwork(doc),
						req_relatedid: this.getReq_relatedid(doc)
						
					}
			};	

			//* add acquisition data
			if (doc.acq_date !== undefined || doc.acq_method !== undefined){
				data.info.acq = {
						key: this.caller.manager.translator.getLabel('detail_acquisition'),  
						date: doc.acq_date,
						method: doc.acq_method !== undefined ? sprintf('%s, ', smkCommon.firstCapital(doc.acq_method)) : null,
								source: doc.acq_source !== undefined ? sprintf('%s - ', doc.acq_source) : null
				};

			};


			//* add dimension data
			if (doc.dimension_brutto !== undefined || 
				doc.dimension_netto !== undefined || 
				doc.dimension_billedmaal !== undefined || 
				doc.dimension_bladmaal !== undefined){

				data.info.dim = {
						key: this.caller.manager.translator.getLabel('detail_dimension'),			    	
						dim : doc.dimension_brutto !== undefined? doc.dimension_brutto : 
								doc.dimension_netto !== undefined? doc.dimension_netto :
									doc.dimension_billedmaal !== undefined? doc.dimension_billedmaal : doc.dimension_bladmaal  
				};

			};

			//* add location	 
			if (this.getlocation(doc.location_name))
				data.info.location = {
					key: this.caller.manager.translator.getLabel('detail_location'),
					value:doc.location_name
			};	  	  


			//* add provenance	 
			if (this.getProvenance(doc))	  
				data.info.proveniens = {
					key: this.caller.manager.translator.getLabel('detail_provenance'),
					value: doc.proveniens
			};	  	  


			return data;	  

		};   

		this.getReq_multiwork = function(doc){
			if(doc.multi_work_ref === undefined )
				return null;
				
			var multi_works = doc.multi_work_ref.split(';-;');						
			var allworksRequest = null;
			
			if(multi_works.length > 0){
				var work = multi_works[0].split(';--;');
				if(work.length > 2){
					allworksRequest = sprintf('id:"%s"', work[1].split('/')[0]);	
				}					
			}

			return allworksRequest;
		};
		
		this.getReq_relatedid = function(doc){
			if(doc.related_id === undefined )
				return null;
				
			var related_works = doc.related_id.split(';-;');						
			var allrelatedRequest = [];
			
			for ( var i = 0, l = related_works.length; i<l; ++i ) {
				var work = related_works[i].split(';--;');
				if(work.length > 0)
					allrelatedRequest.push(sprintf('id_s:"%s"', work[1]));	
			}

			return allrelatedRequest.length == 0 ? null : allrelatedRequest.join(' OR ');
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

		this.getProvenance = function(doc){
			return this.caller.manager.translator.getLanguage() == "dk" && doc.proveniens !== undefined ? true : false 
		};


		this.getAlt = function (doc){	  
			var artist = this.getArtistName(doc) == '' ? '' : this.getArtistName(doc) + ' - ';
			var title = this.getTitle(doc);
			var copyright = smkCommon.computeCopyright(doc); 

			return  copyright == false ? sprintf('%s%s', artist, title) : sprintf('%s - %s', copyright, title); 	  
		};

		this.get_OG_description = function (doc){	  
			var artist = this.getArtistName(doc) == '' ? '' : this.getArtistName(doc);	
			var copyright = smkCommon.computeCopyright(doc); 

			return  copyright == false ? sprintf('%s', artist) : sprintf('%s', copyright); 	  
		};

		this.get_OG_title = function (doc){	  

			var title = this.getTitle(doc).replace(/"/g, '');
			var date = this.getObjectProdDate(doc) != '' ? sprintf(', %s', this.getObjectProdDate(doc)) : '';	   

			return  sprintf('%s%s', title, date ) 	  
		};


		this.getTechnique = function (doc){
			var technique;
			var default_value = "-";

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

		this.getDescriptionNote = function (doc){
			var note;
			var default_value = "";

			switch(this.caller.manager.translator.getLanguage()){
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

		};


		this.getArtist = function(doc){
			var artistLabel = new Array();
			var docBirth;
			var docDeath;

			switch(this.caller.manager.translator.getLanguage()){
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
					var role = doc.artist_auth[i] != 'original' && doc.artist_auth[i] != '' ? sprintf('(%s)', doc.artist_auth[i].toLowerCase()) : "";
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
		};		  

		this.getArtistName = function(doc){	  	  	  
			// we take only the first name
			if (doc.artist_name_ss === undefined)
				return '';

			for (var i = 0, l = doc.artist_name_ss.length; i < l; i++) {
				return doc.artist_name_ss[i];		  		  		  
			}
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

		this.getlocation = function (location){

			if(location !== undefined)
				return true;

			return false;	  				  
		};		 

		this.getImage = function ($target){

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
			var img = new Image();

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