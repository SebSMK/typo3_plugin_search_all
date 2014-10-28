(function (root, factory) {
	if (typeof exports === "object" && exports) {
		factory(exports); // CommonJS
	} else {
		var getdatarelated = {};
		factory(getdatarelated);
		if (typeof define === "function" && define.amd) {
			define(getdatarelated); // AMD
		} else {
			root.getData_Related = getdatarelated; // <script>
		}
	}
}(this, function (getdatarelated) {

	getdatarelated.constructor = function(caller){


		this.getData = function (entry){

			var title_first = entry.split(';--;')[2];
			var medium_image_data = entry.split(';--;')[3] != "" ? smkCommon.getScaledPicture (entry.split(';--;')[3], 'medium') : this.caller.default_picture_path;
			var id = entry.split(';--;')[0];
			var artist_name = entry.split(';--;')[1];

			return {
				id: id,
				title: title_first,	 
				thumbnail: medium_image_data,				  						  		
				meta: [{key: smkCommon.firstCapital(this.caller.manager.translator.getLabel('related_reference')), value: id}],				  		
				img_id: id,
				artist_name: artist_name,
				copyright: 'nullll'//øøøøøøsmkCommon.computeCopyright(doc) != false ? smkCommon.computeCopyright(doc) :	this.caller.manager.translator.getLabel('copyright_def') 
			};

		};  

		this.getImage = function ($container, $target){

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
				$(this).hide();

				// with the holding div #loader, apply:
				$target
				// remove the loading class (so no background spinner), 
				.removeClass('image_loading')
				// then insert our image
				.find('a').append(this);

				// fade our image in to create a nice effect
				$(this).fadeIn();

				// trig "image loaded" event
				//if ($container.find('.image_loading').length == 0){
				$(self).trigger({
					type: "smk_related_this_img_loaded"
				});  	    	  
				//}

			})

			// if there was an error loading the image, react accordingly
			.error(function () {
				$target
				// remove the loading class (so no background spinner), 
				.removeClass('image_loading')
				.find('a')
				.append(sprintf('<img src="%s" />', self.default_picture_path));
				// call detailed view on click on image
				$target.find('a').click({detail_id: img_id, caller:self}, 
						function (event) {
					event.preventDefault();
					$(event.data.caller).trigger({
						type: "smk_search_call_detail",
						detail_id: event.data.detail_id,
						save_current_request: false
					});

					return;
				});
				$target.fadeIn();

				// trig "image loaded" event
				//if ($container.find('.image_loading').length == 0){
				$(self).trigger({
					type: "smk_related_this_img_loaded"
				});  	    	  
				// }
			})

			// call detailed view on click on image
			.click({detail_id: img_id, caller:self}, 
					function (event) {
				event.preventDefault();
				$(event.data.caller).trigger({
					type: "smk_search_call_detail",
					detail_id: event.data.detail_id,
					save_current_request: false
				});

				return;
			})		

			.attr('alt', alt)
			.attr('title', title)

			// *finally*, set the src attribute of the new image to our image
			.attr('src', path); 
		};	  

		/*
		 * variables
		 */
		this.caller = caller;
	}

}));