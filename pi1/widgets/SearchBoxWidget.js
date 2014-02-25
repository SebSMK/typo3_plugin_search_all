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
//		var template = Mustache.getTemplate('pi1/templates/search_box.html');	
//		//$(template).find('#search').attr("placeholder", this.manager.translator.getLabel("search_box_default"));
//		$(this.target).html(template);
//		$(this.target).find('#search').attr("placeholder", this.manager.translator.getLabel("search_box_default"));
				
		  var self = this;
		  var $target = $(this.target);		  
		  var json_data = {"default_text" : this.manager.translator.getLabel("search_box_default"), 'search': this.manager.translator.getLabel("search_box_button")};	 
		  var html = self.template_integration_json(json_data, '#searchboxTemplate');
		  
		  $target.html(html);		
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
							//var fq_value = 'id:(' + value + '*)^2 page_content:(*' + value + '*) page_title:(*' + value + '*)^1.5 title_dk:(*' + value + '*)^1.5 title_first:(*' + value + '*)^1.5 artist_name:(*' + value + '*)^1.5 ';														
							var fq_value = value;
							
							//* check the current view...
							if (caller.getCurrentState() != null && caller.getCurrentState()["view"] !== undefined && caller.getCurrentState()["view"] == 'detail'){
								//...if in "detail" view...								

								//...call previous search request..
								mgr.store.load(true); 
								
								// ...remove all previous q...
								mgr.store.remove('q');

								// ...add default q...
								mgr.store.addByValue('q', mgr.store.q_default);
								
								// ...remove all previous sort...
								//mgr.store.remove('sort');
								
								// ...send a call to "teaser" view
								$(caller).trigger({
									type: "smk_search_box_from_detail_call_teasers",
									value: fq_value,
									text: value
								});								
							}
							
							//* concat the new search term to the previous term(s)
							var current_q = mgr.store.get('q');
							var current_q_values = new Array();							
							
							if (Object.prototype.toString.call( current_q.value ) === '[object Array]'){
								for (var i = 0, l = current_q.value.length; i < l; i++) {
									current_q_values.push(current_q.value[i]);								 
								}
							}else if(typeof current_q.value === 'string'){
								current_q_values.push(current_q.value);
							};

							//* do request
							if (mgr.store.addByValue('q', current_q_values.concat(fq_value))){							
								//mgr.store.addByValue('fl', e.data.mdf);																					
								$(caller).trigger({
									type: "smk_search_q_added",
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
		jQuery('#smk_teasers .article_artwork').highlight(vArray);
		
	},  

    template_integration_json: function (json_data, templ_id){	  
		var template = this.template; 	
		var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
		return html;
	}
	
});

})(jQuery);