(function ($) {

	AjaxSolr.ThumbsWidget = AjaxSolr.AbstractWidget.extend({

		start: 0, 

		current_selec: null,

		default_picture_path: null,

		init: function(){	  	

			this.default_picture_path = smkCommon.getDefaultPicture('small');

		},  

		afterRequest: function () {

			var self = this;		
			var $target = $(this.target);

			if (!self.getRefresh() ||  $(this.target).length == 0){
				self.setRefresh(true);
				return;
			}	 		  

			$target.empty();

			var artwork_data = null;
			var dataHandler = new getData_Thumbs.constructor(this);
			for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
				var doc = this.manager.response.response.docs[i];  

				if(doc.multi_work_ref !== undefined){
					artwork_data = dataHandler.get_data(doc);
				}else{
					// this piece of code below does basically nothing - but it's the only way we found so that to have 
					// the delay-function to work properly on "back button: opacity:1" in "Detail" (see WidgetManager: "$(Manager.widgets['details'].target).find('a.back-button').css('opacity', '1');" )
					// If you find a more rational method to achieve that, feel free to implement it.
					var html = self.template_integration_json({"thumbnails":artwork_data}, '#thumbTemplate'); 	        
					$target.html(html);
					return;
				}

			}

			//* merge data and template
			var html = self.template_integration_json({"thumbnails":artwork_data}, '#thumbTemplate');        
			$target.html(html);

			//* add image + link to detail on click on images
			$target.find('.image_loading').each(function() {    	    	
				dataHandler.getImage($(this));
			});    			    			

		},  	  

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},  

		verticalAlign: function() {

			var $target = $(this.target);	  

			$(this.target).show().children().not('.modal').show();	

			// Vertically align thumbs (in relation to their frames)
			$target.find('li img').each( function() {

				// Calculating offset that will vertically center the thumb
				// NOTE: 66 is the maximum thumb height in pixels
				var thumbHeight = $(this).height();
				var verticalOffset =  (66 - thumbHeight) / 2;

				if( $(this).height() < 66 ) {
					$(this).css('margin-top', verticalOffset + 'px');
				}
			});  
		},

		setCurrent_selec: function(value){
			this.current_selec = value;  
		},

		getCurrent_selec: function(){
			return this.current_selec;  
		}

	});

})(jQuery);