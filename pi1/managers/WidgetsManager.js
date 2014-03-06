var Manager;

(function ($) {

  $(function () {
	
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
		
	var stateManager = new AjaxSolr.StateManager({
	    id: 'state_manager',
	    target: '#smk_search_wrapper',
	    currentState: {view:'teasers', category:''}
	});
	
	//** init manager
	// this function will be passed as parameter in the manager - we've got to bind it to an environment
	var allWidgetsProcessedBound = $.proxy(stateManager.allWidgetsProcessed, stateManager);
	var generalSolrErrorProcessedBound = $.proxy(stateManager.generalSolrError, stateManager);
	
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

    
	//** load widgets
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
   
	///* switch grid/list in teasers view
	$(Manager.widgets['viewpicker']).on('view_picker', function(event){ 
   	 Manager.widgets['teasers'].switch_list_grid(event.value);
	}); 
	
	$(Manager.widgets['state_manager']).on('current_view_mode', function(event){ 
	   	 Manager.widgets['teasers'].switch_list_grid(event.value);
	});
    
	//* selected category changed
    $(Manager.widgets['category']).on('smk_search_category_changed', function(event){     	
    	Manager.widgets['state_manager'].categoryChanged({category:event.category});
    	Manager.widgets['currentsearch'].setRefresh(false);
    }); 
    
    //* searchfilters changed
    for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
    	$(Manager.widgets[searchFieldsTypes[i].field]).on('smk_search_filter_changed', function(event){
    		Manager.widgets['currentsearch'].setRefresh(false);
    	});
  	};
  	
    //* pager changed
    $(Manager.widgets['pager']).on('smk_search_pager_changed', function(event){     	
    	Manager.widgets['currentsearch'].setRefresh(false);
		Manager.widgets['category'].setRefresh(false);
		for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
	    	Manager.widgets[searchFieldsTypes[i].field].setRefresh(false);
	  	};	
    }); 

    //* sorter changed
    $(Manager.widgets['sorter']).on('smk_search_sorter_changed', function(event){     	
    	Manager.widgets['currentsearch'].setRefresh(false);
		Manager.widgets['category'].setRefresh(false);
		for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
	    	Manager.widgets[searchFieldsTypes[i].field].setRefresh(false);
	  	};	
    }); 
  	
    //* calls to detail view
    $(Manager.widgets['teasers']).on('smk_search_call_detail', function(event){     	
    	Manager.widgets['state_manager'].viewChanged({view:"detail"});
    	Manager.widgets['state_manager'].uniqueURL({'key':'id', 'value': event.detail_id});
    	Manager.widgets['details'].call_detail(event.detail_id, true);      	
    });	
    $(Manager.widgets['state_manager']).on('smk_search_call_detail', function(event){     	
    	Manager.widgets['state_manager'].viewChanged({view:"detail"});
    	Manager.widgets['state_manager'].uniqueURL({'key':'id', 'value': event.detail_id});
    	Manager.widgets['details'].call_detail(event.detail_id, true);      	
    });
    $(Manager.widgets['related']).on('smk_search_call_detail', function(event){     	    	
    	Manager.widgets['state_manager'].empty_detail_view();
    	Manager.widgets['state_manager'].uniqueURL({'key':'id', 'value': event.detail_id});
    	Manager.widgets['details'].call_detail(event.detail_id, false);
    });	
    $(Manager.widgets['thumbs']).on('smk_search_call_detail', function(event){     	    	
    	Manager.widgets['state_manager'].empty_detail_view();
    	Manager.widgets['state_manager'].uniqueURL({'key':'id', 'value': event.detail_id});
    	Manager.widgets['details'].call_detail(event.detail_id, false);
    });
    
    //* calls to teasers view
    $(Manager.widgets['details']).on('smk_search_call_teasers', function(event){     	
    	Manager.widgets['state_manager'].viewChanged({view:"teasers"}); 
    	Manager.widgets['state_manager'].uniqueURL({});
    	Manager.widgets['thumbs'].current_selec = null;
    });	
    
    //* call to default view
    $(Manager.widgets['state_manager']).on('smk_search_call_default_view', function(event){     	
    	Manager.widgets['state_manager'].viewChanged({view:"teasers"}); 
    	Manager.widgets['state_manager'].categoryChanged({category:"all"});
    	Manager.widgets['state_manager'].uniqueURL({});
    	Manager.doRequest();
    });	
    
    // call to teasers view from searchbox when in "detail" view
    $(Manager.widgets['searchbox']).on('smk_search_box_from_detail_call_teasers', function(event){     	
    	Manager.widgets['state_manager'].viewChanged({view:"teasers"});
    	Manager.widgets['state_manager'].categoryChanged({category:"all"});
    	Manager.widgets['currentsearch'].removeAllCurrentSearch();
    	//Manager.widgets['sorter'].resetSelect();
    	Manager.widgets['thumbs'].current_selec = null;
    });	
	        
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
    
    //* a new search term input in search box
    $(Manager.widgets['searchbox']).on('smk_search_q_added', function(event){     	
    	Manager.widgets['currentsearch'].add_q(event.value, event.text );    	
    });	        

    //* init all widgets
    Manager.init();    
    
    //* default request parameters
    var q = [Manager.store.q_default];
    var postedSearchString = 'barn';//smkCommon.getSearchPOST();         
    if(postedSearchString !== undefined && postedSearchString != '')
    	q = q.concat(postedSearchString);
    
    Manager.store.addByValue('q', q);    
    var params = {
      facet: true,
      'facet.field': ['artist_name_ss', 'artist_natio', 'object_production_century_earliest', 'object_type', 'category'],      
      //'f.prod_technique.facet.mincount': 20,
      'facet.limit': -1,
      'facet.mincount': 1,
      'rows':12,
      'defType': 'edismax',      
      'qf': Manager.store.get_qf_string(),
      'start': Math.floor((Math.random()*2000)+1),
      'json.nl': 'map'
    };
    for (var name in params) {
      Manager.store.addByValue(name, params[name]);
    }
    
    if(postedSearchString !== undefined && postedSearchString != '')
    	Manager.doRequest();    
        
  });

})(jQuery);
