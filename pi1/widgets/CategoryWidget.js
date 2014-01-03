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
	},	         

  afterRequest: function () {
	var self = this;  
	var $target = $(this.target);
	
	if ($target.is(':hidden'))
	 	return;
	
	$target.empty();
	  
    if (self.manager.response.facet_counts.facet_fields[this.field] === undefined) {
    	$target.html('no items found in current selection');
      return;
    }

    var maxCount = 0;
    var allCount = 0;
    var objectedItems = new Array();        

    //* proceed facets
    for (var facet in self.manager.response.facet_counts.facet_fields[self.field]) {
      var count = parseInt(self.manager.response.facet_counts.facet_fields[self.field][facet]);
      allCount = allCount + count;
      if (count > maxCount) {
        maxCount = count;
      }
      objectedItems.push({ "facetname": facet, "facettext": self.categoryList[facet], "count": count, "active": facet == self.activeCategory});
    }
    
    //* add "all" facet
    objectedItems.unshift({"facetname": "all", "facettext" : "Alle", "count": allCount, "active": "all" == self.activeCategory});

    //* merge data and template
    var html = self.template_integration_json(objectedItems, 'pi1/templates/category.html');
    $target.html(html);
    
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
