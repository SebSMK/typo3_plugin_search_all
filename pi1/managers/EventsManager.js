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
		
		/******************************
		 * PUBLIC FUNCTIONS
		 * * ****************************/	
		this.init = function(){
      /*
			 * Management of changes in address bar
			 * n.b.: externalChange is triggered also on document load
			 * */
			$.address.strict(false);
			$( document ).ready(function() {				  

				$.address.externalChange(function(e){	 

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
				});
			});	  	  
						
		};
    
    
    /********
     * EVENTS
     * *******/
    
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
			model.view = ModelManager.current_value_joker;
			model.category = ModelManager.current_value_joker;

			ModelManager.setModel(model);
			ModelManager.updateView();
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
				model.view = ModelManager.current_value_joker;
        model.category = ModelManager.current_value_joker;
				
				ModelManager.setModel(model);
				ModelManager.updateView(); 
			};	  
		};
		
		
	}
	
}));