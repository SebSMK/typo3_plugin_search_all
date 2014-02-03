var Manager;

(function ($) {

  $(function () {
	  
	var tagcloudFields = [ {field:'artist_name_ss', title:'Kunstner'}, {field:'artist_natio', title:'Land'}, {field:'object_production_century_earliest', title:'Periode'}, {field:'object_type', title:'Teknik'} ];
	  
    Manager = new AjaxSolr.smkManager({
    	solrUrl: 'http://csdev-seb:8180/solr-example/SMK_All_v4/',
    	store: new AjaxSolr.smkParameterStore({
    		exposed: ["fq", "q", "start", "limit"]
    	}),
    	searchfilterList: tagcloudFields
    });

	//** load widgets    
	Manager.addWidget(new AjaxSolr.StateManager({
	    id: 'state_manager',
	    target: '#smk_search_wrapper',
	    currentState: {view:'teasers', category:''}
	}));
	  
	Manager.addWidget(new AjaxSolr.SearchBoxWidget({
		  id: 'searchbox',
		  target: '#searchbox'
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
	
	Manager.addWidget(new AjaxSolr.CategoryWidget({
	    id: 'category',
	    target: '#category',
	    field: 'category',
	    multivalue:false,
	    categoryList: {"samlingercollectionspace":"V&aelig;rker", "nyheder":"Nyheder", "kalender":"Kalender", "artikel":"Artikler",  "praktisk":"Praktisk info"},
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
//   $(Manager.widgets['gridlistviewswitch']).on('smk_search_listview', {caller:'smk_search_listview'}, function(event){ 
//   	Manager.widgets['teasers_smk_collection'].switch_list_grid(event);
//   }); 
    
	//* switch between categories
    $(Manager.widgets['category']).on('smk_search_category_changed', function(event){     	
    	Manager.widgets['state_manager'].categoryChanged({category:event.category});
    });        
    
//    //* call to "all" categories
//    $(Manager.widgets['currentsearch']).on('smk_search_category_removed', function(event){     	
//    	Manager.widgets['state_manager'].categoryChanged({category:''});
//    });
    
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
    	Manager.widgets['teasers'].call_previous_search();
    });	
	
    //* searchfilters has finished loading
    for (var i = 0, l = tagcloudFields.length; i < l; i++) {
    	$(Manager.widgets[tagcloudFields[i].field]).on('smk_search_filter_loaded', function(event){
    		Manager.widgets['state_manager'].stop_modal_loading(event.currentTarget.target);
    	});
  	};	
    
    //* a new image has finished loading in "teaser"
    $(Manager.widgets['teasers']).on('smk_teasers_this_img_loaded', function(event){     	        
    	//Executes when complete page is fully loaded, including all frames, objects
        // and images. This ensures that Masonry knows about elements heights and can
        // do its layouting properly.
//    	$(Manager.widgets['teasers_smk_collection'].target).find('#teaser-container-grid').masonry( {
//          transitionDuration: 0
//        });
    	
    	$(Manager.widgets['teasers'].target).find('#teaser-container-grid').masonry('layout');
    	
    	//* check if there are still images loading 
    	if ($(Manager.widgets['teasers'].target).find('.image_loading').length == 0){
    		
    		// if all images are loaded, we stop the modal "waiting image"
    		Manager.widgets['state_manager'].stop_modal_loading(Manager.widgets['teasers'].target);
   	   	 	
    		// if in list view mode, align images
      	  	if ($(Manager.widgets['teasers'].target).find('.teaser--list').length > 0)
      	  		Manager.widgets['teasers'].verticalAlign();       	  	
    	}    		  
	    
    });
    
    //* a new image has finished loading in "related"
    $(Manager.widgets['related']).on('smk_related_this_img_loaded', function(event){     	        
    	//Executes when complete page is fully loaded, including all frames, objects
        // and images. This ensures that Masonry knows about elements heights and can
        // do its layouting properly.
//    	$(Manager.widgets['teasers_smk_collection'].target).find('#teaser-container-grid').masonry( {
//          transitionDuration: 0
//        });
    	
    	$(Manager.widgets['related'].target).find('#teaser-container-grid').masonry('layout');  
    	
    	//* check if there are still images loading 
    	if ($('.image_loading').length == 0){    		
    		// if all images are loaded, we stop the modal "waiting image"
    		Manager.widgets['state_manager'].stop_modal_loading(Manager.widgets['related'].target);   	   	 	       	  	
    	}    		
    	
    });
    
    //* detail image has finished loading in "detail"
    $(Manager.widgets['details']).on('smk_detail_this_img_loaded', function(event){     	        
    	//* check if there are still images loading 
    	if ($('.image_loading').length == 0){    		
    		// if all images are loaded, we stop the modal "waiting image"
    		Manager.widgets['state_manager'].stop_modal_loading(Manager.widgets['details'].target);   	   	 	       	  	
    	}      	
    });
    
    //* a new search on a word has been added in search box
    $(Manager.widgets['searchbox']).on('smk_search_fq_added', function(event){     	
    	Manager.widgets['currentsearch'].add_fq(event.value, event.text );    	
    });	
        
    //* init all widgets
    Manager.init();

    //* prepare and start init request
    Manager.store.addByValue('q', '-(id:(*/*) AND category:samlingercollectionspace) -(id:(*verso) AND category:samlingercollectionspace) -(id:(ORIG*) AND category:samlingercollectionspace) -(id:(EKS*) AND category:samlingercollectionspace)');    
    var params = {
      facet: true,
      'facet.field': ['artist_name_ss', 'artist_natio', 'object_production_century_earliest', 'object_type', 'category'],
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
