(function ($) {

	AjaxSolr.DetailWidget = AjaxSolr.AbstractWidget.extend({

		constructor: function (attributes) {
			AjaxSolr.DetailWidget.__super__.constructor.apply(this, arguments);
			AjaxSolr.extend(this, {
				thumbnails_target: null,
				thumbnailsManager:null,
				thumbnails_subWidget:null,
				reltatedManager: null,
				related_subWidget: null
			}, attributes);
		},	

		start: 0,

		current_language: null,

		default_picture_path: null, 

		init: function(){	  	    
			var self = this;
			
			self.default_picture_path = smkCommon.getDefaultPicture('large');
			self.current_language = self.manager.translator.getLanguage();
			
			//* set and save default request parameters for both sub_managers                
			var params = {					
					'rows':500,					
					'start': 0,
					'json.nl': 'map'
			};
			
			for (var name in params) {
				self.thumbnailsManager.store.addByValue(name, params[name]);
				self.reltatedManager.store.addByValue(name, params[name]);
			}    

			// save 'default request' parameters
			self.thumbnailsManager.store.save(true);
			self.reltatedManager.store.save(true);			
			
			//***
			//* related sub widget
			//***
			//* sub widget coupling
			self.reltatedManager.addWidget(self.related_subWidget); 				

			//* a new image has been displayed in "scroll teaser"
			$(self.related_subWidget).on('smk_related_this_img_loaded', function(event){     	            								
				$(self).trigger({
					type: "smk_related_this_img_loaded"
				});
			});	
			
			// click on a related artwork
			$(self.related_subWidget).on('smk_search_call_detail', function(event){ 								
				$(self).trigger({
					type: "smk_search_call_detail",
					event_caller: event
				});
			});

			//***
			//* thumbnail sub widget
			//***
			//* sub widget coupling
			self.thumbnailsManager.addWidget(self.thumbnails_subWidget); 				

			// a new image has been displayed in "scroll teaser"
			$(self.thumbnails_subWidget).on('smk_thumbs_img_loaded', function(event){     	            								
				$(self).trigger({
					type: "smk_thumbs_img_loaded"
				});
			});	
			
			// click on a thumb
			$(self.thumbnails_subWidget).on('smk_search_call_detail', function(event){ 
				
				self.setCurrentThumb_selec(event.detail_id);  
				
				$(self).trigger({
					type: "smk_search_call_detail",
					event_caller: event
				});
			});

			self.thumbnailsManager.init();
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
			var dataHandler = new getData_Detail.constructor(this);
			var multi_work_ref_req = null;
			var related_id_req = null;			

			for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
				var doc = this.manager.response.response.docs[i];      
				artwork_data = dataHandler.get_data(doc);  
				//* process thumbnails
				multi_work_ref_req = artwork_data.subwidget.req_multiwork;
				if (self.getCurrentThumb_selec() == null)
					self.setCurrentThumb_selec(doc.id);
				//* process related
				related_id_req = artwork_data.subwidget.req_relatedid;								
			}
			
			//* merge data and template
			var html = self.template_integration_json({"detail": artwork_data}, '#detailTemplate');    
			$target.html(html);    

			//* add main image
			$target.find('.gallery__main.image_loading').each(function() {    	    	
				dataHandler.getImage($(this));
			});      	

			//* add link to back button	  
			//$target.find('a.back-button').css('opacity', '1');
			$target.find('a.back-button').click(
					function (event) {
						event.preventDefault();
						// send call to teaser view restoring (but without sending a request to Solr)
						$(self).trigger({
							type: "smk_search_call_teasers"
						});  		    		    		    			
						return;  		    		            
					}
			);
			
			if(multi_work_ref_req != null){				
				//* start thumbnail sub request
				var param = new AjaxSolr.Parameter({name: "q", value: multi_work_ref_req });					  					
				this.thumbnailsManager.store.add(param.name, param);	 			
				this.thumbnailsManager.doRequest();				
			}	
			
			if(related_id_req != null){				
				//* start thumbnail sub request
				var param = new AjaxSolr.Parameter({name: "q", value: related_id_req });					  					
				this.reltatedManager.store.add(param.name, param);	 			
				this.reltatedManager.doRequest();				
			}

		},  

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},
		
		setCurrentThumb_selec: function(selec){
			this.thumbnails_subWidget.setCurrent_selec(selec);
		},
		
		getCurrentThumb_selec: function(){
			return this.thumbnails_subWidget.getCurrent_selec();
		}

	});

})(jQuery);