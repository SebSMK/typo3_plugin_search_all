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
					StateManager.callWidgetFn('details', 'setCurrentThumb_selec', {params:[null]});						
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
				if(StateManager.callWidgetFn(Manager.searchfilterList[i].field, 'getRefresh'))
					StateManager.callWidgetFn(Manager.searchfilterList[i].field, 'removeAllSelectedFilters', {params:[false]});	

			};
			if (model.category == 'collections' && model.fq !== undefined){
				// add selected filters in searchFiltersWidget
				for (var i = 0, l = model.fq.length; i < l; i++) {
					var field = model.fq[i].value !== undefined ? model.fq[i].value.split(':')[0] : '';					
					StateManager.callWidgetFn(field, 'addSelectedFilter', {params: [model.fq[i].value.split(':')[1]]} );					
				}			    			
			}

			// copy "q" values in Currentsearch widget	
			var q_wout_q_def = Manager.store.extract_q_from_manager();

			StateManager.callWidgetFn('currentsearch', 'removeAllCurrentSearch');						

			for (var i = 0, l = q_wout_q_def.length; i < l; i++) {				
				StateManager.callWidgetFn('currentsearch', 'add_q', {params: [q_wout_q_def[i], q_wout_q_def[i]]} );
			};	

			// select "sort" option in sorterWidget
			StateManager.callWidgetFn('sorter', 'setOption', {params: [Manager.store.get('sort').val()]});

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
			StateManager.callWidgetFn('currentsearch', 'setRefresh', {params: [false]});
			StateManager.callWidgetFn('category', 'setRefresh', {params: [false]});
			for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {				
				StateManager.callWidgetFn(searchFieldsTypes[i].field, 'setRefresh', {params: [false]});
			};			

			var model = {};
			model.q = ModelManager.current_value_joker;
			model.fq = ModelManager.current_value_joker;
			model.start = start;
			model.sort = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;

			ModelManager.updateView(model);
		};

		/**
		 * Category changed
		 * */
		this.smk_search_category_changed = function(event){

			var category = event.category;
			var view = event.view;  	  	  

			if (StateManager.callWidgetFn('category', 'set', {params: [category]})){   				
				StateManager.callWidgetFn('category', 'setActiveTab', {params: [category]});

				StateManager.callWidgetFn('currentsearch', 'setRefresh', {params: [false]});

				var model = {};
				model.q = ModelManager.current_value_joker;
				model.category = category;

				ModelManager.updateView(model); 
			};
		};

		/**
		 * call to teaser view
		 * */
		this.smk_search_call_teasers = function(){
			
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

			if(save_current_request){
				ModelManager.storeCurrentModel();
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
			var search_string = jQuery.trim(event.val);			
			var q = new Array()
			if (search_string != '') {																																									
				var default_teaser_view = ModelManager.getModel().view == 'detail';
				
				if (!default_teaser_view)
					q = AjaxSolr.isArray(ModelManager.getModel().q) ?  
							ModelManager.getModel().q 
						: 
							ModelManager.getModel().q === undefined ? new Array() : new Array(ModelManager.getModel().q);				
				
				q.push(search_string); 			
				
				if (typeof _gaq !== undefined)
					_gaq.push(['_trackEvent','Search', 'Regular search', search_string, 0, true]);

				var model = {};										
				model.q = q;					
				model.sort = ModelManager.current_value_joker;
				model.view = default_teaser_view ? "teasers" : ModelManager.current_value_joker;
				model.category = default_teaser_view ? "all" : ModelManager.current_value_joker;

				if (!default_teaser_view)
					model.fq = ModelManager.current_value_joker;

				ModelManager.updateView(model);					
			};
		};

		/**
		 * search string removed in Currentsearch
		 * */
		this.smk_search_remove_one_search_string = function(event){

			var facet = event.facet;			

			Manager.store.removeElementFrom_q(facet);   			

			var qvalue = Manager.store.extract_q_from_manager();
			var model = {};
			model.q = qvalue;
			model.fq = ModelManager.current_value_joker;;
			model.sort = ModelManager.current_value_joker;;
			model.view = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;

			ModelManager.updateView(model);   	    	
		};  

		/**
		 * search filter added / removed (only in "collection" tab/category)
		 * */
		this.smk_search_filter_changed = function (caller, params){

			var trigg_req = false;

			if (params.selected !== undefined){
				if (caller.add(params.selected)) //!! -> change fq param in Manager.store
					trigg_req = true;
			}else if (params.deselected !== undefined){    		
				if (caller.remove(params.deselected)) //!! -> change fq param in Manager.store
					trigg_req = true;
			};    	    	

			if (trigg_req){				
				StateManager.callWidgetFn('currentsearch', 'setRefresh', {params: [false]});

				var fqvalue = Manager.store.get('fq');				
				var model = {};				
				model.fq = fqvalue;
				model.q = ModelManager.current_value_joker;
				model.sort = ModelManager.current_value_joker;
				model.view = ModelManager.current_value_joker;
				model.category = ModelManager.current_value_joker;

				ModelManager.updateView(model);
			}
		};

		/**
		 * sorting changed
		 * */
		this.smk_search_sorter_changed = function(params, searchFieldsTypes){

			if (params.selected == undefined)																					
				return;	  
			
			StateManager.callWidgetFn('currentsearch', 'setRefresh', {params: [false]});
			StateManager.callWidgetFn('category', 'setRefresh', {params: [false]});			
			for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {				
				StateManager.callWidgetFn(searchFieldsTypes[i].field, 'setRefresh', {params: [false]});
			};	

			var sortvalue = params.selected;
			var model = {};
			model.sort = sortvalue;
			model.q = ModelManager.current_value_joker;
			model.fq = ModelManager.current_value_joker;	
			model.view = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;

			ModelManager.updateView(model);			
		};		

		/** 
		 * switch grid/list in teasers view		 
		 */
		this.switch_list_grid = function(value){ 			
			StateManager.callWidgetFn('teasers', 'switch_list_grid', {params: [value]});
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
			StateManager.callWidgetFn(field, 'after_afterRequest');
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