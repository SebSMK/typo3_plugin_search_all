(function ($) {

AjaxSolr.ViewPickerWidget = AjaxSolr.AbstractWidget.extend({	  
  
 	init: function () {
    
	  var self = this;

	  var $target = $(this.target);	
	  
	  var template = Mustache.getTemplate('pi1/templates/view_picker.html');	
	  $target.html(template);	  
	  
	  $target.find('form input:radio').bind(
				'change',
				{
					$this : $(this)
				},
				function(e) {
					e.preventDefault();
					e.data.$this.trigger({
						type: "view_picker",
						value:$(this).val()
					 });					
				});

  }
  
});

})(jQuery);
