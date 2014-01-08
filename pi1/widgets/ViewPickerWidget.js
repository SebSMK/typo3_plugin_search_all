(function ($) {

AjaxSolr.ViewPickerWidget = AjaxSolr.AbstractWidget.extend({	  
  
  afterRequest: function () {
    
	  if ($(this.target).is(':hidden'))
		  	return;	
	  
	  var self = this;

	  var $target = $(this.target);
	  $target.empty();
	  
	  var template = Mustache.getTemplate('pi1/templates/view_picker.html');	
	  $target.html(template);
	  
	  $(this.target).find('form').bind(
				'submit',
				{
					$this : $(this)
				},
				function(e) {
					e.preventDefault();
					$(this).trigger({
						type: "smk_search_listview"
					 });
					
				});
	  
	  $target.find('#listview_a').click($.proxy(function( event ) {
		  event.preventDefault();
		  if (self.switch_list_grid(event)){		  
			  $(this).trigger({
				type: "smk_search_listview"
			  });
		  };
	
		}, self));
	  
	  $target.find('#gridview_a').click($.proxy(function( event ) {
		  event.preventDefault();
		  if (self.switch_list_grid(event)){
			  $(this).trigger({
					type: "smk_search_gridview"
				});
		  };	
		  
		}, self));

  },
  
  template: function () {   
	  var output = '<div class="viewtype">';
	  output += '<span>View as:</span>';
	  output += '<div class="listview"><a id="listview_a" href="#" class="switcher active"><span></span>List</a></div>';
	  output += '<div class="gridview"><a id="gridview_a" href="#" class="switcher"><span></span>Grid</a></div>';
	  output += '</div>';
	  return output;
},
  
  switch_list_grid: function (event) {
	  var $this_target = $(this.target);
	  var $event_target = $(event.target);
	  event.preventDefault();
	  	 
	  	var caller = $event_target.attr("id");
	  	var classNames = $event_target.attr('class').split(' ');
	  		
		if($event_target.hasClass("active")) {
			// if currently clicked button has the active class
			// then we do nothing!
			return false;
		} else {
			// otherwise we are clicking on the inactive button
			// and in the process of switching views!

			if(caller == "gridview_a") {
				$this_target.find("#gridview_a").addClass("active");
				$this_target.find("#listview_a").removeClass("active");			
			}
			
			else if(caller == "listview_a") {
				$this_target.find("#listview_a").addClass("active");
				$this_target.find("#gridview_a").removeClass("active");					
			} 
			
			return true;
		}
  }
  
});

})(jQuery);
