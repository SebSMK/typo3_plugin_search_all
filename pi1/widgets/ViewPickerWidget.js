(function ($) {

AjaxSolr.ViewPickerWidget = AjaxSolr.AbstractWidget.extend({	  
  
 	init: function () {
    
	  var self = this;

	  var $target = $(this.target);	
	  
	  //var template = Mustache.getTemplate('pi1/templates/view_picker.html');	
	  
	  var html = self.template_integration_json({'tip_text':this.manager.translator.getLabel('viewpicker_tip')}, 'pi1/templates/view_picker.html');
	  $target.html(html);	  
	  
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

  template_integration_json: function (data, templ_path){	  
		var template = Mustache.getTemplate(templ_path);	
		var json_data =	data;
		var html = Mustache.to_html($(template).find('#viewpickerTemplate').html(), json_data);
		return html;
  },
  
});

})(jQuery);
