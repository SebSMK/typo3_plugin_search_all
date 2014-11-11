(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var eventsManager = {};
		factory(eventsManager);
		if (typeof define === "function" && define.amd) {
			define(eventsManager); // AMD
		} else {
			root.EventsManager = eventsManager; // <script>
		}
	}
}(this, function (eventsManager) {

	eventsManager.constructor = function(){

		this.init = function(){
			/*
			 * Management of changes in address bar
			 * n.b.: externalChange is triggered also on document load
			 * */
			var self = this;
			$.address.strict(false);
			$( document ).ready(function() {				  
				$.address.externalChange(function(e){self.addressChange(e)});
			});	  	  
		};

		/********
		 * EVENTS
		 * *******/
		/**
		 * change in address bar
		 * */
		this.addressChange = function(e){	 

			ModelManager.setModel(e.value, "url");
			var model = ModelManager.getModel();		    			    

			//* process view
			if(model.view !== undefined){
				StateManager.viewChanged({'view': model.view});				    				    				    					    					    	
			}else{
				StateManager.viewChanged({'view': "teasers"});
			}			    

			//* process category
			if(model.category !== undefined){
				if (model.view != 'detail'){			    		
					StateManager.categoryChanged({'category': model.category});
				}else{			    		
					Manager.widgets['details'].setCurrentThumb_selec(null);	
				}
			}else if(model.category == undefined && model.view != 'detail'){
				StateManager.categoryChanged({'category': "all"});
			}

			//* process Solr request

			// reset exposed parameters
			Manager.store.exposedReset();

			// q param
			var q = [];
			if (model.view != 'detail'){
				q = [Manager.store.q_default];										
				if(model.q !== undefined)
					q = q.concat(model.q);
			}else{
				if(model.q !== undefined)
					q = sprintf('id_s:%s', model.q);			    	
			};

			Manager.store.addByValue('q', q);

			// fq param
			if(model.fq !== undefined && AjaxSolr.isArray(model.fq)){
				for (var i = 0, l = model.fq.length; i < l; i++) {						
					Manager.store.addByValue('fq', model.fq[i].value, model.fq[i].locals);
				};											
			};												

			// qf param
			if(model.view != "detail")
				Manager.store.addByValue('qf', Manager.store.get_qf_string());					    		

			// sort param
			if(model.sort !== undefined){
				Manager.store.addByValue('sort', model.sort);
			}else{
				Manager.store.addByValue('sort', Manager.store.sort_default);
			};

			// start param
			if(model.start !== undefined){
				Manager.store.addByValue('start', model.start);
			}else{
				Manager.store.addByValue('start', 0);
			};

			//* process widgets
			// remove all previous search filters - only if search filters is set to "getRefresh"					
			for (var i = 0, l = Manager.searchfilterList.length; i < l; i++) {
				if (Manager.widgets[Manager.searchfilterList[i].field].getRefresh())
					Manager.widgets[Manager.searchfilterList[i].field].removeAllSelectedFilters(false);
			};
			if (model.category == 'collections' && model.fq !== undefined){
				// add selected filters in searchFiltersWidget
				for (var i = 0, l = model.fq.length; i < l; i++) {
					var field = model.fq[i].value !== undefined ? model.fq[i].value.split(':')[0] : '';

					if (Manager.widgets[field] !== undefined && Manager.widgets[field].addSelectedFilter !== undefined)
						Manager.widgets[field].addSelectedFilter(model.fq[i].value.split(':')[1]);			    				
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
		};

		
		/*
		 * UI events
		 * 
		 * */
		
		/**
		 * current page changed
		 * */
		this.smk_search_pager_changed = function(start, searchFieldsTypes){
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
			model.start = start;
			model.sort = sortvalue;
			model.category = ModelManager.current_value_joker;

			ModelManager.updateView(model);
		};

		/**
		 * Category changed
		 * */
		this.smk_search_category_changed = function(event){

			var category = event.category;
			var view = event.view;
			var caller = Manager.widgets['category'];	  	  	  

			if (caller.set(category)){   
				caller.setActiveTab(category);
				StateManager.categoryChanged({'category': category});

				if (view !== undefined)
					StateManager.viewChanged({'view': 'teasers'});

				Manager.widgets['currentsearch'].setRefresh(false);

				var fqvalue = Manager.store.get('fq');
				var qvalue = Manager.store.extract_q_from_manager();
				var model = {};
				model.q = qvalue;
				model.fq = fqvalue;
				model.category = category;

				ModelManager.updateView(model); 
			};	  
		};

		/**
		 * call to teaser view
		 * */
		this.smk_search_call_teasers = function(){

			StateManager.viewChanged({view:"teasers"}); 

			Manager.widgets['details'].setCurrentThumb_selec(null);

			//restore previous search params
			var model = ModelManager.loadStoredModel();

			ModelManager.updateView(model); 			
		};	

		/**
		 * call to detail view
		 * */  
		this.smk_search_call_detail = function(event){			
			var save_current_request = event.save_current_request;    		  
			var art_id = event.detail_id;		  

			StateManager.viewChanged({view:"detail"});

			if(save_current_request){
				ModelManager.storeCurrentModel();  
				Manager.store.exposedReset();
			}		

			var model = {};			 				    		  							
			model.q = art_id;
			model.view = "detail";

			ModelManager.updateView(model); 
		};	

		/**
		 * a search string has been added in SearchBox
		 * */
		this.smk_search_q_added = function(event){

			var val = event.val;

			if (val != '') {
				var text = jQuery.trim(val);

				Manager.store.last = text;																																										

				var q_value = text;
				var teaser_view = false;

				// if in "detail" view, restore the default solr request
				if (ModelManager.getModel().view == 'detail'){
					//* delete current (exposed) solr parameters
					Manager.store.exposedReset();
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
						StateManager.viewChanged({view:"teasers"});
						StateManager.categoryChanged({category:"all"}); 	
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
					model.view = teaser_view ? "teasers" : ModelManager.current_value_joker;
					model.category = teaser_view ? "all" : ModelManager.current_value_joker;

					if (!teaser_view)
						model.fq = fqvalue;

					ModelManager.updateView(model);					

				};
			};
		};

		/**
		 * search string removed in Currentsearch
		 * */
		this.smk_search_remove_one_search_string = function(event){

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
			model.view = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;

			ModelManager.updateView(model);   	    	
		};  

		/**
		 * search filter added / removed (only in "search in collection" view)
		 * */
		this.smk_search_filter_changed = function (caller, params){

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
				model.view = ModelManager.current_value_joker;
				model.category = ModelManager.current_value_joker;

				ModelManager.updateView(model);
			}
		};

		/**
		 * sorting changed
		 * */
		this.smk_search_sorter_changed = function(params, searchFieldsTypes){

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
			model.view = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;

			ModelManager.updateView(model);			
		};		

		/** 
		 * switch grid/list in teasers view		 
		 */
		this.switch_list_grid = function(value){ 
			Manager.widgets['teasers'].switch_list_grid(value);
		};	
		
		
		/*
		 * Finish loading events
		 * 
		 * */

		//* searchfilters has finished loading
		this.remove_modal_loading_from_widget = function(value){
			StateManager.remove_modal_loading_from_widget(value);
		};
		
		//* a new image has been displayed in "teaser"
		this.smk_teasers_this_img_displayed = function(){
			StateManager.smk_teasers_this_img_displayed();
		};		
		
		//* a new image has finished loading in "teaser"
		this.smk_teasers_this_img_loaded = function(){
			StateManager.smk_teasers_this_img_loaded();
		};			

		//* all images displayed in "teaser"
		this.after_afterRequest = function(field){
			Manager.widgets[field].after_afterRequest();
		};
		
		//* a new image has finished loading in "related"
		this.smk_related_this_img_loaded = function(){
			StateManager.smk_related_this_img_loaded();
		};
		
		//* a new image has finished loading in "thumbs"
		this.smk_thumbs_img_loaded = function(){
			StateManager.smk_thumbs_img_loaded();
		};

		//* image has finished loading in "detail"
		this.smk_detail_this_img_loaded = function(){
			StateManager.smk_detail_this_img_loaded();
		};          
	}
}));