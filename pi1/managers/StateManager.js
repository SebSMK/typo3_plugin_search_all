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
	  
	  $target.empty();	  
	  $target.append(template);	
	  
	  this.viewChanged(this.currentState);
	  this.categoryChanged(this.currentState);
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
    
    if (newstate["view"] === undefined && newstate["category"] === undefined )
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
  }

});

})(jQuery);
