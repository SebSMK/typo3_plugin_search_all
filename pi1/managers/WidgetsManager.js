var Manager;

(function ($) {

  $(function () {
    Manager = new AjaxSolr.smkManager({
    	solrUrl: 'http://csdev-seb:8180/solr-example/SMK_All_v2/',
    	store: new AjaxSolr.smkParameterStore({
    		exposed: ["fq", "q", "start", "limit"]
    	})    	
    });

	//** load widgets    
	Manager.addWidget(new AjaxSolr.StateManager({
	    id: 'state_manager',
	    target: '#smk_search_wrapper',
	    currentState: {view:'teasers', category:''}
	}));
	
	Manager.addWidget(new AjaxSolr.CategoryWidget({
	    id: 'category',
	    target: '#category',
	    field: 'category',
	    multivalue:false,
	    categoryList: {"samlingercollectionspace":"Samlinger", "nyheder":"Nyheder", "kalender":"Kalender", "artikel":"Artikler", "highlights":"Highlights", "praktisk":"Praktisk info"},
	    activeCategory: "all"
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
	
	Manager.addWidget(new AjaxSolr.TeasersWidget({
	    id: 'teasers',
	    target: '#smk_teasers'
	  }));
	
	Manager.addWidget(new AjaxSolr.SearchBoxWidget({
		  id: 'searchbox',
		  target: '#searchbox'
	}));
	
	var tagcloudFields = [ {field:'artist_name_ss', title:'Artists'}, {field:'artist_natio', title:'Countries'}, {field:'object_production_century_earliest', title:'Periods'}, {field:'prod_technique', title:'Techniques'} ];
	for (var i = 0, l = tagcloudFields.length; i < l; i++) {
	  Manager.addWidget(new AjaxSolr.SearchFiltersWidget({
	    id: tagcloudFields[i].field,
	    title: tagcloudFields[i].title,
	    target: '#' + tagcloudFields[i].field,
	        field: tagcloudFields[i].field
	      }));
	};		
		
//	Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
//	    id: 'currentsearch',
//	    target: '#selection'
//	  })); 
	
	Manager.addWidget(new AjaxSolr.DetailWidget({
	      id: 'details',
	      target: '#smk_detail'
	    }));

	Manager.addWidget(new AjaxSolr.RelatedWidget({
	    id: 'related',
	    target: '#related-artworks'
	  }));
//	Manager.addWidget(new AjaxSolr.AutocompleteWidget({
//	    id: 'text_artist',
//	    target: '#search_smk_collection',
//	    fields: [ 'artist_name_ss'],
//	    isWidgetVisible: false
//	  }));    
//	Manager.addWidget(new AjaxSolr.AutocompleteTitleWidget({
//	    id: 'text_title',
//	    target: '#search_smk_collection_title',
//	    fields: [ 'title_dk_ss'],
//	    isWidgetVisible: false
//	  }));


	//** add event listeners
   
	///* switch grid/list in teasers view
	$(Manager.widgets['viewpicker']).on('view_picker', function(event){ 
   	 Manager.widgets['teasers'].switch_list_grid(event.value);
   });    
//   $(Manager.widgets['gridlistviewswitch']).on('smk_search_listview', {caller:'smk_search_listview'}, function(event){ 
//   	Manager.widgets['teasers_smk_collection'].switch_list_grid(event);
//   }); 
    
   //* switch between categories
    $(Manager.widgets['category']).on('smk_search_category_changed', function(event){     	
    	Manager.widgets['state_manager'].stateChanged({category:event.category});
    });        
//    $(Manager.widgets['currentsearch']).on('smk_search_category_removed', function(event){     	
//    	Manager.widgets['state_manager_smk_collection'].stateChanged({category:''});
//    });
    
    //* switch between teasers/detail view
    $(Manager.widgets['teasers']).on('smk_search_call_detail', function(event){     	
    	Manager.widgets['state_manager'].stateChanged({view:"detail"});
    	Manager.widgets['details'].call_detail(event.detail_id);
    });	 
    $(Manager.widgets['related']).on('smk_search_call_detail', function(event){     	
    	Manager.widgets['state_manager'].stateChanged({view:"detail"});
    	Manager.widgets['details'].call_detail(event.detail_id);
    });	
    $(Manager.widgets['details']).on('smk_search_call_teasers', function(event){     	
    	Manager.widgets['state_manager'].stateChanged({view:"teasers"});
    	Manager.widgets['teasers'].call_previous_search();
    });	
	
    //* a new image has finished loading in "teaser"
    $(Manager.widgets['teasers']).on('smk_teasers_all_img_loaded', function(event){     	        
    	//Executes when complete page is fully loaded, including all frames, objects
        // and images. This ensures that Masonry knows about elements heights and can
        // do its layouting properly.
//    	$(Manager.widgets['teasers_smk_collection'].target).find('#teaser-container-grid').masonry( {
//          transitionDuration: 0
//        });
    	
    	$(Manager.widgets['teasers'].target).find('#teaser-container-grid').masonry('layout');
    });
    
  //* a new image has finished loading in "related"
    $(Manager.widgets['related']).on('smk_related_all_img_loaded', function(event){     	        
    	//Executes when complete page is fully loaded, including all frames, objects
        // and images. This ensures that Masonry knows about elements heights and can
        // do its layouting properly.
//    	$(Manager.widgets['teasers_smk_collection'].target).find('#teaser-container-grid').masonry( {
//          transitionDuration: 0
//        });
    	
    	$(Manager.widgets['related'].target).find('#related-container-grid').masonry('layout');
    });
    
    
    Manager.init();
    Manager.store.addByValue('q', '-(id:(*/*) AND category:samlingercollectionspace) -(id:(*verso) AND category:samlingercollectionspace)');
    
    var params = {
      facet: true,
      'facet.field': ['artist_name_ss', 'artist_natio', 'object_production_century_earliest', 'prod_technique', 'category'],
      'f.prod_technique.facet.limit': -1,
      //'f.prod_technique.facet.mincount': 20,
      'facet.limit': -1,
      'facet.mincount': 1,
      'json.nl': 'map'
    };
    for (var name in params) {
      Manager.store.addByValue(name, params[name]);
    }
    Manager.doRequest();    
  });

})(jQuery);
