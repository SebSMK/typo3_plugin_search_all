(function ($) {

AjaxSolr.CategoryWidget = AjaxSolr.AbstractFacetWidget.extend({
  afterRequest: function () {
    if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
      $(this.target).html('no items found in current selection');
      return;
    }

    var maxCount = 0;
    var objectedItems = [{facet: "all", count:this.manager.response.response.numFound}];
    for (var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
      var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
      if (count > maxCount) {
        maxCount = count;
      }
      objectedItems.push({ facet: facet, count: count });
    }
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
    
    var typefacet = {"all": "All", "samlingercollectionspace":"Samlinger", "nyheder":"Nyheder", "kalender":"Kalender", "artikel":"Artikler", "highlights":"Highlights", "praktisk":"Your visit"};

    for (var i = 0, l = objectedItems.length; i < l; i++) {
	      var facet = null; 

	      
    	  facet = typefacet[objectedItems[i].facet] +' (' + objectedItems[i].count +')';
	      
    	  //facet = objectedItems[i].facet.charAt(0).toUpperCase() + objectedItems[i].facet.slice(1) +' (' + objectedItems[i].count +')'; 

	      var facetclick = objectedItems[i].facet;

    	  $(this.target).find(".filter-menu").append('<li id="' + i +'-filters" class="menu-item"></li>');
    	  $(this.target).find("#" + i +"-filters").append(
    		        $('<a href="#" class="category_item"></a>')
    		        .text(facet)        
    		        .click(this.clickHandler(facetclick))
    		      );  
    }       
    
  }
	

});

})(jQuery);
