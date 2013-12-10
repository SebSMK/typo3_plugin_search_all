(function ($) {
AjaxSolr.FreeTextWidget = AjaxSolr.AbstractTextWidget.extend({
	
	//hightlight : true,
	//displayFields : [ 'title', 'content', 'url' ],
	afterRequest : function() {

		$(this.target).find('input').bind(
				'keydown',
				{
					mmgr : this.manager,
					thisplugin : this
					//,mdf : this.displayFields
				},
				function(e) {
					var mgr = e.data.mmgr;
					var thisplugin = e.data.thisplugin;
					
					if (e.which == 13 && $(this).val()) {
						var value = jQuery.trim($(this).val());
						if (mgr.store.last != value) {
							mgr.store.last = value;
							mgr.store.addByValue('q', 
									'page_content:(' + value + '*) page_title:(' + value + '*)^1.5 title_dk:(' + value + '*)^1.5 artist_name:(' + value + '*)^1.5 ');
							//mgr.store.addByValue('fl', e.data.mdf);
							
							//* send event: refresh count result
							$(thisplugin).trigger({
									type: "smk_search_refresh_count_results"
							});
							
							mgr.doRequest(0);
						}
					}// end if
				}); // end binded action.

		if (undefined === this.manager.store.last
				|| this.manager.store.last.length < 1)
			return;
		if (!this.hightlight)
			return;
		var vArray = this.manager.store.last.split(" ");
		//jQuery('#docs').highlight(vArray);
		
	}
	
	
});

})(jQuery);