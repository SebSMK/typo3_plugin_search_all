(function ($) {

AjaxSolr.CategoryWidget = AjaxSolr.AbstractFacetWidget.extend({
  
	
	
	init: function () {
        this.manager.store.add('facet.field', new AjaxSolr.Parameter({ name:'facet.field', value: this.field, locals: { ex:this.field } }));
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

	
  afterRequest: function () {
    if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
      $(this.target).html('no items found in current selection');
      return;
    }

    var maxCount = 0;
    var allCount = 0;
    var objectedItems = new Array();    
    
    for (var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
      var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
      allCount = allCount + count;
      if (count > maxCount) {
        maxCount = count;
      }
      objectedItems.push({ facet: facet, count: count });
    }
    
    objectedItems.unshift({facet: "all", count:allCount});
    
    objectedItems.sort(function (a, b) {
      return a.facet < b.facet ? -1 : 1;
    });

    $(this.target).empty();
    
    $(this.target).append($('<div class="filter-topbar"></div>'));
    $(this.target).find(".filter-topbar").append($('<ul class="filter-menu"></ul>'));

//    $(this.target).find(".filter-menu").append('<li id="all-filters" class="menu-item first"></li>');
//	  $(this.target).find("#all-filters").append(
//		        $('<a href="#" class="category_item"></a>')
//		        .text("All")        
//		        .click(this.clickHandler("all"))
//		      );  
    
    var typefacet = {"all": "Alle", "samlingercollectionspace":"Samlinger", "nyheder":"Nyheder", "kalender":"Kalender", "artikel":"Artikler", "highlights":"Highlights", "praktisk":"Praktisk info"};

    for (var i = 0, l = objectedItems.length; i < l; i++) {
	      var facet = null; 

	      var category_name = typefacet[objectedItems[i].facet];
    	  facet = typefacet[objectedItems[i].facet] +' (' + objectedItems[i].count +')';
	      
    	  //facet = objectedItems[i].facet.charAt(0).toUpperCase() + objectedItems[i].facet.slice(1) +' (' + objectedItems[i].count +')'; 

	      var facetclick = objectedItems[i].facet;

    	  $(this.target).find(".filter-menu").append('<li id="' + i +'-filters" class="menu-item"></li>');
    	  $(this.target).find("#" + i +"-filters").append(
    		        $('<a href="#" class="category_item"></a>')
    		        .text(facet)        
    		        .click(this.clickHandler(facetclick, category_name))    		        		    		        		
    		      );  
    }       
    
  },
  
  /**
   * @param {String} value The value.
   * @returns {Function} Sends a request to Solr if it successfully adds a
   *   filter query with the given value.
   */
  clickHandler: function (value, category_name) {
    var self = this, meth = this.multivalue ? 'add' : 'set';
    return function () {
      if (self[meth].call(self, value)) {
    	$(self).trigger({
			type: "smk_search_category_changed",
			category: category_name
		  });  
        self.doRequest();
      }
      return false;
    }
  }
	

});

})(jQuery);
