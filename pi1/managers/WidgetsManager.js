var Manager;

(function ($) {

  $(function () {	  
	var self = this;	
	  	
	//******************************
	//** load configuration
	//****************************** 
	var current_language = smkCommon.getCurrentLanguage();
	
	//** load solr conf  
	var solr_conf = new Configurator.constructor();
	solr_conf.load_json("pi1/conf/solr_conf.json");
	var exposed = solr_conf.get_exposed_params();
	var q_default = solr_conf.get_q_default();
	var qf_default = solr_conf.get_qf_default(current_language);
	  
	//** init multi language script 
	var translator = new Language.constructor();	
	translator.load_json("pi1/language/language.json");	
	translator.setLanguage(current_language);	
	
	//** init searchFields
	var searchFieldsTypes = [ {field:'artist_name_ss', title:translator.getLabel('tagCloud_artist')}, {field:'artist_natio', title:translator.getLabel('tagCloud_country')}, {field:'object_production_century_earliest', title:translator.getLabel('tagCloud_period')}, {field:'object_type', title:translator.getLabel('tagCloud_art_type')} ];
	
	//** init state manager widget (has to be initialized before the widgetManager)
	var stateManager = new AjaxSolr.StateManager({
	    id: 'state_manager',
	    target: '#smk_search_wrapper',
	    currentState: {view:'teasers', category:''}
	});
	// those functions will be passed as parameter in the manager - we've got to bind it to an environment
	var allWidgetsProcessedBound = $.proxy(stateManager.allWidgetsProcessed, stateManager);
	var generalSolrErrorProcessedBound = $.proxy(stateManager.generalSolrError, stateManager);

	//******************************
	//** init widgetManager
	//******************************    
    Manager = new AjaxSolr.smkManager({
    	solrUrl: smkCommon.getSolrPath(),    	    	
    	store: new AjaxSolr.smkParameterStore({
    		exposed: exposed,    		
    		q_default: q_default,
    		qf_default: qf_default
    	}),
    	searchfilterList: searchFieldsTypes,
    	allWidgetsProcessed: allWidgetsProcessedBound,
    	generalSolrError: generalSolrErrorProcessedBound,
    	translator: translator
    });
    
    //* set and save default request parameters                
    var params = {
      'q': Manager.store.q_default,	
      'facet': true,
      'facet.field': ['artist_name_ss', 'artist_natio', 'object_production_century_earliest', 'object_type'],
      'facet.limit': -1,
      'facet.mincount': 1,
      'rows':12,
      'defType': 'edismax',      
      'qf': Manager.store.get_qf_string(),
      'start': 0, // Math.floor((Math.random()*2000)+1),
      'json.nl': 'map'
    };
    for (var name in params) {
      Manager.store.addByValue(name, params[name]);
    }    
    // add facet category with locals params
    Manager.store.add('facet.field', new AjaxSolr.Parameter({ name:'facet.field', value: 'category', locals: { ex:'category' } }));
    
    // save 'default request' parameters
    Manager.store.save(true);
    
	//******************************
	//** load widgets
	//******************************
    
    //* stateManagerWidget must be registred in first place
	Manager.addWidget(stateManager);
	
	// this function will be passed as parameter in the searchbox - we've got to bind it to an environment
	var getCurrentStateBound = $.proxy(stateManager.getCurrentState, stateManager);
	Manager.addWidget(new AjaxSolr.SearchBoxWidget({
		  id: 'searchbox',
		  target: '#searchbox',
		  getCurrentState: getCurrentStateBound,
		  template: Mustache.getTemplate('pi1/templates/search_box.html')
	}));
	
	Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
	    id: 'currentsearch',
	    target: '#currentsearch',
	    template: Mustache.getTemplate('pi1/templates/current.html')
	  })); 
	
	Manager.addWidget(new AjaxSolr.PagerWidget({
	    id: 'pager',
	    target: '#pager',
	    prevLabel: '&lt;',
	    nextLabel: '&gt;',
	    innerWindow: 1,
	    renderHeader: function (perPage, offset, total) {
	      $('#pager-header').html($('<li></li>').html( sprintf(' %s <span>%s</span> %s <span>%s</span> %s <span>%s</span>', translator.getLabel('pager_display'), Math.min(total, offset + 1), translator.getLabel('pager_to'), Math.min(total, offset + perPage),translator.getLabel('pager_af'), total)));
	    }
	  }));
	
	Manager.addWidget(new AjaxSolr.ViewPickerWidget({
	    id: 'viewpicker',
	    target: '#viewpicker',
	    template: Mustache.getTemplate('pi1/templates/view_picker.html')
	  })); 
	
	Manager.addWidget(new AjaxSolr.SorterWidget({
	    id: 'sorter',
	    target: '#sorter',
	    template: Mustache.getTemplate('pi1/templates/sorter.html')
	  })); 
	
	Manager.addWidget(new AjaxSolr.CategoryWidget({
	    id: 'category',
	    target: '#category',
	    field: 'category',
	    multivalue:false,	    
	    categoryList: {"all":translator.getLabel('category_all'), "samlingercollectionspace":translator.getLabel('category_artwork'), "nyheder":translator.getLabel('category_news'), "kalender":translator.getLabel('category_calendar'), "praktisk":translator.getLabel('category_info')},
	    activeCategory: "all",
	    template: Mustache.getTemplate('pi1/templates/category.html')
	  }));	
		
	Manager.addWidget(new AjaxSolr.TeasersWidget({
	    id: 'teasers',
	    target: '#smk_teasers',
	    template: Mustache.getTemplate('pi1/templates/teasers.html')
	  }));
	
	for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
	  Manager.addWidget(new AjaxSolr.SearchFiltersWidget({
		    id: searchFieldsTypes[i].field,
		    title: searchFieldsTypes[i].title,
		    target: '#' + searchFieldsTypes[i].field,
		    field: searchFieldsTypes[i].field,
		    template: Mustache.getTemplate('pi1/templates/chosen.html')
	   }));
	};				
	
	//* Detail and Thumbs widgets are tightly coupled
	Manager.addWidget(new AjaxSolr.DetailWidget({
	      id: 'details',
	      target: '#smk_detail',
	      thumbnails_target:'#thumbnails',
	      template: Mustache.getTemplate('pi1/templates/detail.html')
	 }));
	Manager.addWidget(new AjaxSolr.ThumbsWidget({
	      id: 'thumbs',
	      target: '#thumbnails',
	      template: Mustache.getTemplate('pi1/templates/thumb.html')
	 }));	
	
	Manager.addWidget(new AjaxSolr.RelatedWidget({
	    id: 'related',
	    target: '#related-artworks',
	    template: Mustache.getTemplate('pi1/templates/related.html')
	 }));

	//******************************
	//** add event listeners
	//******************************

	/*
	 * Widgets state changed
	 * 
	 * */
	
	///* switch grid/list in teasers view
	$(Manager.widgets['viewpicker']).on('view_picker', function(event){ 
		Manager.widgets['teasers'].switch_list_grid(event.value);
	}); 
	
	$(Manager.widgets['state_manager']).on('current_view_mode', function(event){ 
	   	 Manager.widgets['teasers'].switch_list_grid(event.value);
	});
    
	//* selected category changed
    $(Manager.widgets['category']).on('smk_search_category_changed', function(event){     	
    	Manager.widgets['state_manager'].smk_search_category_changed(event);
    });     
   
    
    //* searchfilters changed
    for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
    	$(Manager.widgets[searchFieldsTypes[i].field]).on('smk_search_filter_changed', {self: Manager.widgets[searchFieldsTypes[i].field]}, function(event){    		
    		Manager.widgets['state_manager'].smk_search_filter_changed(event.data.self, event.params);    		    		    		    		
    	});
  	};
  	
    //* pager changed
    $(Manager.widgets['pager']).on('smk_search_pager_changed', function(event){  
    	Manager.widgets['state_manager'].smk_search_pager_changed(event.start, searchFieldsTypes);
    }); 
    
    //* sorter changed
    $(Manager.widgets['sorter']).on('smk_search_sorter_changed', function(event){     	
    	Manager.widgets['currentsearch'].setRefresh(false);
		Manager.widgets['category'].setRefresh(false);
		for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
	    	Manager.widgets[searchFieldsTypes[i].field].setRefresh(false);
	  	};	
	  	Manager.doRequest(0);
    }); 
    
    //* new search term input in search box
    $(Manager.widgets['searchbox']).on('smk_search_q_added', function(event){
    	Manager.widgets['state_manager'].smk_search_q_added(event);	    	
    });	
    
    //* a search string has been removed in current search
    $(Manager.widgets['currentsearch']).on('smk_search_remove_one_search_string', function(event){     	
    	Manager.widgets['state_manager'].smk_search_remove_one_search_string(event);
    });	
	
    /*
	 * Calls to view changes
	 * 
	 * */    
    
    //* calls to detail view
    $(Manager.widgets['state_manager'])
    .add(Manager.widgets['related'])
    .add(Manager.widgets['thumbs'])
    .add(Manager.widgets['teasers'])
        
    .on('smk_search_call_detail', function(event){     	
    	Manager.widgets['state_manager'].smk_search_call_detail(event);
    });
    
    //* calls to teasers view
    $(Manager.widgets['details']).on('smk_search_call_teasers', function(event){  
		//restore previous search request in the manager
		Manager.store.load(true); 
    	Manager.widgets['state_manager'].viewChanged({view:"teasers"}); 
    	    	
		 var fqvalue = this.manager.store.get('fq');
		 var qvalue = this.manager.store.extract_q_from_manager();
		 var start = this.manager.store.get('start');
		 
		 var params = {};
		 params.q = qvalue;
		 params.fq = fqvalue;
		 params.start = start.value;
		 params.view = Manager.widgets['state_manager'].getCurrentState()["view"];
		 params.category = Manager.widgets['state_manager'].getCurrentState()["category"];
		 
		 UniqueURL.setUniqueURL(params);
    	
    	Manager.widgets['thumbs'].setCurrent_selec(null);
    });	
    
    //* calls to default view
    $(		Manager.widgets['state_manager'])
    .add((	Manager.widgets['details']))
    
    .on('smk_search_call_default_view', function(event){     	
    	Manager.widgets['state_manager'].viewChanged({view:"teasers"}); 
    	Manager.widgets['state_manager'].categoryChanged({category:"all"});
    	UniqueURL.setUniqueURL({});
    	Manager.widgets['currentsearch'].removeAllCurrentSearch();
    	Manager.widgets['thumbs'].setCurrent_selec(null);
    	Manager.widgets['details'].set_call_default_on_return(false);
    	Manager.store.load(true, event.isDefault); 
    	Manager.doRequest();
    });	    
    
    /*
	 * Finish loading events
	 * 
	 * */
	        
    //* searchfilters has finished loading
    for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
    	$(Manager.widgets[searchFieldsTypes[i].field]).on('smk_search_filter_loaded', function(event){
    		Manager.widgets['state_manager'].remove_modal_loading_from_widget(event.currentTarget.target);
    	});
  	};	
    
    //* a new image has finished loading in "teaser"
    $(Manager.widgets['teasers']).on('smk_teasers_this_img_loaded', function(event){     	            	
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
    		Manager.widgets['state_manager'].remove_modal_loading_from_widget(Manager.widgets['teasers'].target);
   	   	 	
    		// if in list view mode, align images
      	  	if ($(Manager.widgets['teasers'].target).find('.teaser--list').length > 0)
      	  		Manager.widgets['teasers'].verticalAlign(); 
    	}    		  
	    
    });
    
    //* a new image has finished loading in "related"
    $(Manager.widgets['related']).on('smk_related_this_img_loaded', function(event){     	            	
    	$(Manager.widgets['related'].target).find('#teaser-container-grid').masonry('layout');  
    	
    	//* check if there are still images loading in "related"
    	if ($(Manager.widgets['related'].target).find('.image_loading').length == 0){    		
    		// if all images are loaded, we stop the modal "waiting image" for this widget
    		Manager.widgets['state_manager'].remove_modal_loading_from_widget(Manager.widgets['related'].target);   	   	 	       	  	
    	}    		
    	
    }); 
    
    //* a new image has finished loading in "thumbnails"
    $(Manager.widgets['thumbs']).on('smk_thumbs_img_loaded', function(event){     	            	    	
    	//* check if there are still images loading in "teaser"
    	if ($(Manager.widgets['thumbs'].target).find('.image_loading').length == 0){
    		
//    		// if all images are loaded, we stop the modal "waiting image" for this widget
//    		Manager.widgets['state_manager'].remove_modal_loading_from_widget(Manager.widgets['teasers'].target);
      	  	Manager.widgets['thumbs'].verticalAlign();       	  	
    	}    		  
	    
    });
    
    //* image has finished loading in "detail"
    $(Manager.widgets['details']).on('smk_detail_this_img_loaded', function(event){     	            		    	
    	Manager.widgets['state_manager'].remove_modal_loading_from_widget(Manager.widgets['details'].target);   
    	// show "back-button" in Detail view - in order to have the delay (specified in app.css) on showing to work properly, 
    	// we had to implement a tricky little piece of code, see ThumbnailsWidget-> after "doc.multi_work_ref !== undefined"
		// If you find a more rational method to achieve that, feel free to implement it.
    	$(Manager.widgets['details'].target).find('a.back-button').css('opacity', '1');
    });
           
    
	//******************************
	//** init all widgets
	//****************************** 
    Manager.init();   
    
	//******************************
	//** if POSTed, add request string 
	//******************************     
    //* if a request string has been posted, add it to the manager (the request will be handled on page load by $.address.externalChange
    var postedSearchString = smkCommon.getSearchPOST();         
    if(postedSearchString !== undefined && postedSearchString != ''){
    	if (typeof _gaq !== undefined)
    		_gaq.push(['_trackEvent','Search', 'Regular search', postedSearchString, 0, true]);
    	
//    	q = q.concat(postedSearchString);
//    	Manager.store.addByValue('q', q);
//    	var qvalue = Manager.store.extract_q_from_manager();
    	
		 var params = {};
		 params.q = postedSearchString;		 		 
		 UniqueURL.setUniqueURL(params);    	
    }
  });

})(jQuery);
