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

			var thumbnails = [];
			var dataHandler = new getData_Thumbs.constructor(this);
			for (var i = 0, l = this.manager.response.response.docs.length; i < l ; i++) {
				var doc = this.manager.response.response.docs[i];  
				//thumbnails.push(dataHandler.get_data(doc));
				
				var rank = new String(doc.id.split('/').length < 2 ? 0 : doc.id.split('/')[1]);
				rank = parseInt(/\d+/.exec(rank));
				thumbnails[rank] = dataHandler.get_data(doc);

			}

			//* merge data and template
			var data = {"label": self.manager.translator.getLabel("thumbs_label"), "thumb" : thumbnails};
			var html = self.template_integration_json({"thumbnails":data}, '#thumbTemplate');        
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