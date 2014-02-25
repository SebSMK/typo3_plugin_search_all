(function ($) {

AjaxSolr.ViewPickerWidget = AjaxSolr.AbstractWidget.extend({	  
  
 	init: function () {
    
	  var self = this;

	  var $target = $(this.target);	
	  
	  //var template = Mustache.getTemplate('pi1/templates/view_picker.html');	
	  
	  var html = self.template_integration_json({'tip_text_grid':this.manager.translator.getLabel('viewpicker_tip_grid'), 'tip_text_list':this.manager.translator.getLabel('viewpicker_tip_list')}, '#viewpickerTemplate');
	  $target.html(html);	  
	  
	  $target.find('.tooltip').tooltipster();
	  
	  $target.find('form input:radio').bind(
				'change',
				{
					$this : $(this)
				},
				function(e) {
					e.preventDefault();
					e.data.$this.find('label').removeAttr( 'data-tip' );
					e.data.$this.trigger({
						type: "view_picker",
						value:$(this).val()
					 });					
				});
	  
	  
//	  $target.mouseout(function() {
//		$target.find('label').removeAttr( 'data-tip' );
//	  });

  },
  
  template_integration_json: function (json_data, templ_id){	  
		var template = this.template; 	
		var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
		return html;
  },
  
});

})(jQuery);
