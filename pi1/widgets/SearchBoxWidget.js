(function ($) {
AjaxSolr.SearchBoxWidget = AjaxSolr.AbstractTextWidget.extend({

	 constructor: function (attributes) {
	    AjaxSolr.AbstractTextWidget.__super__.constructor.apply(this, arguments);
	    AjaxSolr.extend(this, {
	      getCurrentState:null
	    }, attributes);
	  },		  	
	
	hightlight : true,
	
	init: function () {						
		  var self = this;
		  var $target = $(this.target);		  
		  var json_data = {"default_text" : this.manager.translator.getLabel("search_box_default"), 'search': this.manager.translator.getLabel("search_box_button")};	 
		  var html = self.template_integration_json(json_data, '#searchboxTemplate');		  
		  //* remove MOC's searchbox
		  $("#search").hide();
		  $target.html(html);		
	},	
	
	
	afterRequest : function() {
		
		var self = this;
		
		if (!self.getRefresh()){
			self.setRefresh(true);
			return;
		}	 		  
	  
		$(this.target).find('input#smk_search.typeahead').val('');
		
		$(this.target).find('form').bind(
				'submit',
				{
					mmgr : self.manager,
					$input : $(this.target).find('input#smk_search.typeahead'),
					caller : self
				},
				function(e) {
					e.preventDefault();
					e.stopImmediatePropagation(); 
					
					var val = e.data.$input.val();
					var caller = e.data.caller;
					
					$(caller).trigger({
						type: "smk_search_q_added",
						val: val
					});		
					
				}); // end binded action.
		
	},  

    template_integration_json: function (json_data, templ_id){	  
		var template = this.template; 	
		var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
		return html;
	}
	
});

})(jQuery);