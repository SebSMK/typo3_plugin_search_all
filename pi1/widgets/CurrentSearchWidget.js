(function ($) {

AjaxSolr.CurrentSearchWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,

  afterRequest: function () {
	  
	  if ($(this.target).is(':hidden'))
		  	return;	
	  
	var self = this;
    var links = [];

//    var q = this.manager.store.get('q').val();
//    if (q != '*:*') {
//      links.push($('<a href="#"></a>').text('(x) ' + q).click(function () {
//    	  self.manager.store.remove('q');
//    	  self.manager.store.get('q').val('*:*');
//        self.doRequest();
//        return false;
//      }));
//    }

    var fq = this.manager.store.values('fq');
    for (var i = 0, l = fq.length; i < l; i++) {
      //links.push($('<a href="#"></a>').text('(x) ' + fq[i]).click(self.removeFacet(fq[i])));
    	if (fq[i].text === undefined){
    		links.push({"fq": fq[i].value});
    	}else{
    		links.push({"fq": fq[i].value, "label":fq[i].text});
    	}
    	
    }

//    if (links.length > 1) {
//      links.unshift($('<a href="#"></a>').text('Remove all').click(function () {
//        self.manager.store.get('q').val('*:*');
//        self.manager.store.remove('fq');
//        $(self).trigger({
//			type: "smk_search_category_removed"			
//		  });  
//        self.doRequest();
//        return false;
//      }));
//    }

    var $target = $(this.target);
    $target.empty();
    
    if (links.length) {                  
      var html = this.template_integration_json(links, 'pi1/templates/current.html');
      $(this.target).html(html);
      $(this.target).find('a').click(self.removeFacet());            
    }
  },

  removeFacet: function () {
    var self = this;
    return function (event) {
      var facet = $(this).attr('fq');    	
      if (self.manager.store.removeByValue('fq', facet)) {   
    	$(self.target).empty();
        self.doRequest();
      }
      return false;
    };
  },
  
  template_integration_json: function (data, templ_path){	  
		var template = Mustache.getTemplate(templ_path);	
		var json_data = {"current": data};
		var html = Mustache.to_html($(template).find('#currentItemsTemplate').html(), json_data);
		return html;
  }
});

})(jQuery);
