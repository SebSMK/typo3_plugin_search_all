(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var viewManager = {};
		factory(viewManager);
		if (typeof define === "function" && define.amd) {
			define(viewManager); // AMD
		} else {
			root.ViewManager = viewManager; // <script>
		}
	}
}(this, function (viewManager) {

	viewManager.constructor = function(options){

		this.options = options || {};
		this.template = options.template;
		this.target = options.target;
		this.allWidgetProcessed = false; 
		
		/*********
		 * PUBLIC FUNCTIONS
		 ********** */

		this.init = function () {
			var self = this;
			var $target = $(this.target);	

			//* merge data and template
			var html = self.template_integration_json({}, '#generalTemplate');    	  	  
			$target.empty();	  
			$target.html(html);	

			//* fix cufon problem in footer
			this.fixCrappyfooter();
		};

		this.beforeRequest = function(){	 

			this.start_modal_loading(this.target);

			//* start loading mode for some choosen widgets  
			// teasers
			this.add_modal_loading_to_widget('teasers');
			// searchfilters
//			for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {		  	
//			this.add_modal_loading_to_widget(Manager.widgets[Manager.searchfilterList[i].field]);
//			};
			// details
			this.add_modal_loading_to_widget('details');	 
			// related
//			this.add_modal_loading_to_widget(Manager.widgets['details'].related_subWidget);*/
		};  

		this.template_integration_json = function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		};		

		/**
		 * Call function in a given widget / subwidget of the manager
		 * @param {String} [widget] Widget name
		 * @param {String} [fn] function name
		 * @params {Json} [options]		 
		 * * * @param {String[]} [params] array of function's parameters
		 */
		this.callWidgetFn = function(widget, fn, options){	
			var options = options || {};
			var params = options.params;			

			if(Manager.widgets[widget] === undefined || typeof(Manager.widgets[widget][fn]) !== "function"){
				console.log(sprintf("%s - %s not defined", widget, fn));
				return false;
			}	

			return Manager.widgets[widget][fn].apply(Manager.widgets[widget], params);		    	

		};

		/**
		 * Call target of a given widget / subwidget of the manager
		 * @param {String} [widget] Widget name
		 * @param {String} [subwidget] subWidget name - optional
		 */
		this.callWidgetTarget = function(widget, subwidget){												
			if(Manager.widgets[widget] === undefined ||
					(subwidget !== undefined && Manager.widgets[widget][subwidget] === undefined)
			){
				console.log(sprintf("target %s/%s not defined", widget, subwidget));
				return [];
			}						

			return subwidget === undefined ? Manager.widgets[widget].target : Manager.widgets[widget][subwidget].target;

		};

		/**
		 * image loading handlers
		 * */

		//* teaser		
		this.smk_teasers_this_img_displayed = function(){
			$(this.callWidgetTarget('teasers')).find('#teaser-container-grid').masonry('layout');

			//* check if there are still images not displayed in "teaser"
			if ($(this.callWidgetTarget('teasers')).find('.image_loading').length == 0 && 
					$(this.callWidgetTarget('teasers')).find('.not_displayed').length == 0){				
				// if all images in teaser are displayed, send event
				$(this).trigger({
					type: "smk_teasers_all_images_displayed"
				});
			}    		  
		};

		this.smk_teasers_this_img_loaded = function(){
			$(this.callWidgetTarget('teasers')).find('#teaser-container-grid').masonry('layout');

			//* check if there are still images loading in "teaser"
			if ($(this.callWidgetTarget('teasers')).find('.image_loading').length == 0){

				// highlight search string in teasers
				var vArray = [].concat(Manager.store.get('q').value);
				if (undefined !== vArray && vArray.length > 1){ //  > 1 -> do not take into account the (first) q default value   			
					var words = [];

					for (var i = 1, l = vArray.length; i < l; i++) {    				
						words = words.concat(vArray[i].trim().split(" "));    				
					};

					$(this.callWidgetTarget('teasers')).highlight(words);
				}    			

				// if all images are loaded, we stop the modal "waiting image" for this widget
				this.remove_modal_loading_from_widget(this.callWidgetTarget('teasers'));

				// if in list view mode, align images
				if ($(this.callWidgetTarget('teasers')).find('.teaser--list').length > 0)
					this.callWidgetFn('teasers', 'verticalAlign'); 
			}    		  

		};

		//* related
		this.smk_related_this_img_loaded = function(){
			$(this.callWidgetTarget('details', 'related_subWidget')).find('#teaser-container-grid').masonry('layout');  

			//* check if there are still images loading in "related"
			if ($(this.callWidgetTarget('details', 'related_subWidget')).find('.image_loading').length == 0){    		
				// if all images are loaded, we stop the modal "waiting image" for this widget
				this.remove_modal_loading_from_widget(this.callWidgetTarget('details', 'related_subWidget'));   	   	 	       	  	
			} 	
		};

		//* thumbs
		this.smk_thumbs_img_loaded = function(){
			//* check if there are still images loading in "teaser"
			if ($(this.callWidgetTarget('details', 'thumbnails_subWidget')).find('.image_loading').length == 0){				 
				this.callWidgetFn('details', 'verticalAlignThumbs');
			}  	  
		};

		//* detail
		this.smk_detail_this_img_loaded = function(){
			this.remove_modal_loading_from_widget(this.callWidgetTarget('details'));   
			// show "back-button" in Detail view
			$(this.callWidgetTarget('details')).find('a.back-button').css('opacity', '1');			
		};			


		this.viewChanged = function (stateChange) {        	    
			var $target = $(this.target);
			var self = this;

			if (stateChange["view"] === undefined)
				return;

			switch(stateChange["view"]){
			case "teasers":			  

				$(self.callWidgetTarget('details', 'thumbnails_subWidget')).empty().hide();
				$(self.callWidgetTarget('details')).empty().hide();
				$(self.callWidgetTarget('details', 'related_subWidget')).empty().hide();

				self.callWidgetFn('details', 'removeAllRelated');				

				self.showWidget($target.find("#pager-header"));
				self.showWidget($(self.callWidgetTarget('currentsearch')));
				self.showWidget($(self.callWidgetTarget('category')));
				self.showWidget($(self.callWidgetTarget('viewpicker')));
				self.showWidget($(self.callWidgetTarget('sorter')));
				self.showWidget($(self.callWidgetTarget('pager')));				
				self.showWidget($(self.callWidgetTarget('teasers')));

				switch(stateChange["category"]){
				case "collections":		 			  			  			  
					self.showWidget($target.find("#search-filters"));				  			  			  
					break;	
				default:		    			  			   							  
					$target.find("#search-filters").hide();		  	 		  	  
				break;		  
				}

				// If the teaser container is full width, then make a two column layout.
				if ( $target.find('#teaser-container-grid').hasClass('full-width') ) {
					$(this).addClass('teaser--two-columns');
				}else{
					$(this).removeClass('teaser--two-columns');	
				}

				break;

			case "detail":	

				// We hide footer here, and show it back one images are loaded in detail
				this.hide_footer();		  

				self.callWidgetFn('details', 'removeAllRelated');

				$target.find("#pager-header").hide();
				$target.find("#search-filters").hide();

				$(self.callWidgetTarget('currentsearch')).hide();
				$(self.callWidgetTarget('category')).hide();
				$(self.callWidgetTarget('viewpicker')).hide();
				$(self.callWidgetTarget('sorter')).hide();
				$(self.callWidgetTarget('pager')).hide();												
				$(self.callWidgetTarget('teasers')).hide();

				self.showWidget($(self.callWidgetTarget('details')));
				self.showWidget($(self.callWidgetTarget('details', 'thumbnails_subWidget')));
				self.showWidget($(self.callWidgetTarget('details', 'related_subWidget')));				

				$(self.callWidgetTarget('details', 'related_subWidget')).find('h3.heading--l').hide(); // we don't want to see the title of "relatedwidget" now (only after "afterrequest")
				$target.find('.view  #related-artworks #teaser-container-grid').masonry('layout');

				break;		  
			} 	

			return;
		};

		this.categoryChanged = function (stateChange) {        	    
			var $target = $(this.target);

			if (stateChange["category"] === undefined )
				return;

			this.callWidgetFn('teasers', 'removeAllArticles');
			this.showWidget($(this.callWidgetTarget('teasers')));

			for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {				
				if (this.callWidgetFn(Manager.searchfilterList[i].field, 'getRefresh'))					
					this.callWidgetFn(Manager.searchfilterList[i].field, 'hide_drop')
			};

			switch(stateChange["category"]){
			case "collections":		 			  			  				  
				this.showWidget($target.find("#search-filters"));					
				$(this.callWidgetTarget('teasers')).find('#teaser-container-grid').removeClass('full-width').hide();				
				this.callWidgetFn('category', 'setActiveTab', {params: [stateChange["category"]]});

				break;
			case "nyheder":
			case "kalender":
			case "artikel":
			case "praktisk":
			case "all":
				$target.find("#search-filters").hide();
				$(this.callWidgetTarget('teasers')).find('#teaser-container-grid').addClass('full-width').hide();			
				this.callWidgetFn('category', 'setActiveTab',  {params: [stateChange["category"]]});

				// remove all search filters
				for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {			  		  					
					this.callWidgetFn(Manager.searchfilterList[i].field, 'removeAllSelectedFilters', {params: [true]});
				};

				break;
			default:		    			  			   							  
				$target.find("#search-filters").hide();
			$(this.callWidgetTarget('teasers')).find('#teaser-container-grid').addClass('full-width').hide();				
			this.callWidgetFn('category', 'setActiveTab', {params: ['all']});
			break;		  
			}

			if($(this.callWidgetTarget('teasers')).find('#teaser-container-grid .teaser--grid').length > 0){
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

			if($(this.callWidgetTarget('teasers')).find('#teaser-container-grid .teaser--grid').length > 0)
				$(this.callWidgetTarget('teasers')).find('#teaser-container-grid').masonry('layout');

			return;
		};

		/*********
		 * PRIVATE FUNCTIONS
		 ********** */

		/*
		 * start general modal loading screen 
		 */
		this.start_modal_loading = function(){
			$(this.target).addClass("modal_loading"); 	  
		};

		/*
		 * stop general modal loading screen 
		 */
		this.stop_modal_loading = function(){	  
			$(this.target).removeClass("modal_loading"); 
			this.allWidgetProcessed = false;	  
		};

		/*
		 * start loading mode for a given widget.
		 * - only if widget's state is "active"
		 */
		this.add_modal_loading_to_widget = function(widget){
			if(this.isThisWidgetActive(widget))
				this.callWidgetFn(widget, 'addClass', {params: 'modal_loading'});
		};
		
		this.isThisWidgetActive = function(widget){
			return this.callWidgetFn(widget, 'getRefresh');
		};

		/*
		 * stop loading mode for a given widget.
		 */
		this.remove_modal_loading_from_widget = function(target){
			$(target).removeClass("modal_loading");

			if (this.allWidgetProcessed){
				if ($(this.target).find('.modal_loading').length == 0){
					// all widgets are loaded, we remove the general loading screen
					this.stop_modal_loading();					
					this.set_focus();					
					this.show_footer();
				}			  
			}
		};  	

		this.set_focus = function(){
			var self = this;
			$(document).ready(function () {
				$(self.callWidgetTarget('searchbox')).find('#smk_search').focus();
			});	  	  
		};		

		this.allWidgetsProcessed = function(){
			if ($(this.target).find('.modal_loading').length != 0){
				// there are still some widgets loading
				this.allWidgetProcessed = true;	
			}	else{
				// all widgets are loaded, we remove the general loading screen
				this.stop_modal_loading();
			}	  	  
		};

		this.showWidget = function($target){
			$target.show().children().not('.modal').show();	  	  
		};

		this.show_footer = function(){	  	  
			$("#footer").show().children().show();	 	  
		};

		this.hide_footer = function(){	  
			$("#footer").hide();	  
		};

		this.generalSolrError = function(e){
			$(this.target).empty().html(sprintf('%s &nbsp;&nbsp; returned:&nbsp;&nbsp; %s<br>Please contact website administrator.', Manager.solrUrl, e)); 
		};

		this.fixCrappyfooter = function(){
			$('.footer_content h2').each(function() {  
				var text = this.textContent;
				$(this).empty();
				$(this).text(text);
			});

		};

	}
}));
