(function ($) {

AjaxSolr.CurrentSearchWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,

  afterRequest: function () {
    var self = this;
    var links = [];

    var q = this.manager.store.get('q').val();
    if (q != '*:*') {
      links.push($('<a href="#"></a>').text('(x) ' + q).click({search_text: q}, function (event) {
        self.manager.store.get('q').val('*:*');
	    //ררררררר
	  	if (event.data.search_text.indexOf("artist") != -1 || event.data.search_text.indexOf("title") != 1)    		
      	  window.refresh_numresultstotal = true;  
  	  //ררררררר
        
        self.doRequest();
        return false;
      }));
    }

    var fq = this.manager.store.values('fq');
    for (var i = 0, l = fq.length; i < l; i++) {
      links.push($('<a href="#"></a>').text('(x) ' + fq[i]).click(self.removeFacet(fq[i])));
    }

    if (links.length > 1) {
      links.unshift($('<a href="#"></a>').text('Remove all').click(function () {
        self.manager.store.get('q').val('*:*');
        self.manager.store.remove('fq');
        //ררררררר
  	  	window.refresh_numresultstotal = true;  
  	  	//ררררררר
        self.doRequest();
        return false;
      }));
    }

    if (links.length) {
      var $target = $(this.target);
      $target.empty();
      for (var i = 0, l = links.length; i < l; i++) {
        $target.append($('<li></li>').append(links[i]));
      }
    }
    else {
      $(this.target).html('<li>Viewing all documents!</li>');
    }
  },

  removeFacet: function (facet) {
    var self = this;
    return function () {
      if (self.manager.store.removeByValue('fq', facet)) {
    	  //ררררררר
    	  if (facet.indexOf("artist") != -1 || facet.indexOf("title") != 1)    		
        	  window.refresh_numresultstotal = true;  
    	  //ררררררר
    	  
    	  self.doRequest();
      }
      return false;
    };
  }
});

})(jQuery);
