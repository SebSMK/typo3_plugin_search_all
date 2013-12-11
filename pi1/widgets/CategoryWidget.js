(function ($) {

AjaxSolr.CategoryWidget = AjaxSolr.AbstractFacetWidget.extend({
  
	
	
	init: function () {
        this.manager.store.add('facet.field', new AjaxSolr.Parameter({ name:'facet.field', value: this.field, locals: { ex:this.field } }));
	},
	
//	 /**
//     * Add facet parameters to the parameter store.
//     */	
//	initStore: function () {
//        /* http://wiki.apache.org/solr/SimpleFacetParameters */
//        var parameters = [
//          'facet.prefix',
//          'facet.sort',
//          'facet.limit',
//          'facet.offset',
//          'facet.mincount',
//          'facet.missing',
//          'facet.method',
//          'facet.enum.cache.minDf'
//        ];
//
//        this.manager.store.addByValue('facet', true);
//
//        if (this['facet.field'] !== undefined) {
//                this.manager.store.add('facet.field', new AjaxSolr.Parameter({ name: 'facet.field', value: this.field, locals:{ ex: this.field } }));
//        }
//        else if (this['facet.date'] !== undefined) {
//          this.manager.store.addByValue('facet.date', this.field);
//          parameters = parameters.concat([
//            'facet.date.start',
//            'facet.date.end',
//            'facet.date.gap',
//            'facet.date.hardend',
//            'facet.date.other',
//            'facet.date.include'
//          ]);
//        }
//        else if (this['facet.range'] !== undefined) {
//          this.manager.store.addByValue('facet.range', this.field);
//          parameters = parameters.concat([
//            'facet.range.start',
//            'facet.range.end',
//            'facet.range.gap',
//            'facet.range.hardend',
//            'facet.range.other',
//            'facet.range.include'
//          ]);
//        }
//
//        for (var i = 0, l = parameters.length; i < l; i++) {
//          if (this[parameters[i]] !== undefined) {
//            this.manager.store.addByValue('f.' + this.field + '.' + parameters[i], this[parameters[i]]);
//          }
//        }
//      },
	
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
//            	
//            	
//          	  if (value != "all"){
////	                  var indices = this.manager.store.find('fq', new RegExp('^-?' + this.field + ':'));
////	                  if (indices) {
////	                    this.manager.store.params['fq'][indices[0]] = new AjaxSolr.Parameter({ name: 'fq', value: this.manager.store.params['fq'][indices[0]].val() + ' OR ' + this.fq(value), locals: { tag:this.field } });
////	                    return true;
////	                  }
////	                  else {
////	                	this.manager.store.remove('fq');
////	                    return this.manager.store.add('fq', new AjaxSolr.Parameter({ name: 'fq', value: this.fq(value), locals: { tag:this.field } }));
////	                  }
////	                  
//	                  this.manager.store.remove('fq');
//	                  return this.manager.store.add('fq', new AjaxSolr.Parameter({ name: 'fq', value: this.fq(value), locals: { tag:this.field } }));
//            		}
//            else{          	  
//          	  this.manager.store.remove('fq');   
//          	  return true;
////          	  var not_fqstring = 'NOT ' + this.fq("nyheder") + ' NOT ' + this.fq("kunstdatabase") + ' NOT ' + this.fq("kalender") + ' NOT ' + this.fq("highlights") + ' NOT ' + this.fq("praktisk");                	  
////          	  return this.manager.store.add('fq', new AjaxSolr.Parameter({ name: 'fq', value: not_fqstring, locals: { tag:this.field } }));                	  
//            }
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

//    /**
//     * Removes a filter query.
//     *
//     * @returns {Boolean} Whether a filter query was removed.
//     */
//    remove: function (value, field) {
//          var self = this;
//      return this.changeSelection(function () {
//              for (var i = 0, l = this.manager.store.params['fq'].length; i < l; i++) { 
//              		var mySplitResult = this.manager.store.params['fq'][i].value.split(" OR ");
//                      var count = mySplitResult.length;
//                      for(var j = 0; j < mySplitResult.length; j++){
//                              var v = field + ":" + value;
//                              if (value.match(" ") != null && mySplitResult[j].localeCompare(v) != 0 && mySplitResult[j].split(":")[0].localeCompare(field)===0) {
//                                      value = '"' + value + '"';
//                              }
//                              v = field + ":" + value;
//                          if (mySplitResult[j].localeCompare(v) == 0) {
//                                  mySplitResult.splice(j,1);
//                                  var str = mySplitResult.join(" OR ");
//                                  if (count > 1) {
//                                          this.manager.store.params['fq'][i].value = str;
//                                  } else {
//                                          this.manager.store.params['fq'].splice(i,1);
//                                  }
//                                      return true;
//                              }
//                      }
//              }
//              return false;
//      });
//    },
    
	
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
