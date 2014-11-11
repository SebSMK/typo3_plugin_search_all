(function ($) {

	AjaxSolr.StateManager = AjaxSolr.AbstractWidget.extend({

		allWidgetProcessed : false, 

		init: function () {
			var self = this;
			var $target = $(this.target);	

			//* merge data and template
			var html = self.template_integration_json({}, '#generalTemplate');    	  	  
			$target.empty();	  
			$target.html(html);	

			//* fix cufon problem in footer
			this.fixCrappyfooter();

			this.viewChanged({view:'teasers'});
			this.categoryChanged({category:''});	  

		},

		beforeRequest: function(){	 

			this.start_modal_loading(this.target);

			//* start loading mode for some choosen widgets  
			// teasers
			this.add_modal_loading_to_widget(Manager.widgets['teasers']);
			// searchfilters
//			for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {		  	
//			this.add_modal_loading_to_widget(Manager.widgets[Manager.searchfilterList[i].field]);
//			};
			// details
			this.add_modal_loading_to_widget(Manager.widgets['details']);	 
			// related
//			this.add_modal_loading_to_widget(Manager.widgets['details'].related_subWidget);*/
		},  

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},		

		/**
		 * image loading handlers
		 * */

		//* teaser		
		smk_teasers_this_img_displayed: function(){
			$(Manager.widgets['teasers'].target).find('#teaser-container-grid').masonry('layout');

			//* check if there are still images not displayed in "teaser"
			if ($(Manager.widgets['teasers'].target).find('.image_loading').length == 0 && 
					$(Manager.widgets['teasers'].target).find('.not_displayed').length == 0){				
				// if all images in teaser are displayed, send event
				$(this).trigger({
					type: "smk_teasers_all_images_displayed"
				});
			}    		  
		},

		smk_teasers_this_img_loaded: function(){
			$(Manager.widgets['teasers'].target).find('#teaser-container-grid').masonry('layout');

			//* check if there are still images loading in "teaser"
			if ($(Manager.widgets['teasers'].target).find('.image_loading').length == 0){

				// highlight search string in teasers
				var vArray = [].concat(Manager.store.get('q').value);
				if (undefined !== vArray && vArray.length > 1){ //  > 1 -> do not take into account the (first) q default value   			
					var words = [];

					for (var i = 1, l = vArray.length; i < l; i++) {    				
						words = words.concat(vArray[i].trim().split(" "));    				
					};

					$(Manager.widgets['teasers'].target).highlight(words);
				}    			

				// if all images are loaded, we stop the modal "waiting image" for this widget
				this.remove_modal_loading_from_widget(Manager.widgets['teasers'].target);

				// if in list view mode, align images
				if ($(Manager.widgets['teasers'].target).find('.teaser--list').length > 0)
					Manager.widgets['teasers'].verticalAlign(); 
			}    		  

		},

		//* related
		smk_related_this_img_loaded: function(){
			$(Manager.widgets['details'].related_subWidget.target).find('#teaser-container-grid').masonry('layout');  

			//* check if there are still images loading in "related"
			if ($(Manager.widgets['details'].related_subWidget.target).find('.image_loading').length == 0){    		
				// if all images are loaded, we stop the modal "waiting image" for this widget
				this.remove_modal_loading_from_widget(Manager.widgets['details'].related_subWidget.target);   	   	 	       	  	
			} 	
		},

		//* thumbs
		smk_thumbs_img_loaded: function(){
			//* check if there are still images loading in "teaser"
			if ($(Manager.widgets['details'].thumbnails_subWidget.target).find('.image_loading').length == 0){
				Manager.widgets['details'].thumbnails_subWidget.verticalAlign();       	  	
			}  	  
		},

		//* detail
		smk_detail_this_img_loaded: function(){
			this.remove_modal_loading_from_widget(Manager.widgets['details'].target);   
			// show "back-button" in Detail view
			$(Manager.widgets['details'].target).find('a.back-button').css('opacity', '1');			
		},			

		/*
		 * start general modal loading screen 
		 */
		start_modal_loading: function(){
			$(this.target).addClass("modal_loading"); 	  
		},

		/*
		 * stop general modal loading screen 
		 */
		stop_modal_loading: function(){	  
			$(this.target).removeClass("modal_loading"); 
			this.allWidgetProcessed = false;	  
		},

		/*
		 * start loading mode for a given widget.
		 * - only if widget's state is "active"
		 */
		add_modal_loading_to_widget: function(widget){
			if(this.isThisWidgetActive(widget))
				$(widget.target).addClass("modal_loading");
		},

		/*
		 * stop loading mode for a given widget.
		 */
		remove_modal_loading_from_widget: function(target){
			$(target).removeClass("modal_loading");

			if (this.allWidgetProcessed){
				if ($(this.target).find('.modal_loading').length == 0){
					// all widgets are loaded, we remove the general loading screen
					this.stop_modal_loading();					
					this.set_focus();					
					this.show_footer();
				}			  
			}
		},  	

		set_focus: function(){
			var self = this;
			$(document).ready(function () {
				$(Manager.widgets['searchbox'].target).find('#smk_search').focus();
			});	  	  
		},  

		isThisWidgetActive: function(widget){
			return widget.getRefresh();
		},

		allWidgetsProcessed: function(){
			if ($(this.target).find('.modal_loading').length != 0){
				// there are still some widgets loading
				this.allWidgetProcessed = true;	
			}	else{
				// all widgets are loaded, we remove the general loading screen
				this.stop_modal_loading();
			}	  	  
		},

		viewChanged: function (stateChange) {        	    
			var $target = $(this.target);
			var self = this;

			if (stateChange["view"] === undefined)
				return;

			switch(stateChange["view"]){
			case "teasers":			  
				self.showWidget($("body").find("#smk_search_info"));

				$target.find("#thumbnails").empty().hide();
				$target.find("#smk_detail").empty().hide();		  		  		  		 

				Manager.widgets['details'].related_subWidget.removeAllArticles();
				$target.find("#related-artworks").hide();		  

				self.showWidget($target.find("#currentsearch"));
				self.showWidget($target.find("#category"));
				self.showWidget($target.find("#viewpicker"));
				self.showWidget($(Manager.widgets['sorter'].target));
				self.showWidget($target.find("#pager"));
				self.showWidget($target.find("#pager-header"));
				self.showWidget($(Manager.widgets['teasers'].target));

				switch(stateChange["category"]){
				case "collections":		 			  			  			  
					self.showWidget($target.find("#search-filters"));
					//$target.find("#search-filters").show().children().show();					  			  			  
					break;	
				default:		    			  			   							  
					$target.find("#search-filters").hide();		  	 		  	  
				break;		  
				}


				// If the teaser container is full width, than make a two column layout.
				if ( $target.find('#teaser-container-grid').hasClass('full-width') ) {
					$(this).addClass('teaser--two-columns');
				}else{
					$(this).removeClass('teaser--two-columns');	
				}

				break;

			case "detail":	

				// We hide footer here, and show it back one images are loaded in detail
				this.hide_footer();		  

				$("body").find("#smk_search_info").hide();

				$target.find("#currentsearch").hide();
				$target.find("#category").hide();
				$target.find("#viewpicker").hide();
				$(Manager.widgets['sorter'].target).hide();	
				$target.find("#pager").hide();
				$target.find("#pager-header").hide();

				$target.find("#search-filters").hide();
				$(Manager.widgets['teasers'].target).hide();		

				self.showWidget($target.find("#smk_detail"));
				self.showWidget($target.find("#thumbnails"));

				self.showWidget($(Manager.widgets['details'].related_subWidget.target));
				Manager.widgets['details'].related_subWidget.removeAllArticles();	
				$(Manager.widgets['details'].related_subWidget.target).find('h3.heading--l').hide(); // we don't want to see the title of "relatedwidget" now (only after "afterrequest")

				$target.find('.view  #related-artworks #teaser-container-grid').masonry('layout');

				break;		  
			} 	

			return;
		},

		categoryChanged: function (stateChange) {        	    
			var $target = $(this.target);

			if (stateChange["category"] === undefined )
				return;

			for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {				
				if (Manager.widgets[Manager.searchfilterList[i].field].getRefresh())
					Manager.widgets[Manager.searchfilterList[i].field].hide_drop();
			};

			switch(stateChange["category"]){
			case "collections":		 			  			  				  
				this.showWidget($target.find("#search-filters"));
				//$target.find("#search-filters").show().children().show();		
				$(Manager.widgets['teasers'].target).find('#teaser-container-grid').removeClass('full-width').hide();
				Manager.widgets['category'].setActiveTab(stateChange["category"]);

				break;
			case "nyheder":
			case "kalender":
			case "artikel":
			case "praktisk":
			case "all":
				$target.find("#search-filters").hide();
				$(Manager.widgets['teasers'].target).find('#teaser-container-grid').addClass('full-width').hide();
				Manager.widgets['category'].setActiveTab(stateChange["category"]);

				// remove all search filters
				for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {			  		  
					Manager.widgets[Manager.searchfilterList[i].field].removeAllSelectedFilters(true);
				};

				break;
			default:		    			  			   							  
				$target.find("#search-filters").hide();
			$(Manager.widgets['teasers'].target).find('#teaser-container-grid').addClass('full-width').hide();
			Manager.widgets['category'].setActiveTab("all");
			break;		  
			}

			if($(Manager.widgets['teasers'].target).find('#teaser-container-grid .teaser--grid').length > 0){
				//* grid view mode
				$(this).trigger({
					type: "current_view_mode",
					value:'grid'
				});

			}else{
				//* list view mode
				$(this).trigger({
					type: "current_view_mode",
					value:'list'
				});
			}

			Manager.widgets['teasers'].removeAllArticles();

			$(Manager.widgets['teasers'].target).show().children().not('.modal').show();

			if($(Manager.widgets['teasers'].target).find('#teaser-container-grid .teaser--grid').length > 0)
				$(Manager.widgets['teasers'].target).find('#teaser-container-grid').masonry('layout');

			return;
		},


		showWidget: function($target){
			$target.show().children().not('.modal').show();	  	  
		},

		show_footer: function(){	  	  
			$("#footer").show().children().show();	 	  
		},

		hide_footer: function(){	  
			$("#footer").hide();	  
		},

		generalSolrError: function(e){
			$(this.target).empty().html(sprintf('%s &nbsp;&nbsp; returned:&nbsp;&nbsp; %s<br>Please contact website administrator.', Manager.solrUrl, e)); 
		},		

		fixCrappyfooter: function(){
			$('.footer_content h2').each(function() {  
				var text = this.textContent;
				$(this).empty();
				$(this).text(text);
			});

		}

	});

})(jQuery);
