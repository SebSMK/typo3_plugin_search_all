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
		var template = Mustache.getTemplate('pi1/templates/search_box.html');	
		$(this.target).html(template);
	},	
	
	
	afterRequest : function() {
		
		var self = this;
		
		if (!self.getRefresh()){
			self.setRefresh(true);
			return;
		}	 		  
	  
		$(this.target).find('input#search.typeahead').val('');
		
		$(this.target).find('form').bind(
				'submit',
				{
					mmgr : self.manager,
					$input : $(this.target).find('input#search.typeahead'),
					caller : self
					//,mdf : this.displayFields
				},
				function(e) {
					e.preventDefault();
					e.stopImmediatePropagation(); 
					
					var mgr = e.data.mmgr;	
					var val = e.data.$input.val();
					var caller = e.data.caller;
					
					if (val != '') {
						var value = jQuery.trim(val);
						//if (mgr.store.last != value) {
							mgr.store.last = value;
							//if (mgr.store.addByValue('q', 'id:(' + value + '*)^2 -(id:(*/*) AND category:samlingercollectionspace) -(id:(*verso) AND category:samlingercollectionspace) page_content:(' + value + '*) page_title:(' + value + '*)^1.5 title_dk:(' + value + '*)^1.5 artist_name:(' + value + '*)^1.5 ')){
							var fq_value = 'id:(' + value + '*)^2 page_content:(*' + value + '*) page_title:(*' + value + '*)^1.5 title_dk:(*' + value + '*)^1.5 title_first:(*' + value + '*)^1.5 artist_name:(*' + value + '*)^1.5 ';														
							
							// check the current view
							if (caller.getCurrentState() != null && caller.getCurrentState()["view"] !== undefined && caller.getCurrentState()["view"] == 'detail'){
								// if in "detail" view...								

								//...call previous search request
								mgr.store.load(true); 
								
								// ...remove all previous fq
								mgr.store.remove('fq');
								
								// ...send event back to "teaser" view
								$(caller).trigger({
									type: "smk_search_call_teasers",
									value: fq_value,
									text: value
								});								
							}

							if (mgr.store.addByValue('fq', fq_value, {}, value)){
								//mgr.store.addByValue('fl', e.data.mdf);																					
								$(caller).trigger({
									type: "smk_search_fq_added",
									value: fq_value,
									text: value
								  });  		
								mgr.doRequest(0);								
							}														
						//}
					};// end if
				}); // end binded action.

		if (undefined === self.manager.store.last
				|| self.manager.store.last.length < 1)
			return;
		if (!self.hightlight)
			return;
		var vArray = self.manager.store.last.split(" ");
		jQuery('#smk_teasers .teaser__content').highlight(vArray);
		
	}
	
});

})(jQuery);