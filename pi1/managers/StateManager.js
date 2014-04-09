(function ($) {

	AjaxSolr.StateManager = AjaxSolr.AbstractWidget.extend({

		constructor: function (attributes) {
			AjaxSolr.AbstractWidget.__super__.constructor.apply(this, arguments);
			AjaxSolr.extend(this, {
				currentState:{}
			}, attributes);
		},		  

		allWidgetProcessed : false, 

		init: function () {
			var self = this;
			var $target = $(this.target);	

			//* merge data and template
			var html = self.template_integration_json({}, '#generalTemplate');    	  	  
			$target.empty();	  
			$target.html(html);	

			this.viewChanged(this.currentState);
			this.categoryChanged(this.currentState);	  

			/*
			 * Management of changes in address bar
			 * n.b.: externalChange is triggered also on document load
			 * */
			$.address.strict(false);
			$( document ).ready(function() {				  

				$.address.externalChange(function(e){	 

					var params = UniqueURL.getParams(e.value);			    			    

					//* process view
					if(params.view !== undefined){
						self.viewChanged({'view': params.view});				    				    				    					    					    	
					}else{
						self.viewChanged({'view': "teasers"});
					}			    

					//* process category
					if(params.category !== undefined){
						if (params.view != 'detail'){			    		
							self.categoryChanged({'category': params.category});
						}else{			    		
							self.manager.widgets['thumbs'].setCurrent_selec(null);	
						}
					}else if(params.category == undefined && params.view != 'detail'){
						self.categoryChanged({'category': "all"});
					}

					//* process Solr request

					// reset exposed parameters
					self.manager.store.exposedReset();

					// q param
					var q = [];
					if (params.view != 'detail'){
						q = [self.manager.store.q_default];										
						if(params.q !== undefined)
							q = q.concat(params.q);
					}else{
						if(params.q !== undefined)
							q = sprintf('id_s:%s', params.q);			    	
					};

					self.manager.store.addByValue('q', q);

					// fq param
					if(params.fq !== undefined && AjaxSolr.isArray(params.fq)){
						for (var i = 0, l = params.fq.length; i < l; i++) {						
							self.manager.store.addByValue('fq', params.fq[i].value, params.fq[i].locals);
						};											
					};												

					// qf param
					if(params.view != "detail")
						self.manager.store.addByValue('qf', self.manager.store.get_qf_string());					    		

					// sort param
					if(params.sort !== undefined){
						self.manager.store.addByValue('sort', params.sort);
					}else{
						self.manager.store.addByValue('sort', self.manager.store.sort_default);
					};

					// start param
					if(params.start !== undefined){
						self.manager.store.addByValue('start', params.start);
					}else{
						self.manager.store.addByValue('start', 0);
					};

					//* process widgets
					// remove all previous search filters
					for (var i = 0, l = self.manager.searchfilterList.length; i < l; i++) {			  		  
						self.manager.widgets[self.manager.searchfilterList[i].field].removeAllSelectedFilters(false);
					};
					if (params.category == 'collections' && params.fq !== undefined){
						// add selected filters in searchFiltersWidget
						for (var i = 0, l = params.fq.length; i < l; i++) {
							var field = params.fq[i].value !== undefined ? params.fq[i].value.split(':')[0] : '';

							if (self.manager.widgets[field] !== undefined && self.manager.widgets[field].addSelectedFilter !== undefined)
								self.manager.widgets[field].addSelectedFilter(params.fq[i].value.split(':')[1]);			    				
						}			    			
					}

					// copy "q" values in Currentsearch widget	
					var q_wout_q_def = self.manager.store.extract_q_from_manager();

					self.manager.widgets['currentsearch'].removeAllCurrentSearch();					
					for (var i = 0, l = q_wout_q_def.length; i < l; i++) {
						self.manager.widgets['currentsearch'].add_q(q_wout_q_def[i], q_wout_q_def[i] );
					};	

					// select "sort" option in sorterWidget
					self.manager.widgets['sorter'].setOption(self.manager.store.get('sort').val());

					//**> start Solr request 
					self.manager.doRequest();				   																   	 
				});
			});	  	  
		},

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},


		/**
		 * sorting changed
		 * */

		smk_search_sorter_changed: function(params, searchFieldsTypes){

			if (params.selected == undefined || !this.manager.store.addByValue('sort', params.selected))																					
				return;	  

			this.manager.widgets['currentsearch'].setRefresh(false);
			this.manager.widgets['category'].setRefresh(false);
			for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
				this.manager.widgets[searchFieldsTypes[i].field].setRefresh(false);
			};	

			this.manager.store.get('start').val(0);
			var fqvalue = this.manager.store.get('fq');
			var qvalue = this.manager.store.extract_q_from_manager();	
			var sortvalue = this.manager.store.get('sort').val();
			var params = {};
			params.q = qvalue;
			params.fq = fqvalue;	
			params.sort = sortvalue;
			params.view = this.getCurrentState()["view"];
			params.category = this.getCurrentState()["category"];

			UniqueURL.setUniqueURL(params);		 

			//this.manager.doRequest(0);    	
		},

		/**
		 * search filter added / removed (only in "search in collection" view)
		 * */
		smk_search_filter_changed: function (caller, params){

			var trigg_req = false;

			if (params.selected !== undefined){
				if (caller.add(params.selected))
					trigg_req = true;
			}else if (params.deselected !== undefined){    		
				if (caller.remove(params.deselected)) 
					trigg_req = true;
			};    	    	

			if (trigg_req){
				this.manager.widgets['currentsearch'].setRefresh(false);

				this.manager.store.get('start').val(0);

				var fqvalue = this.manager.store.get('fq');
				var qvalue = this.manager.store.extract_q_from_manager();
				var sortvalue = this.manager.store.get('sort').val();
				var params = {};
				params.q = qvalue;
				params.fq = fqvalue;
				params.sort = sortvalue;
				params.view = this.getCurrentState()["view"];
				params.category = this.getCurrentState()["category"];

				UniqueURL.setUniqueURL(params);

				//this.manager.doRequest();
			}
		},


		/**
		 * current page changed
		 * */
		smk_search_pager_changed: function (start, searchFieldsTypes){
			this.manager.widgets['currentsearch'].setRefresh(false);
			this.manager.widgets['category'].setRefresh(false);
			for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
				this.manager.widgets[searchFieldsTypes[i].field].setRefresh(false);
			};

			this.manager.store.get('start').val(start);

			var fqvalue = this.manager.store.get('fq');
			var qvalue = this.manager.store.extract_q_from_manager();	
			var sortvalue = this.manager.store.get('sort').val();
			var params = {};
			params.q = qvalue;
			params.fq = fqvalue;
			params.start = start;
			params.sort = sortvalue;
			params.view = this.getCurrentState()["view"];
			params.category = this.getCurrentState()["category"];

			UniqueURL.setUniqueURL(params);		 

			//this.manager.doRequest();
		},


		/**
		 * search string removed in Currentsearch
		 * */
		smk_search_remove_one_search_string: function(event){

			var facet = event.facet;
			var current_q = event.current_q;	  	  

			if (this.manager.store.removeElementFrom_q(facet)) {   
				$(this.manager.widgets['currentsearch'].target).empty();

				for (var i = 0, l = current_q.length; i < l; i++) {	 
					if (current_q[i].value == facet){
						current_q.splice(i, 1);
						this.manager.widgets['currentsearch'].set_q(current_q);
						break;
					}    	    	
				}    	
			};

			this.manager.store.get('start').val(0);

			var fqvalue = this.manager.store.get('fq');
			var qvalue = this.manager.store.extract_q_from_manager();
			var sortvalue = this.manager.store.get('sort').val();
			var params = {};
			params.q = qvalue;
			params.fq = fqvalue;
			params.sort = sortvalue;
			params.view = this.getCurrentState()["view"];
			params.category = this.getCurrentState()["category"];

			UniqueURL.setUniqueURL(params);

			//this.manager.doRequest();    	    	
		},  


		/**
		 * a search string has been added in SearchBox
		 * */
		smk_search_q_added: function(event){

			var val = event.val;

			if (val != '') {
				var text = jQuery.trim(val);

				this.manager.store.last = text;																																										

				var q_value = text;
				var teaser_view = false;

				// if in "detail" view restore the default solr request
				if (UniqueURL.getIsCurrentViewDetail()){				
					this.manager.store.load(true, true); 
					teaser_view = true;
				}

				//* concat the new search term to the previous term(s)
				var current_q = this.manager.store.get('q');
				var current_q_values = new Array();							

				if (AjaxSolr.isArray(current_q.value)){
					for (var i = 0, l = current_q.value.length; i < l; i++) {
						current_q_values.push(current_q.value[i]);								 
					}
				}else if(typeof current_q.value === 'string'){
					current_q_values.push(current_q.value);
				};

				//* send request
				if (this.manager.store.addByValue('q', current_q_values.concat(q_value))){																												

					if (typeof _gaq !== undefined)
						_gaq.push(['_trackEvent','Search', 'Regular search', q_value, 0, true]);

					if (teaser_view){
						// call to teasers view from searchbox when in "detail" view    	         	
						this.viewChanged({view:"teasers"});
						this.categoryChanged({category:"all"}); 	
						this.manager.widgets['currentsearch'].removeAllCurrentSearch();    	    	
						this.manager.widgets['thumbs'].setCurrent_selec(null);	    	    		
					}

					this.manager.widgets['currentsearch'].add_q(q_value, text );  
					this.manager.store.get('start').val(0);

					var fqvalue = this.manager.store.get('fq');
					var qvalue = this.manager.store.extract_q_from_manager();
					var sortvalue = this.manager.store.get('sort').val();
					var params = {};
					params.q = qvalue;
					params.fq = fqvalue;
					params.sort = sortvalue;
					params.view = this.getCurrentState()["view"];
					params.category = this.getCurrentState()["category"];

					UniqueURL.setUniqueURL(params);

					//this.manager.doRequest(0);  	

				};
			};
		},


		/**
		 * call to detail view
		 * */  

		smk_search_call_detail: function(event){
			var detail_view_intern_call = event.detail_view_intern_call;
			var save_current_request = event.save_current_request;    		  
			var art_id = event.detail_id;		  

			if (!detail_view_intern_call)
				this.manager.widgets['state_manager'].viewChanged({view:"detail"});
			else
				this.manager.widgets['state_manager'].empty_detail_view();			   	    	

			if(save_current_request) //* save current solr parameters		  
				this.manager.store.save();      		  	

			//* delete current (exposed) solr parameters
			this.manager.store.exposedReset();

			var param = new AjaxSolr.Parameter({name: "q", value: 'id_s:"' + art_id +'"'}); 
			this.manager.store.add(param.name, param);	     	

			var params = {};
			params.q = art_id;
			params.view = this.getCurrentState()["view"];

			UniqueURL.setUniqueURL(params);

			//this.manager.doRequest();  
		},

		/**
		 * call to teaser view
		 * */
		smk_search_call_teasers: function(){
			//restore previous search request in the manager
			this.manager.store.load(true); 
			this.viewChanged({view:"teasers"}); 

			var fqvalue = this.manager.store.get('fq');
			var qvalue = this.manager.store.extract_q_from_manager();
			var startvalue = this.manager.store.get('start').val();
			var sortvalue = this.manager.store.get('sort').val();
			var params = {};
			params.q = qvalue;
			params.fq = fqvalue;
			params.start = startvalue;
			params.sort = sortvalue;
			params.view = this.getCurrentState()["view"];
			params.category = this.getCurrentState()["category"];

			UniqueURL.setUniqueURL(params);

			this.manager.widgets['thumbs'].setCurrent_selec(null); 
		},	


		/**
		 * Category changed
		 * */
		smk_search_category_changed: function(event){

			var category = event.category;
			var view = event.view;
			var caller = this.manager.widgets['category'];	  	  	  

			if (caller.set(category)){   
				caller.setActiveTab(category);
				this.categoryChanged({'category': category});

				if (view !== undefined)
					this.viewChanged({'view': 'teasers'});

				this.manager.widgets['currentsearch'].setRefresh(false);

				this.manager.store.get('start').val(0);
				this.manager.store.get('sort').val(this.manager.store.sort_default);

				var fqvalue = this.manager.store.get('fq');
				var qvalue = this.manager.store.extract_q_from_manager();
				//var sortvalue = this.manager.store.get('sort').val();
				var params = {};
				params.q = qvalue;
				params.fq = fqvalue;
				//params.sort = sortvalue;
				params.view = this.getCurrentState()["view"];
				params.category = this.getCurrentState()["category"];

				UniqueURL.setUniqueURL(params);

				//this.manager.doRequest();
			};	  
		},


		/**
		 * image loading handlers
		 * */

		//* teasers
		smk_teasers_this_img_loaded: function(){
			$(this.manager.widgets['teasers'].target).find('#teaser-container-grid').masonry('layout');

			//* check if there are still images loading in "teaser"
			if ($(this.manager.widgets['teasers'].target).find('.image_loading').length == 0){

				// highlight search string in teasers
				var vArray = [].concat(this.manager.store.get('q').value);
				if (undefined !== vArray && vArray.length > 1){ //  > 1 -> do not take into account the (first) q default value   			
					var words = [];

					for (var i = 1, l = vArray.length; i < l; i++) {    				
						words = words.concat(vArray[i].trim().split(" "));    				
					};

					$(this.manager.widgets['teasers'].target).highlight(words);
				}    			

				// if all images are loaded, we stop the modal "waiting image" for this widget
				this.remove_modal_loading_from_widget(this.manager.widgets['teasers'].target);

				// if in list view mode, align images
				if ($(this.manager.widgets['teasers'].target).find('.teaser--list').length > 0)
					this.manager.widgets['teasers'].verticalAlign(); 
			}    		  

		},

		//* related
		smk_related_this_img_loaded: function(){
			$(this.manager.widgets['related'].target).find('#teaser-container-grid').masonry('layout');  

			//* check if there are still images loading in "related"
			if ($(this.manager.widgets['related'].target).find('.image_loading').length == 0){    		
				// if all images are loaded, we stop the modal "waiting image" for this widget
				this.remove_modal_loading_from_widget(this.manager.widgets['related'].target);   	   	 	       	  	
			} 	
		},

		//* thumbs
		smk_thumbs_img_loaded: function(){
			//* check if there are still images loading in "teaser"
			if ($(this.manager.widgets['thumbs'].target).find('.image_loading').length == 0){
				this.manager.widgets['thumbs'].verticalAlign();       	  	
			}  	  
		},

		//* detail
		smk_detail_this_img_loaded: function(){
			this.remove_modal_loading_from_widget(this.manager.widgets['details'].target);   
			// show "back-button" in Detail view - in order to have the delay (specified in app.css) on showing to work properly, 
			// we had to implement a tricky little piece of code, see ThumbnailsWidget-> after "doc.multi_work_ref !== undefined"
			// If you find a more rational method to achieve that, feel free to implement it.
			$(this.manager.widgets['details'].target).find('a.back-button').css('opacity', '1');			
		},	

		beforeRequest: function(){	 

			this.start_modal_loading(this.target);

			//* start loading mode for some choosen widgets  
			// teasers
			this.add_modal_loading_to_widget(this.manager.widgets['teasers']);
			// searchfilters
			for (var i = 0, l = this.manager.searchfilterList.length; i < l; i++) {		  	
				this.add_modal_loading_to_widget(this.manager.widgets[this.manager.searchfilterList[i].field]);
			};
			// details
			this.add_modal_loading_to_widget(this.manager.widgets['details']);	 
			// related
			this.add_modal_loading_to_widget(this.manager.widgets['related']);
		},  


		afterRequest: function(){	  
			this.append_info();  	  
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

					// show info window
					this.show_info();

					this.show_footer();			  
				}			  
			}
		},  

		show_info: function(){	  
			$("body").find("#smk_search_info").css('opacity', '1');  	  
		},

		append_info: function(){

			if($("body").find("#smk_search_info").length == 0 && !UniqueURL.getIsCurrentViewDetail() && $.cookie("smk_search_info") != "false"){
				//* append information window
				var html = this.template_integration_json({'info': decodeURIComponent(this.manager.translator.getLabel('general_tooltip'))}, '#infoTemplate');  
				$(this.target).find('section.section--main').append(html);	 

				$('a.tooltip__close').click(
						function (event) {
							event.preventDefault();
							$.cookie("smk_search_info", "false");
							$("body").find("#smk_search_info").remove();
							return;  		    		            
						}
				);			  
			};	
		},

		set_focus: function(){
			var self = this;
			$(document).ready(function () {
				$(self.manager.widgets['searchbox'].target).find('#smk_search').focus();
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


//		search_filter_start_loading: function(target){
//		$(target).addClass('filter_loading');	  
//		},

//		search_filter_stop_loading: function(target){
//		$(target).removeClass('filter_loading');	  
//		},

		viewChanged: function (stateChange) {        	    
			var $target = $(this.target);
			var self = this;
			var newstate = this.getNewState(stateChange);

			if (newstate["view"] === undefined)
				return;

			switch(newstate["view"]){
			case "teasers":			  
				self.showWidget($("body").find("#smk_search_info"));

				$target.find("#thumbnails").empty().hide();
				$target.find("#smk_detail").empty().hide();		  		  		  		 

				this.manager.widgets['related'].removeAllArticles();
				$target.find("#related-artworks").hide();		  

				self.showWidget($target.find("#currentsearch"));
				self.showWidget($target.find("#category"));
				self.showWidget($target.find("#viewpicker"));
				self.showWidget($(this.manager.widgets['sorter'].target));
				self.showWidget($target.find("#pager"));
				self.showWidget($target.find("#pager-header"));
				self.showWidget($(this.manager.widgets['teasers'].target));

				switch(newstate["category"]){
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
				$(this.manager.widgets['sorter'].target).hide();	
				$target.find("#pager").hide();
				$target.find("#pager-header").hide();

				$target.find("#search-filters").hide();
				$(this.manager.widgets['teasers'].target).hide();		

				self.showWidget($target.find("#smk_detail"));
				self.showWidget($target.find("#thumbnails"));

				self.showWidget($(this.manager.widgets['related'].target));
				$(this.manager.widgets['related'].target).find('h3.heading--l').hide(); // we don't want to see the title of "relatedwidget" now (only after "afterrequest")

				$target.find('.view  #related-artworks #teaser-container-grid').masonry('layout');

				break;		  
			} 	

			return;
		},

		categoryChanged: function (stateChange) {        	    
			var $target = $(this.target);

			var newstate = this.getNewState(stateChange);

			if (newstate["category"] === undefined )
				return;

			switch(newstate["category"]){
			case "collections":		 			  			  				  
				this.showWidget($target.find("#search-filters"));
				//$target.find("#search-filters").show().children().show();		
				$(this.manager.widgets['teasers'].target).find('#teaser-container-grid').removeClass('full-width').hide();
				this.manager.widgets['category'].setActiveTab(newstate["category"]);

				break;
			case "nyheder":
			case "kalender":
			case "artikel":
			case "praktisk":
			case "all":
				$target.find("#search-filters").hide();
				$(this.manager.widgets['teasers'].target).find('#teaser-container-grid').addClass('full-width').hide();
				this.manager.widgets['category'].setActiveTab(newstate["category"]);

				// remove all search filters
				for (var i = 0, l = this.manager.searchfilterList.length; i < l; i++) {			  		  
					this.manager.widgets[this.manager.searchfilterList[i].field].removeAllSelectedFilters(true);
				};

				break;
			default:		    			  			   							  
				$target.find("#search-filters").hide();
			$(this.manager.widgets['teasers'].target).find('#teaser-container-grid').addClass('full-width').hide();
			this.manager.widgets['category'].setActiveTab("all");
			break;		  
			}

			if($(this.manager.widgets['teasers'].target).find('#teaser-container-grid .teaser--grid').length > 0){
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

			this.manager.widgets['teasers'].removeAllArticles();

			$(this.manager.widgets['teasers'].target).show().children().not('.modal').show();

			if($(this.manager.widgets['teasers'].target).find('#teaser-container-grid .teaser--grid').length > 0)
				$(this.manager.widgets['teasers'].target).find('#teaser-container-grid').masonry('layout');

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

		empty_detail_view: function(){		  
			//empty related widget
			$(this.manager.widgets['related'].target).find('h3.heading--l').hide(); // we don't want to see the title of "relatedwidget" now (only after "afterrequest")	  
			this.manager.widgets['related'].removeAllArticles();	  
			//empty detail widget
			$(this.manager.widgets['detail']).empty();	  	  
		},

		getNewState: function(stateChange) {

			if (stateChange["view"] !== undefined){
				this.currentState["view"] = stateChange["view"];			 
			} 
			else if (stateChange["category"] !== undefined){
				this.currentState["category"] = stateChange["category"];
			}

			return this.currentState;
		},

		getCurrentState: function(){
			return this.currentState;
		},

		generalSolrError: function(e){
			$(this.target).empty().html(sprintf('%s &nbsp;&nbsp; returned:&nbsp;&nbsp; %s<br>Please contact website administrator.', this.manager.solrUrl, e)); 
		}

	});

})(jQuery);
