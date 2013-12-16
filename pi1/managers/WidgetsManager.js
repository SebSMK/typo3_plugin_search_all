var Manager;

(function ($) {

  $(function () {
    Manager = new AjaxSolr.smkManager({
    	solrUrl: 'http://csdev-seb:8180/solr-example/SMK_All/',
    	store: new AjaxSolr.smkParameterStore({
    		exposed: ["fq", "q", "start", "limit"]
    	})    	
    });

//** load widgets    
    Manager.addWidget(new AjaxSolr.BaseTemplateLoader({
        id: 'template_smk_collection',
        target: '#search_wrapper'
      }));
//    Manager.addWidget(new AjaxSolr.ResultWidget({
//      id: 'result_list_smk_collection',
//      target: '#docs_smk_collection',
//      target_detail: '#docs_smk_collection_detail'
//    }));
    Manager.addWidget(new AjaxSolr.ResultListWidget({
        id: 'result_list_smk_collection',
        target: '#docs_smk_collection'
      }));
      Manager.addWidget(new AjaxSolr.ResultDetailWidget({
          id: 'result_detail_smk_collection',
          target: '#docs_smk_collection_detail',
          isWidgetVisible: false          
        })); 
    Manager.addWidget(new AjaxSolr.PagerWidget({
        id: 'pager',
        target: '#pager',
        prevLabel: '&lt;',
        nextLabel: '&gt;',
        innerWindow: 1,
        renderHeader: function (perPage, offset, total) {
          $('#pager-header').html($('<span></span>').text('displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total));
        }
      }));
    var fields = [ 'artist_natio', 'object_production_century_earliest', 'prod_technique' ];
    for (var i = 0, l = fields.length; i < l; i++) {
      Manager.addWidget(new AjaxSolr.TagcloudWidget({
        id: fields[i],
        target: '#' + fields[i],
        field: fields[i],
        isWidgetVisible: false
      }));
    };    
    
  Manager.addWidget(new AjaxSolr.CategoryWidget({
    id: 'category',
    target: '#category',
    field: 'category',
    multivalue:false
  }));

	Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
	    id: 'currentsearch',
	    target: '#selection'
	  }));
	Manager.addWidget(new AjaxSolr.GridListViewSwitchWidget({
	    id: 'gridlistviewswitch',
	    target: '#switch_smk_collection'
	  }));   
	Manager.addWidget(new AjaxSolr.AutocompleteWidget({
	    id: 'text_artist',
	    target: '#search_smk_collection',
	    fields: [ 'artist_name_s'],
        isWidgetVisible: false
	  }));    
	
	Manager.addWidget(new AjaxSolr.AutocompleteTitleWidget({
	    id: 'text_title',
	    target: '#search_smk_collection_title',
	    fields: [ 'title_dk_s'],
        isWidgetVisible: false
	  }));
	
	Manager.addWidget(new AjaxSolr.FreeTextWidget({
		  id: 'text_free',
		  target: '#search_free'
	}));

	//** add event listeners
   
	///* switch grid/list in results view
	$(Manager.widgets['gridlistviewswitch']).on('smk_search_gridview', {caller:'smk_search_gridview'}, function(event){ 
   	 Manager.widgets['result_list_smk_collection'].switch_list_grid(event);
   });    
   $(Manager.widgets['gridlistviewswitch']).on('smk_search_listview', {caller:'smk_search_listview'}, function(event){ 
   	Manager.widgets['result_list_smk_collection'].switch_list_grid(event);
   }); 
    
   //* click on category
    $(Manager.widgets['category']).on('smk_search_category_changed', function(event){ 
    	Manager.stateChanged({category:event.category});
    });        
    $(Manager.widgets['currentsearch']).on('smk_search_category_removed', function(event){ 
    	Manager.stateChanged({category:''});
    });
    
    //* switch between detail/results view
    $(Manager.widgets['result_list_smk_collection']).on('smk_search_call_result_detail', function(event){ 
    	Manager.stateChanged({view:"detail"});
    	Manager.widgets['result_detail_smk_collection'].call_detail(event.detail_id);
    });	    
    $(Manager.widgets['result_detail_smk_collection']).on('smk_search_call_result_list', function(event){ 
    	Manager.stateChanged({view:"list"});
    	Manager.widgets['result_list_smk_collection'].call_previous_search();
    });	
	
    Manager.init();
    Manager.store.addByValue('q', '*:*');
    
    var params = {
      facet: true,
      'facet.field': [ 'artist_natio', 'object_production_century_earliest', 'prod_technique', 'category'],
      'f.prod_technique.facet.limit': -1,
      'f.prod_technique.facet.mincount': 20,
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
