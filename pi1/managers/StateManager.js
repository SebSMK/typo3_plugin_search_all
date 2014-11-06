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

			//* fix cufon problem in footer
			this.fixCrappyfooter();
			
			this.viewChanged(this.currentState);
			this.categoryChanged(this.currentState);	  

			/*
			 * Management of changes in address bar
			 * n.b.: externalChange is triggered also on document load
			 * */
			$.address.strict(false);
			$( document ).ready(function() {				  

				$.address.externalChange(function(e){	 

					ModelManager.setModel(e.value, "url");
					var model = ModelManager.getModel();
					
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
							Manager.widgets['details'].setCurrentThumb_selec(null);	
						}
					}else if(params.category == undefined && params.view != 'detail'){
						self.categoryChanged({'category': "all"});
					}

					//* process Solr request

					// reset exposed parameters
					Manager.store.exposedReset();

					// q param
					var q = [];
					if (params.view != 'detail'){
						q = [Manager.store.q_default];										
						if(params.q !== undefined)
							q = q.concat(params.q);
					}else{
						if(params.q !== undefined)
							q = sprintf('id_s:%s', params.q);			    	
					};

					Manager.store.addByValue('q', q);

					// fq param
					if(params.fq !== undefined && AjaxSolr.isArray(params.fq)){
						for (var i = 0, l = params.fq.length; i < l; i++) {						
							Manager.store.addByValue('fq', params.fq[i].value, params.fq[i].locals);
						};											
					};												

					// qf param
					if(params.view != "detail")
						Manager.store.addByValue('qf', Manager.store.get_qf_string());					    		

					// sort param
					if(params.sort !== undefined){
						Manager.store.addByValue('sort', params.sort);
					}else{
						Manager.store.addByValue('sort', Manager.store.sort_default);
					};

					// start param
					if(params.start !== undefined){
						Manager.store.addByValue('start', params.start);
					}else{
						Manager.store.addByValue('start', 0);
					};

					//* process widgets
					// remove all previous search filters - only if search filters is set to "getRefresh"					
					for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {
						if (Manager.widgets[Manager.searchfilterList[i].field].getRefresh())
							Manager.widgets[Manager.searchfilterList[i].field].removeAllSelectedFilters(false);
					};
					if (params.category == 'collections' && params.fq !== undefined){
						// add selected filters in searchFiltersWidget
						for (var i = 0, l = params.fq.length; i < l; i++) {
							var field = params.fq[i].value !== undefined ? params.fq[i].value.split(':')[0] : '';

							if (Manager.widgets[field] !== undefined && Manager.widgets[field].addSelectedFilter !== undefined)
								Manager.widgets[field].addSelectedFilter(params.fq[i].value.split(':')[1]);			    				
						}			    			
					}

					// copy "q" values in Currentsearch widget	
					var q_wout_q_def = Manager.store.extract_q_from_manager();

					Manager.widgets['currentsearch'].removeAllCurrentSearch();					
					for (var i = 0, l = q_wout_q_def.length; i < l; i++) {
						Manager.widgets['currentsearch'].add_q(q_wout_q_def[i], q_wout_q_def[i] );
					};	

					// select "sort" option in sorterWidget
					Manager.widgets['sorter'].setOption(Manager.store.get('sort').val());

					//**> start Solr request 
					Manager.doRequest();				   																   	 
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

			if (params.selected == undefined || !Manager.store.addByValue('sort', params.selected))																					
				return;	  

			Manager.widgets['currentsearch'].setRefresh(false);
			Manager.widgets['category'].setRefresh(false);
			for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
				Manager.widgets[searchFieldsTypes[i].field].setRefresh(false);
			};	

			var fqvalue = Manager.store.get('fq');
			var qvalue = Manager.store.extract_q_from_manager();	
			var sortvalue = Manager.store.get('sort').val();
			var model = {};
			model.q = qvalue;
			model.fq = fqvalue;	
			model.sort = sortvalue;
			model.view = this.getCurrentState()["view"];
			model.category = this.getCurrentState()["category"];

			ModelManager.setModel(model);
			ModelManager.updateView();
			
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
				Manager.widgets['currentsearch'].setRefresh(false);				

				var fqvalue = Manager.store.get('fq');
				var qvalue = Manager.store.extract_q_from_manager();
				var sortvalue = Manager.store.get('sort').val();
				var model = {};
				model.q = qvalue;
				model.fq = fqvalue;
				model.sort = sortvalue;
				model.view = this.getCurrentState()["view"];
				model.category = this.getCurrentState()["category"];

				ModelManager.setModel(model);
				ModelManager.updateView();
			}
		},


		/**
		 * current page changed
		 * */
		smk_search_pager_changed: function (start, searchFieldsTypes){
			Manager.widgets['currentsearch'].setRefresh(false);
			Manager.widgets['category'].setRefresh(false);
			for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
				Manager.widgets[searchFieldsTypes[i].field].setRefresh(false);
			};

			Manager.store.get('start').val(start);

			var fqvalue = Manager.store.get('fq');
			var qvalue = Manager.store.extract_q_from_manager();	
			var sortvalue = Manager.store.get('sort').val();
			var model = {};
			model.q = qvalue;
			model.fq = fqvalue;
			model.start = start;
			model.sort = sortvalue;
			model.view = this.getCurrentState()["view"];
			model.category = this.getCurrentState()["category"];

			ModelManager.setModel(model);
			ModelManager.updateView();
		},


		/**
		 * search string removed in Currentsearch
		 * */
		smk_search_remove_one_search_string: function(event){

			var facet = event.facet;
			var current_q = event.current_q;	  	  

			if (Manager.store.removeElementFrom_q(facet)) {   
				$(Manager.widgets['currentsearch'].target).empty();

				for (var i = 0, l = current_q.length; i < l; i++) {	 
					if (current_q[i].value == facet){
						current_q.splice(i, 1);
						Manager.widgets['currentsearch'].set_q(current_q);
						break;
					}    	    	
				}    	
			};

			var fqvalue = Manager.store.get('fq');
			var qvalue = Manager.store.extract_q_from_manager();
			var sortvalue = Manager.store.get('sort').val();
			var model = {};
			model.q = qvalue;
			model.fq = fqvalue;
			model.sort = sortvalue;
			model.view = this.getCurrentState()["view"];
			model.category = this.getCurrentState()["category"];

			ModelManager.setModel(model);
			ModelManager.updateView();   	    	
		},  


		/**
		 * a search string has been added in SearchBox
		 * */
		smk_search_q_added: function(event){

			var val = event.val;

			if (val != '') {
				var text = jQuery.trim(val);

				Manager.store.last = text;																																										

				var q_value = text;
				var teaser_view = false;

				// if in "detail" view, restore the default solr request
				if (ModelManager.getModel().view == 'detail'){
					//* delete current (exposed) solr parameters
					Manager.store.exposedReset()
					teaser_view = true;
				}

				//* concat the new search term to the previous term(s)
				var current_q = Manager.store.get('q');
				var current_q_values = new Array();							

				if (AjaxSolr.isArray(current_q.value)){
					for (var i = 0, l = current_q.value.length; i < l; i++) {
						current_q_values.push(current_q.value[i]);								 
					}
				}else if(typeof current_q.value === 'string'){
					current_q_values.push(current_q.value);
				};

				//* send request
				if (Manager.store.addByValue('q', current_q_values.concat(q_value))){																												

					if (typeof _gaq !== undefined)
						_gaq.push(['_trackEvent','Search', 'Regular search', q_value, 0, true]);

					if (teaser_view){
						// call to teasers view from searchbox when in "detail" view    	         	
						this.viewChanged({view:"teasers"});
						this.categoryChanged({category:"all"}); 	
						Manager.widgets['currentsearch'].removeAllCurrentSearch();    	    	
						Manager.widgets['details'].setCurrentThumb_selec(null);	    	    		
					}

					Manager.widgets['currentsearch'].add_q(q_value, text );  					

					var fqvalue = Manager.store.get('fq');
					var qvalue = Manager.store.extract_q_from_manager();
					var sortvalue = Manager.store.get('sort').val();
					var model = {};										
					model.q = qvalue;					
					model.sort = sortvalue;
					model.view = this.getCurrentState()["view"];
					model.category = this.getCurrentState()["category"];
					
					if (!teaser_view)
						model.fq = fqvalue;

					ModelManager.setModel(model);
					ModelManager.updateView();					

				};
			};
		},


		/**
		 * call to detail view
		 * */  

		smk_search_call_detail: function(event){			
			var save_current_request = event.save_current_request;    		  
			var art_id = event.detail_id;		  
			
			this.viewChanged({view:"detail"});

			if(save_current_request) //* save current solr parameters		  
				Manager.store.save();      		  				

			var model = {};
			model.q = art_id;
			model.view = this.getCurrentState()["view"];

			ModelManager.setModel(model);
			ModelManager.updateView(); 
		},

		/**
		 * call to teaser view
		 * */
		smk_search_call_teasers: function(){
			//restore previous search request in the manager
			Manager.store.load(true); 
			this.viewChanged({view:"teasers"}); 

			Manager.widgets['details'].setCurrentThumb_selec(null);
			
			var fqvalue = Manager.store.get('fq');
			var qvalue = Manager.store.extract_q_from_manager();
			var startvalue = Manager.store.get('start').val();
			var sortvalue = Manager.store.get('sort').val();
			var model = {};
			model.q = qvalue;
			model.fq = fqvalue;
			model.start = startvalue;
			model.sort = sortvalue;
			model.view = this.getCurrentState()["view"];
			model.category = this.getCurrentState()["category"];
						
			ModelManager.setModel(model);
			ModelManager.updateView(); 			
		},	


		/**
		 * Category changed
		 * */
		smk_search_category_changed: function(event){

			var category = event.category;
			var view = event.view;
			var caller = Manager.widgets['category'];	  	  	  

			if (caller.set(category)){   
				caller.setActiveTab(category);
				this.categoryChanged({'category': category});

				if (view !== undefined)
					this.viewChanged({'view': 'teasers'});

				Manager.widgets['currentsearch'].setRefresh(false);
				
				var fqvalue = Manager.store.get('fq');
				var qvalue = Manager.store.extract_q_from_manager();
				var model = {};
				model.q = qvalue;
				model.fq = fqvalue;
				model.view = this.getCurrentState()["view"];
				model.category = this.getCurrentState()["category"];
				
				ModelManager.setModel(model);
				ModelManager.updateView(); 
			};	  
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
					//this.show_info();
					
					this.show_footer();

				}			  
			}
		},  

		show_info: function(){	  
			$("body").find("#smk_search_info").css('opacity', '1');  	  
		},

		append_info: function(){

			if($("body").find("#smk_search_info").length == 0 && ModelManager.getModel().view != 'detail' && $.cookie("smk_search_info") != "false"){
				//* append information window
				var html = this.template_integration_json({'info': decodeURIComponent(Manager.translator.getLabel('general_tooltip'))}, '#infoTemplate');  
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

				Manager.widgets['details'].related_subWidget.removeAllArticles();
				$target.find("#related-artworks").hide();		  

				self.showWidget($target.find("#currentsearch"));
				self.showWidget($target.find("#category"));
				self.showWidget($target.find("#viewpicker"));
				self.showWidget($(Manager.widgets['sorter'].target));
				self.showWidget($target.find("#pager"));
				self.showWidget($target.find("#pager-header"));
				self.showWidget($(Manager.widgets['teasers'].target));

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

			var newstate = this.getNewState(stateChange);

			if (newstate["category"] === undefined )
				return;

			for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {				
				if (Manager.widgets[Manager.searchfilterList[i].field].getRefresh())
					Manager.widgets[Manager.searchfilterList[i].field].hide_drop();
			};

			switch(newstate["category"]){
			case "collections":		 			  			  				  
				this.showWidget($target.find("#search-filters"));
				//$target.find("#search-filters").show().children().show();		
				$(Manager.widgets['teasers'].target).find('#teaser-container-grid').removeClass('full-width').hide();
				Manager.widgets['category'].setActiveTab(newstate["category"]);

				break;
			case "nyheder":
			case "kalender":
			case "artikel":
			case "praktisk":
			case "all":
				$target.find("#search-filters").hide();
				$(Manager.widgets['teasers'].target).find('#teaser-container-grid').addClass('full-width').hide();
				Manager.widgets['category'].setActiveTab(newstate["category"]);

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
