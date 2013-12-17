(function ($) {
AjaxSolr.FreeTextWidget = AjaxSolr.AbstractTextWidget.extend({
	
	hightlight : true,
	//displayFields : [ 'title', 'content', 'url' ],
	afterRequest : function() {

		if ($(this.target).is(':hidden'))
		  	return;	
		$(this.target).find('input').val('');
		$(this.target).find('input').bind(
				'keydown',
				{
					mmgr : this.manager
					//,mdf : this.displayFields
				},
				function(e) {
					var mgr = e.data.mmgr;					
					
					if (e.which == 13 && $(this).val()) {
						var value = jQuery.trim($(this).val());
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
		jQuery('#docs_smk_collection').highlight(vArray);
		
	}
	
});

})(jQuery);