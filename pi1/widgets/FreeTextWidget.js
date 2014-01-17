(function ($) {
AjaxSolr.FreeTextWidget = AjaxSolr.AbstractTextWidget.extend({
	
	hightlight : true,
	
	init: function () {		
		var template = Mustache.getTemplate('pi1/templates/search_box.html');	
		$(this.target).html(template);
	},	
	
	
	afterRequest : function() {

		if ($(this.target).is(':hidden'))
		  	return;	
		$(this.target).find('input#search.typeahead').val('');
		
		$(this.target).find('form').bind(
				'submit',
				{
					mmgr : this.manager,
					$input : $(this.target).find('input#search.typeahead')
					//,mdf : this.displayFields
				},
				function(e) {
					e.preventDefault();
					e.stopImmediatePropagation(); 
					
					var mgr = e.data.mmgr;	
					var val = e.data.$input.val();
					
					if (val != '') {
						var value = jQuery.trim(val);
						//if (mgr.store.last != value) {
							mgr.store.last = value;
							if (mgr.store.addByValue('q', 'page_content:(' + value + '*) page_title:(' + value + '*)^1.5 title_dk:(' + value + '*)^1.5 artist_name:(' + value + '*)^1.5 ')){
								//mgr.store.addByValue('fl', e.data.mdf);																					
								mgr.doRequest(0);								
							}
						//}
					}// end if
				}); // end binded action.

		if (undefined === this.manager.store.last
				|| this.manager.store.last.length < 1)
			return;
		if (!this.hightlight)
			return;
		var vArray = this.manager.store.last.split(" ");
		jQuery('#smk_teasers .teaser__content').highlight(vArray);
		
	}
	
});

})(jQuery);