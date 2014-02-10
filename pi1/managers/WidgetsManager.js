var Manager;

(function ($) {

  $(function () {
	
	//** init multi language script 
	var lang = new Language.constructor();	
	lang.load_json("pi1/language/language.json");
	var current_language = $.cookie("smk_search_all_current_language");  
	lang.setLanguage(current_language);	
	
	//** init variables
	var tagcloudFields = [ {field:'artist_name_ss', title:lang.getLabel('tagCloud_artist')}, {field:'artist_natio', title:lang.getLabel('tagCloud_country')}, {field:'object_production_century_earliest', title:lang.getLabel('tagCloud_period')}, {field:'object_type', title:lang.getLabel('tagCloud_art_type')} ];
		
	var stateManager = new AjaxSolr.StateManager({
	    id: 'state_manager',
	    target: '#smk_search_wrapper',
	    currentState: {view:'teasers', category:''}
	});
	
	//** init manager
	// this function will be passed as parameter in the manager - we've got to bind it to an environment
	var allWidgetsProcessedBound = $.proxy(stateManager.allWidgetsProcessed, stateManager);	
    Manager = new AjaxSolr.smkManager({
    	solrUrl: 'http://csdev-seb:8180/solr-example/SMK_All_v4/',
    	store: new AjaxSolr.smkParameterStore({
    		exposed: ["fq", "q", "start", "limit", "sort"]
    	}),
    	searchfilterList: tagcloudFields,
    	allWidgetsProcessed: allWidgetsProcessedBound
    });

	//** load widgets
    //* stateManagerWidget must be registred in first place
	Manager.addWidget(stateManager);
	
	// this function will be passed as parameter in the searchbox - we've got to bind it to an environment
	var getCurrentStateBound = $.proxy(stateManager.getCurrentState, stateManager);
	Manager.addWidget(new AjaxSolr.SearchBoxWidget({
		  id: 'searchbox',
		  target: '#searchbox',
		  getCurrentState: getCurrentStateBound
	}));
	
	Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
	    id: 'currentsearch',
	    target: '#currentsearch'
	  })); 
	
	Manager.addWidget(new AjaxSolr.PagerWidget({
	    id: 'pager',
	    target: '#pager',
	    prevLabel: '&lt;',
	    nextLabel: '&gt;',
	    innerWindow: 1,
	    renderHeader: function (perPage, offset, total) {
	      $('#pager-header').html($('<span></span>').text(' displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total));
	    }
	  }));
	
	Manager.addWidget(new AjaxSolr.ViewPickerWidget({
	    id: 'viewpicker',
	    target: '#viewpicker'
	  })); 
	
	Manager.addWidget(new AjaxSolr.SorterWidget({
	    id: 'sorter',
	    target: '#sorter'
	  })); 
	
	Manager.addWidget(new AjaxSolr.CategoryWidget({
	    id: 'category',
	    target: '#category',
	    field: 'category',
	    multivalue:false,	    
	    categoryList: {"all":lang.getLabel('category_all'), "samlingercollectionspace":lang.getLabel('category_artwork'), "nyheder":lang.getLabel('category_news'), "kalender":lang.getLabel('category_calendar'), "artikel":lang.getLabel('category_article'),  "praktisk":lang.getLabel('category_info')},
	    activeCategory: "all"
	  }));	
		
	Manager.addWidget(new AjaxSolr.TeasersWidget({
	    id: 'teasers',
	    target: '#smk_teasers'
	  }));
	
	for (var i = 0, l = tagcloudFields.length; i < l; i++) {
	  Manager.addWidget(new AjaxSolr.SearchFiltersWidget({
	    id: tagcloudFields[i].field,
	    title: tagcloudFields[i].title,
	    target: '#' + tagcloudFields[i].field,
	        field: tagcloudFields[i].field
	      }));
	};				
	
	//* Detail and Thumbs widgets are tightly coupled
	Manager.addWidget(new AjaxSolr.DetailWidget({
	      id: 'details',
	      target: '#smk_detail',
	      thumbnails_target:'#thumbnails' 
	 }));
	Manager.addWidget(new AjaxSolr.ThumbsWidget({
	      id: 'thumbs',
	      target: '#thumbnails'
	 }));	
	
	Manager.addWidget(new AjaxSolr.RelatedWidget({
	    id: 'related',
	    target: '#related-artworks'
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
    for (var i = 0, l = tagcloudFields.length; i < l; i++) {
    	$(Manager.widgets[tagcloudFields[i].field]).on('smk_search_filter_changed', function(event){
    		Manager.widgets['currentsearch'].setRefresh(false);
    	});
  	};
  	
    //* pager changed
    $(Manager.widgets['pager']).on('smk_search_pager_changed', function(event){     	
    	Manager.widgets['currentsearch'].setRefresh(false);
		Manager.widgets['category'].setRefresh(false);
		for (var i = 0, l = tagcloudFields.length; i < l; i++) {
	    	Manager.widgets[tagcloudFields[i].field].setRefresh(false);
	  	};	
    }); 

    //* sorter changed
    $(Manager.widgets['sorter']).on('smk_search_sorter_changed', function(event){     	
    	Manager.widgets['currentsearch'].setRefresh(false);
		Manager.widgets['category'].setRefresh(false);
		for (var i = 0, l = tagcloudFields.length; i < l; i++) {
	    	Manager.widgets[tagcloudFields[i].field].setRefresh(false);
	  	};	
    }); 
  	
    //* calls to detail view
    $(Manager.widgets['teasers']).on('smk_search_call_detail', function(event){     	
    	Manager.widgets['state_manager'].viewChanged({view:"detail"});
    	Manager.widgets['details'].call_detail(event.detail_id, true);    	
    });	 
    $(Manager.widgets['related']).on('smk_search_call_detail', function(event){     	
    	Manager.widgets['state_manager'].viewChanged({view:"detail"});
    	Manager.widgets['details'].call_detail(event.detail_id, false);
    });	
    $(Manager.widgets['thumbs']).on('smk_search_call_detail', function(event){     	    	
    	Manager.widgets['state_manager'].viewChanged({view:"detail"});
    	Manager.widgets['details'].call_detail(event.detail_id, false);
    });
    
    //* calls to teasers view
    $(Manager.widgets['details']).on('smk_search_call_teasers', function(event){     	
    	Manager.widgets['state_manager'].viewChanged({view:"teasers"});    	
    	Manager.widgets['thumbs'].current_selec = null;
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
    for (var i = 0, l = tagcloudFields.length; i < l; i++) {
    	$(Manager.widgets[tagcloudFields[i].field]).on('smk_search_filter_loaded', function(event){
    		Manager.widgets['state_manager'].remove_modal_loading_from_widget(event.currentTarget.target);
    	});
  	};	
    
    //* a new image has finished loading in "teaser"
    $(Manager.widgets['teasers']).on('smk_teasers_this_img_loaded', function(event){     	            	
    	$(Manager.widgets['teasers'].target).find('#teaser-container-grid').masonry('layout');
    	
    	//* check if there are still images loading in "teaser"
    	if ($(Manager.widgets['teasers'].target).find('.image_loading').length == 0){
    		
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
		// stop the modal "waiting image" for this widget
		Manager.widgets['state_manager'].remove_modal_loading_from_widget(Manager.widgets['details'].target);   	   	 	       	  		      	
    });
    
    //* a new search on a word has been added in search box
    $(Manager.widgets['searchbox']).on('smk_search_fq_added', function(event){     	
    	Manager.widgets['currentsearch'].add_fq(event.value, event.text );    	
    });	
        
    //* init all widgets
    Manager.init();

    //* prepare and start init request
    Manager.store.addByValue('q', '-(id_s:(*/*) AND category:samlingercollectionspace) -(id_s:(*verso) AND category:samlingercollectionspace) -(id_s:(ORIG*) AND category:samlingercollectionspace) -(id_s:(EKS*) AND category:samlingercollectionspace)');    
    var params = {
      facet: true,
      'facet.field': ['artist_name_ss', 'artist_natio', 'object_production_century_earliest', 'object_type', 'category'],      
      //'f.prod_technique.facet.mincount': 20,
      'facet.limit': -1,
      'facet.mincount': 1,
      'rows':12,
      'json.nl': 'map'
    };
    for (var name in params) {
      Manager.store.addByValue(name, params[name]);
    }
    Manager.doRequest();  
    
  });

})(jQuery);
