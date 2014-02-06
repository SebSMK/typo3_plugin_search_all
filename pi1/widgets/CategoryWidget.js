(function ($) {

AjaxSolr.CategoryWidget = AjaxSolr.AbstractFacetWidget.extend({

	 constructor: function (attributes) {
		    AjaxSolr.CategoryWidget.__super__.constructor.apply(this, arguments);
		    AjaxSolr.extend(this, {
		    	categoryList: {},
		    	activeCategory: ""
		    }, attributes);
	 },

	
  init: function () {
        this.manager.store.add('facet.field', new AjaxSolr.Parameter({ name:'facet.field', value: this.field, locals: { ex:this.field } }));
        
        //* init template
        var objectedItems = new Array(); 

        $.each(this.categoryList , function(key, value) { 
        	 objectedItems.push({"facetname": key, "facettext": value, "count": '0', "active": false}); 
        });
        
        //* add "all" facet
        objectedItems.unshift({"facetname": "all", "facettext" : "Alle", "count": '0', "active": true});
          
        var html = this.template_integration_json(objectedItems, 'pi1/templates/category.html');
        $(this.target).html(html);
	},	         

  afterRequest: function () {
	var self = this;  
	var $target = $(this.target);
	
    //* active tab
    $(this.target).find('li').removeClass('tab--active');
    $(this.target).find('li[name='+self.activeCategory+']').addClass('tab--active');
	
	if (!self.getRefresh()){
		self.setRefresh(true);
		return;
	}	 		  

    var maxCount = 0;
    var allCount = 0;
    var objectedItems = new Array();        

    //* reset facet count
    $.each(self.categoryList , function(key, value) { 
    	$target.find('li[name='+key+'] span').text('(0)'); 
   });
   
    //* proceed facets count
    for (var facet in self.manager.response.facet_counts.facet_fields[self.field]) {
      var count = parseInt(self.manager.response.facet_counts.facet_fields[self.field][facet]);
      allCount = allCount + count;
      if (count > maxCount) {
        maxCount = count;
      };
      
      $(this.target).find('li[name='+facet+'] span').text(sprintf('(%s)', count));                  
    }
    
    //* add "all" facet count
    $(this.target).find('li[name=all] span').text(sprintf('(%s)', allCount));
        
    //* add click handling
    $target.find("li").click(self.clickHandler());
        
  },   
  
  template_integration_json: function (data, templ_path){	  
	var template = Mustache.getTemplate(templ_path);	
	var json_data = {"categories": data};
	var html = Mustache.to_html($(template).find('#categoryItemsTemplate').html(), json_data);
	return html;
  },
  
  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully adds a
   *   filter query with the given value.
   */
  clickHandler: function () {
    var self = this, meth = this.multivalue ? 'add' : 'set';
    return function (event) {      
      event.stopImmediatePropagation();
      var selectedTab = $(event.currentTarget).attr("name");	
	  if (self[meth].call(self, selectedTab)) {  
		self.setActiveTab(selectedTab);  
		$(self).trigger({
			type: "smk_search_category_changed",
			category: selectedTab
		});  
	    self.doRequest();
	  }
	  return false;
    }
  },
  
  setActiveTab: function (tab){
	  this.activeCategory = tab;
	  
//	  switch(this.activeCategory){
//		  case "samlingercollectionspace":		 			  			  				  
//			  this.setRefresh(false);
//			  break;
//		  case "nyheder":
//		  case "kalender":
//		  case "artikel":
//		  case "praktisk":
//		  case "all":
//			  this.setRefresh(true);
//		  	  break;
//		  default:	
//			  this.setRefresh(true);
//		  	  break;		  
//	  }	  
  },
  
  /**
   * Sets the filter query.
  *
  * @returns {Boolean} Whether the selection changed.
  */
 set: function (value) {
     return this.changeSelection(function () {
     	var a = this.manager.store.removeByValue('fq', new RegExp('^-?' + this.field + ':')),
         b = value == 'all' ? true : this.manager.store.add('fq', new AjaxSolr.Parameter({ name: 'fq', value: this.fq(value), locals: { tag:this.field } }));
     return a || b;
   });
 },

 /**
  * Adds a filter query.
  *
  * @returns {Boolean} Whether a filter query was added.
  */
	add: function (value) {
		return this.changeSelection(function () {
			return this.manager.store.add('fq', new AjaxSolr.Parameter({ name: 'fq', value: this.fq(value), locals: { tag:this.field } }));
		});
	}, 
  
});

})(jQuery);
