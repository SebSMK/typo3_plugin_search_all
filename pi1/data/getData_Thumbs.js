(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var getdatathumbs = {};
		factory(getdatathumbs);
		if (typeof define === "function" && define.amd) {
			define(getdatathumbs); // AMD
		} else {
			root.getData_Thumbs = getdatathumbs; // <script>
		}
	}
}(this, function (getdatathumbs) {

	getdatathumbs.constructor = function(caller){

		
		this.get_data = function (doc){
			
			return {
				id: doc.id,
				img_id : doc.id,
				title : doc.title_first,
				image : doc.medium_image_url !== undefined ? doc.medium_image_url : this.caller.default_picture_path,
				current: this.caller.getCurrent_selec() == doc.id,
				copyright: smkCommon.computeCopyright(doc) != false ? smkCommon.computeCopyright(doc) :  '',
				url: this.getDetailUrl(doc.id)
			}; 		
		}; 						

		this.getDetailUrl = function(id){						
			var model = {};
			model.q = id;
			model.view = 'detail';

			return ModelManager.buildURLFromModel(model); 
		};
		
		this.getImage = function ($target){

			var self = this.caller;

			if ($target === undefined || $target.length == 0){
				$(self).trigger({
					type: "smk_teasers_this_img_loaded"
				});  	
				return;
			}

			var img_id = $target.attr("img_id");
			var path = $target.attr("src");
			var alt = $target.attr("alt");
			var title = $target.attr("alt");
			var img = new Image();

			// wrap our new image in jQuery, then:
			$(img)
			// once the image has loaded, execute this code
			.load(function () {
				// set the image hidden by default    
				$target.hide();

				// with the holding div #loader, apply:
				$target
				// remove the loading class (so no background spinner), 
				.removeClass('image_loading')
				// then insert our image
				.find('a')
				// call detailed view on click on image
				.click({detail_id: img_id, caller:self}, 
						function (event) {
							event.preventDefault();
		
							// if this view is the current view, do nothing 
							if ($(this).attr("class") == 'current')
								return;			    			    		
		
							$(event.data.caller).trigger({
								type: "smk_search_call_detail",
								detail_id: event.data.detail_id,
								save_current_request: false
							});
		
							return;
						})		
				.append(this);

				// fade our image in to create a nice effect
				$target.fadeIn();

				// trig "image loaded" event	      
				$(self).trigger({
					type: "smk_thumbs_img_loaded"
				});  	    	  

			})

			// if there was an error loading the image, react accordingly
			.error(function () {
				$target
				// remove the loading class (so no background spinner), 
				.removeClass('image_loading')
				.find('a')
				.append(sprintf('<img src="%s" alt="%s" title="%s"/>', 
						self.default_picture_path,
						alt,
						alt
				));
				// call detailed view on click on image
				$target.find('a')
				.click({detail_id: img_id, caller:self}, function (event) {
					event.preventDefault();

					// if this view is the current view, do nothing 
					if ($(this).parent().attr("class") == 'current')
						return;

					$(event.data.caller).trigger({
						type: "smk_search_call_detail",
						detail_id: event.data.detail_id,
						save_current_request: false
					});

					return;
				});
				$target.fadeIn();

				// trig "image loaded" event	      
				$(self).trigger({
					type: "smk_thumbs_img_loaded"
				});
			})	    	    

			.attr('alt', alt)
			.attr('title', title)

			// *finally*, set the src attribute of the new image to our image
			.attr('src', path); 
		},

		/*
		 * variables
		 */
		this.caller = caller;
	}

}));