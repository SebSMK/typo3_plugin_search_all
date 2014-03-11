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
	  	  
	  $( document ).ready(function() {
		// init unique url manager - jquery address
		  
		  $.address.strict(false);
		  /*
		   * Management of changes in address bar
		   * n.b.: triggered also on document load
		   * */
		  $.address.externalChange(function(e){	 
			  
			    var urlManager = new UniqueURL.constructor(e.value);
			    var params = urlManager.getParams();			    			    
			    
				if(params.req !== undefined){
					
					// load Solr request in the manager
					self.manager.store.load_req(params.req, true);
				   	 
				   	// copy "q" values in Currentsearch widget
					var q_all = self.manager.store.get('q').value.slice();
				   	var q_wout_q_def = smkCommon.removeA(q_all, self.manager.store.q_default);				   	
				   	self.manager.widgets['currentsearch'].removeAllCurrentSearch(); 
				   	for (var i = 0, l = q_wout_q_def.length; i < l; i++) {
				   		self.manager.widgets['currentsearch'].add_q(q_wout_q_def[i], q_wout_q_def[i] );
				   	};
				   					   	
				   	// start Solr request 
				   	self.manager.doRequest();
				   	
				}else{					
					// no request, trigger default request in default view
					$(self).trigger({
							type: "smk_search_call_default_view",
							isDefault: true
					});						
				};															   	 
		  });
	  });
	  	  
	  $target.empty();	  
	  $target.append(template);	
	  
	  this.viewChanged(this.currentState);
	  this.categoryChanged(this.currentState);
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
  	
	var qvalue = this.manager.store.exposedString();
	this.setUniqueURL([{'key': 'req', 'value': qvalue}, {'key': 'view', 'value': this.getCurrentState()["view"]}]);
  	
	this.manager.doRequest();    	    	
  },  
  
  
/**
 * search string added in SearchBox
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
		
		if (Object.prototype.toString.call( current_q.value ) === '[object Array]'){
			for (var i = 0, l = current_q.value.length; i < l; i++) {
				current_q_values.push(current_q.value[i]);								 
			}
		}else if(typeof current_q.value === 'string'){
			current_q_values.push(current_q.value);
		};
		
		//* send call to request
		if (this.manager.store.addByValue('q', current_q_values.concat(fq_value))){																												
			
			if (teaser_view){
		  	    // call to teasers view from searchbox when in "detail" view    	         	
			    	this.viewChanged({view:"teasers"});
			    	this.categoryChanged({category:"all"});
			    	//this.setUniqueURL({});    	
			    	this.manager.widgets['currentsearch'].removeAllCurrentSearch();    	    	
			    	this.manager.widgets['thumbs'].current_selec = null;	    	    		
		  	}
		  	
		  	this.manager.widgets['currentsearch'].add_q(fq_value, text );  
		  	  	
			var qvalue = this.manager.store.exposedString();
		  	this.setUniqueURL([{'key': 'req', 'value': qvalue}, {'key': 'view', 'value': this.getCurrentState()["view"]}]);
		  	
		  	this.manager.doRequest(0);  	
			
		};
	};
 },
  
  
/**
 * Detail view call management
 * */  
  
  smk_search_call_detail: function(event){
	var detail_view_intern_call = event.detail_view_intern_call;
	var save_current_request = event.save_current_request;    	
	var call_default_on_return = event.call_default_on_return;  
	var art_id = event.detail_id;
	var qvalue = AjaxSolr.isArray(this.manager.store.get('q').value) ? this.manager.store.get('q').value.join(';-;') : this.manager.store.get('q').value;	  
	
	if (!detail_view_intern_call)
		this.manager.widgets['state_manager'].viewChanged({view:"detail"});
	else
		this.manager.widgets['state_manager'].empty_detail_view();
			
	//this.manager.widgets['state_manager'].setUniqueURL({'key':'id', 'value': event.detail_id});

	if (call_default_on_return)
		this.manager.widgets['details'].set_call_default_on_return();    	    	
	
	if(save_current_request) //* save current solr parameters		  
		this.manager.store.save();      		  	
			  
	//* delete current (exposed) solr parameters
	this.manager.store.exposedReset();
	  
	var param = new AjaxSolr.Parameter({name: "q", value: 'id_s:"' + art_id +'"'}); 
	this.manager.store.add(param.name, param);	     
	
	var qvalue = this.manager.store.exposedString();
	this.setUniqueURL([{'key': 'req', 'value': qvalue}, {'key': 'view', 'value': this.getCurrentState()["view"]}]);
  	
	this.manager.doRequest();  
  },
  
/**
 * Tab change call management
 * */
  smk_search_category_changed: function(event){
	  
	  var category = event.category;
	  var view = event.view;
	  var caller = this.manager.widgets['category'];
	  var qvalue = AjaxSolr.isArray(this.manager.store.get('q').value) ? this.manager.store.get('q').value :  this.manager.store.get('q').value.join(';-;');	  	  
	  
	  if (caller.set(category)){   
		  caller.setActiveTab(category);
		  this.categoryChanged({'category': category});
		  
		  if (view !== undefined)
			  this.viewChanged({'view': 'teasers'});
		  
		  this.manager.widgets['currentsearch'].setRefresh(false);
		  //this.setUniqueURL({'key': 'category', 'value': category});
		  
//			var tmp = this.manager.store.get('q').value;
//			var qvalue = AjaxSolr.isArray(tmp) ? tmp.join(';-;') : tmp;	 
		  var qvalue = this.manager.store.exposedString();
		  this.setUniqueURL([{'key': 'req', 'value': qvalue}, {'key': 'view', 'value': this.getCurrentState()["view"]}]);
		  	
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
   * unique URL management
   */
  setUniqueURL: function(json){	    	  

	  var uniqueURL = "";
      
	  for (var i = 0, l = json.length; i < l; i++) {
		  
	      switch(json[i].key){
//		  case "id":
//		  case "category": 
		  case "req":
			  uniqueURL = sprintf('%s=%s', json[i].key, json[i].value);
			  break;
		  case "view":
			  uniqueURL = sprintf('%s&&%s=%s', uniqueURL, json[i].key, json[i].value);
			  break;
	      }		  
	  } 	  
      
	  //* set unique url	
      $.address.value(uniqueURL);		

  },
  
//  addToUniqueURL: function(json){	    	  
//
//	  var uniqueURL = '';
//	  var previous = $.address.value() == '' ? $.address.value() : sprintf('%s&', $.address.value()); 
//      
//      switch(json.key){
//		  case "id":
//		  case "category": 
//		  case "req": 
//			  uniqueURL = sprintf('%s%s=%s', previous, json.key, json.value);
//			  break;
//      }
//      
//	  //* set unique url	
//      $.address.value(uniqueURL);		
//
//  },
  
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
					  this.manager.widgets[this.manager.searchfilterList[i].field].removeAllSelectedFilters();
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
