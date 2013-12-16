(function ($) {

AjaxSolr.BaseTemplateLoader = AjaxSolr.AbstractWidget.extend({
	
	beforeRequest: function () {
	  var self = this;
	  var $target = $(this.target);	  	
	  var rootsite = $.cookie("smk_search_all_plugin_dir_base"); // "rootsite" value is pasted to cookie in class.tx_smksearchall_pi1.php	 
	  var url = rootsite.concat('pi1/templates/template_list.html');	  
	  var template = Mustache.getTemplate(url);
	  
	  $target.empty();	  
	  $target.append(template);
	  
  }

});

})(jQuery);
