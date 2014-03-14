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
	  
	  var template = Mustache.getTemplate('pi1/templates/general_template.html');
	  	  	  
	  $.address.strict(false);
	  /*
	   * Management of changes in address bar
	   * n.b.: externalChange is triggered also on document load
	   * */
	  $( document ).ready(function() {				  
		  
		  $.address.externalChange(function(e){	 
			  			    
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
			    		self.manager.widgets['details'].set_call_default_on_return(true);
			    		self.manager.widgets['thumbs'].setCurrent_selec(null);	
			    	}
			    }else if(params.category == undefined){
			    	self.categoryChanged({'category': "all"});
			    }
			    
			    //* process Solr request
				
				// reset exposed parameters
			    self.manager.store.exposedReset();
			    
			    // q param
			    var q = [self.manager.store.q_default];										
				if(params.q !== undefined)
					q = q.concat(params.q.split(self.manager.store._q_separator));
				self.manager.store.addByValue('q', q);
				
			    // fq param
				if(params.fq !== undefined && AjaxSolr.isArray(params.fq)){
					for (var i = 0, l = params.fq.length; i < l; i++) {						
						self.manager.store.addByValue('fq', params.fq[i].value, params.fq[i].locals);
				   	};											
				};												
				
				// qf param
				if(params.view != "detail")
					self.manager.store.addByValue('qf', self.manager.store.get_qf_string());					    		
												
				// start param
				if(params.start !== undefined){
					self.manager.store.addByValue('start', params.start);
				}else{
					self.manager.store.addByValue('start', 0);
				}
								
				
				//* process widgets
				// remove all previous search filters
			    for (var i = 0, l = self.manager.searchfilterList.length; i < l; i++) {			  		  
			    	self.manager.widgets[self.manager.searchfilterList[i].field].removeAllSelectedFilters(false);
			    };
			    if (params.category == 'samlingercollectionspace' && params.fq !== undefined){
	    			// add selected filters in searchFiltersWidget
	    			for (var i = 0, l = params.fq.length; i < l; i++) {
	    				var field = params.fq[i].value !== undefined ? params.fq[i].value.split(':')[0] : '';
	    				
	    				if (self.manager.widgets[field] !== undefined && self.manager.widgets[field].addSelectedFilter !== undefined)
	    					self.manager.widgets[field].addSelectedFilter(params.fq[i].value.split(':')[1]);			    				
	    			}			    			
	    		}
				
			   	// copy "q" values in Currentsearch widget	
				var q_wout_q_def = self.manager.store.extract_q_from_manager().split(self.manager.store._q_separator);
			   	
				self.manager.widgets['currentsearch'].removeAllCurrentSearch();					
				for (var i = 0, l = q_wout_q_def.length; i < l; i++) {
			   		self.manager.widgets['currentsearch'].add_q(q_wout_q_def[i], q_wout_q_def[i] );
			   	};				   					   	
			   					   	
			   	//**> start Solr request 
			   	self.manager.doRequest();
				   	
//				}else{					
//					// no request, trigger default request in default view
//					$(self).trigger({
//						type: "smk_search_call_default_view",
//						isDefault: true
//					});						
//				};															   	 
		  });
	  });
	  	  
	  $target.empty();	  
	  $target.append(template);	
	  
	  this.viewChanged(this.currentState);
	  this.categoryChanged(this.currentState);
  },
  
  /**
   * search filter  added / removed (only in "search in collection" view)
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
		this.manager.widgets['currentsearch'].setRefresh(false);
		 var fqvalue = this.manager.store.extract_fq_from_manager();
		 var qvalue = this.manager.store.extract_q_from_manager();
		 UniqueURL.setUniqueURL([
		                     {'key': 'q', 'value': qvalue},
		                     {'key': 'fq', 'value': fqvalue},
			                 {'key': 'view', 'value': this.getCurrentState()["view"]},
			                 {'key': 'category', 'value': this.getCurrentState()["category"]}
			                 ]);
		this.manager.doRequest();
	}
  },
  
  
  /**
   * current page changed
   * */
  smk_search_pager_changed: function (start, searchFieldsTypes){
		this.manager.widgets['currentsearch'].setRefresh(false);
		this.manager.widgets['category'].setRefresh(false);
		for (var i = 0, l = searchFieldsTypes.length; i < l; i++) {
			this.manager.widgets[searchFieldsTypes[i].field].setRefresh(false);
		};
		
		this.manager.store.get('start').val(start);
		
		 var fqvalue = this.manager.store.extract_fq_from_manager();
		 var qvalue = this.manager.store.extract_q_from_manager();
		 UniqueURL.setUniqueURL([
		                     {'key': 'q', 'value': qvalue},
		                     {'key': 'fq', 'value': fqvalue},
		                   {'key': 'start', 'value': start}, 
		                   {'key': 'view', 'value': this.getCurrentState()["view"]},
		                   {'key': 'category', 'value': this.getCurrentState()["category"]}
		                   ]);
				
		this.manager.doRequest();
  },

  
  /**
   * search string removed in Currentsearch
   * */
  smk_search_remove_one_search_string: function(event){
  	
	  var facet = event.facet;
	  var current_q = event.current_q;	  	  
  	
	  if (this.manager.store.removeElementFrom_q(facet)) {   
	  	$(this.manager.widgets['currentsearch'].target).empty();
	
	  	for (var i = 0, l = current_q.length; i < l; i++) {	 
			if (current_q[i].value == facet){
				current_q.splice(i, 1);
				this.manager.widgets['currentsearch'].set_q(current_q);
				break;
			}    	    	
	  	}    	
	};
  	
	 var fqvalue = this.manager.store.extract_fq_from_manager();
	 var qvalue = this.manager.store.extract_q_from_manager();
	 UniqueURL.setUniqueURL([
	                     {'key': 'q', 'value': qvalue},
	                     {'key': 'fq', 'value': fqvalue},
	                   {'key': 'view', 'value': this.getCurrentState()["view"]},
	                   {'key': 'category', 'value': this.getCurrentState()["category"]}
	                   ]);
  	
	this.manager.doRequest();    	    	
  },  
  
  
/**
 * a search string has been added in SearchBox
 * */
  smk_search_q_added: function(event){
  	
	var val = event.val;
		
	if (val != '') {
		var text = jQuery.trim(val);
		
		this.manager.store.last = text;																																										
		
		var fq_value = text;
		var teaser_view = false;
		
		//* check the current view...
		if (this.getCurrentState() != null && this.getCurrentState()["view"] !== undefined && this.getCurrentState()["view"] == 'detail'){
			//...if in "detail" view...								
			
			//...call previous search request..
			this.manager.store.load(true); 
			
			// ...remove all previous q...
			this.manager.store.remove('q');
			
			// ...add default q...
			this.manager.store.addByValue('q', this.manager.store.q_default);
				
			teaser_view = true;
		}
		
		//* concat the new search term to the previous term(s)
		var current_q = this.manager.store.get('q');
		var current_q_values = new Array();							
		
		if (AjaxSolr.isArray(current_q.value)){
			for (var i = 0, l = current_q.value.length; i < l; i++) {
				current_q_values.push(current_q.value[i]);								 
			}
		}else if(typeof current_q.value === 'string'){
			current_q_values.push(current_q.value);
		};
		
		//* send request
		if (this.manager.store.addByValue('q', current_q_values.concat(fq_value))){																												
			
			if (typeof _gaq !== undefined)
	    		_gaq.push(['_trackEvent','Search', 'Regular search', fq_value, 0, true]);
			
			if (teaser_view){
		  	    // call to teasers view from searchbox when in "detail" view    	         	
			    	this.viewChanged({view:"teasers"});
			    	this.categoryChanged({category:"all"}); 	
			    	this.manager.widgets['currentsearch'].removeAllCurrentSearch();    	    	
			    	this.manager.widgets['thumbs'].setCurrent_selec(null);	    	    		
		  	}
		  	
		  	this.manager.widgets['currentsearch'].add_q(fq_value, text );  
		  	  	
			 var fqvalue = this.manager.store.extract_fq_from_manager();
			 var qvalue = this.manager.store.extract_q_from_manager();
			 UniqueURL.setUniqueURL([
			                     {'key': 'q', 'value': qvalue},
			                     {'key': 'fq', 'value': fqvalue},
			                   {'key': 'view', 'value': this.getCurrentState()["view"]},
			                   {'key': 'category', 'value': this.getCurrentState()["category"]}
			                   ]);
		  	
		  	this.manager.doRequest(0);  	
			
		};
	};
 },
  
  
/**
 * Detail view call
 * */  
  
  smk_search_call_detail: function(event){
	var detail_view_intern_call = event.detail_view_intern_call;
	var save_current_request = event.save_current_request;    	
	var call_default_on_return = event.call_default_on_return;  
	var art_id = event.detail_id;		  
	
	if (!detail_view_intern_call)
		this.manager.widgets['state_manager'].viewChanged({view:"detail"});
	else
		this.manager.widgets['state_manager'].empty_detail_view();			

	if (call_default_on_return)
		this.manager.widgets['details'].set_call_default_on_return(true);    	    	
	
	if(save_current_request) //* save current solr parameters		  
		this.manager.store.save();      		  	
			  
	//* delete current (exposed) solr parameters
	this.manager.store.exposedReset();
	  
	var param = new AjaxSolr.Parameter({name: "q", value: 'id:"' + art_id +'"'}); 
	this.manager.store.add(param.name, param);	     
		
	UniqueURL.setUniqueURL([
	                   {'key': 'q', 'value': art_id},
	                   {'key': 'view', 'value': this.getCurrentState()["view"]}
	                   ]);
  	
	this.manager.doRequest();  
  },
  
/**
 * Category changed
 * */
  smk_search_category_changed: function(event){
	  
	  var category = event.category;
	  var view = event.view;
	  var caller = this.manager.widgets['category'];	  	  	  
	  
	  if (caller.set(category)){   
		  caller.setActiveTab(category);
		  this.categoryChanged({'category': category});
		  
		  if (view !== undefined)
			  this.viewChanged({'view': 'teasers'});
		  
		  this.manager.widgets['currentsearch'].setRefresh(false);

		  var fqvalue = this.manager.store.extract_fq_from_manager();
		  var qvalue = this.manager.store.extract_q_from_manager(); //this.manager.store.exposedString();
		  UniqueURL.setUniqueURL([
		                     {'key': 'q', 'value': qvalue},
		                     {'key': 'fq', 'value': fqvalue},
			                 {'key': 'view', 'value': this.getCurrentState()["view"]},
			                 {'key': 'category', 'value': this.getCurrentState()["category"]}
			                 ]);
		  	
		  this.manager.doRequest();
	  };	  
  },
  
  
  beforeRequest: function(){	 
	  
	  this.start_modal_loading(this.target);
	  
	  //* start loading mode for some choosen widgets  
	  // teasers
	  this.add_modal_loading_to_widget(this.manager.widgets['teasers']);
	  // searchfilters
	  for (var i = 0, l = this.manager.searchfilterList.length; i < l; i++) {		  	
		  this.add_modal_loading_to_widget(this.manager.widgets[this.manager.searchfilterList[i].field]);
	  };
	  // details
	  this.add_modal_loading_to_widget(this.manager.widgets['details']);	 
	  // related
	  this.add_modal_loading_to_widget(this.manager.widgets['related']);
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
		  }			  
	  }
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
  
  
//  search_filter_start_loading: function(target){
//	  $(target).addClass('filter_loading');	  
//  },
//  
//  search_filter_stop_loading: function(target){
//	  $(target).removeClass('filter_loading');	  
//  },
  
  viewChanged: function (stateChange) {        	    
    var $target = $(this.target);
    var self = this;
    var newstate = this.getNewState(stateChange);
    
    if (newstate["view"] === undefined)
    	return;
    
    switch(newstate["view"]){
	  case "teasers":		  
		  $target.find("#thumbnails").empty().hide();
		  $target.find("#smk_detail").empty().hide();		  		  		  		 
		  
		  this.manager.widgets['related'].removeAllArticles();
		  $target.find("#related-artworks").hide();		  
		  
		  self.showWidget($target.find("#currentsearch"));
		  self.showWidget($target.find("#category"));
		  self.showWidget($target.find("#viewpicker"));
		  self.showWidget($(this.manager.widgets['sorter'].target));
		  self.showWidget($target.find("#pager"));
		  self.showWidget($target.find("#pager-header"));
		  self.showWidget($(this.manager.widgets['teasers'].target));
		  
		  
//		  $target.find("#currentsearch").show().children().show();//		  		  
//		  $target.find("#category").show().children().show();	
//		  $target.find("#viewpicker").show().children().show();
//		  $target.find("#pager").show().children().show();
//		  $target.find("#pager-header").show().children().show();			  
//		  $(this.manager.widgets['teasers'].target).show().children().not('.modal').show();
		  
		  switch(newstate["category"]){
			  case "samlingercollectionspace":		 			  			  			  
				  self.showWidget($target.find("#search-filters"));
				  //$target.find("#search-filters").show().children().show();					  			  			  
				  break;	
			  default:		    			  			   							  
			  	  $target.find("#search-filters").hide();		  	 		  	  
			  	  break;		  
		  }
		  
		  break;
		  
	  case "detail":	
		  $target.find("#currentsearch").hide();
		  $target.find("#category").hide();
		  $target.find("#viewpicker").hide();
		  $(this.manager.widgets['sorter'].target).hide();	
		  $target.find("#pager").hide();
		  $target.find("#pager-header").hide();
		  
		  $target.find("#search-filters").hide();
		  $(this.manager.widgets['teasers'].target).hide();		
		  
		  self.showWidget($target.find("#smk_detail"));
		  self.showWidget($target.find("#thumbnails"));
		  
		  self.showWidget($(this.manager.widgets['related'].target));
		  $(this.manager.widgets['related'].target).find('h3.heading--l').hide(); // we don't want to see the title of "relatedwidget" now (only after "afterrequest")
		  
		  
//		  $target.find("#smk_detail").show().children().show();
//		  $target.find("#thumbnails").show().children().show();
//		  $target.find("#related-artworks").show().children().show();
		  
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
  
	    this.manager.widgets['teasers'].removeAllArticles();
	    
		switch(newstate["category"]){
			  case "samlingercollectionspace":		 			  			  				  
				  this.showWidget($target.find("#search-filters"));
				  //$target.find("#search-filters").show().children().show();		
				  $(this.manager.widgets['teasers'].target).find('#teaser-container-grid').removeClass('full-width').hide();
				  this.manager.widgets['category'].setActiveTab(newstate["category"]);
				  
				  break;
			  case "nyheder":
			  case "kalender":
			  case "artikel":
			  case "praktisk":
			  case "all":
				  $target.find("#search-filters").hide();
			  	  $(this.manager.widgets['teasers'].target).find('#teaser-container-grid').addClass('full-width').hide();
			  	  this.manager.widgets['category'].setActiveTab(newstate["category"]);
			  	  
			  	  // remove all search filters
			  	  for (var i = 0, l = this.manager.searchfilterList.length; i < l; i++) {			  		  
					  this.manager.widgets[this.manager.searchfilterList[i].field].removeAllSelectedFilters(true);
				  };
			  	  
			  	  break;
			  default:		    			  			   							  
			  	  $target.find("#search-filters").hide();
			  	  $(this.manager.widgets['teasers'].target).find('#teaser-container-grid').addClass('full-width').hide();
			  	  this.manager.widgets['category'].setActiveTab("all");
			  	  break;		  
		}
  
		if($(this.manager.widgets['teasers'].target).find('#teaser-container-grid .teaser--grid').length > 0){
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
		
		$(this.manager.widgets['teasers'].target).show().children().not('.modal').show();
		  
		if($(this.manager.widgets['teasers'].target).find('#teaser-container-grid .teaser--grid').length > 0)
			  $(this.manager.widgets['teasers'].target).find('#teaser-container-grid').masonry('layout');
			  		
	    return;
	  },
  
	  
  showWidget: function($target){
	  $target.show().children().not('.modal').show();	  	  
  },
  
  empty_detail_view: function(){		  
	  //empty related widget
	  $(this.manager.widgets['related'].target).find('h3.heading--l').hide(); // we don't want to see the title of "relatedwidget" now (only after "afterrequest")	  
	  this.manager.widgets['related'].removeAllArticles();	  
	  //empty detail widget
	  $(this.manager.widgets['detail']).empty();	  	  
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
	  $(this.target).empty().html(sprintf('%s &nbsp;&nbsp; returned:&nbsp;&nbsp; %s<br>Please contact website administrator.', this.manager.solrUrl, e)); 
  }

});

})(jQuery);
