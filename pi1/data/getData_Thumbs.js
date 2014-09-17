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
			var data = null;	  		  	  
			var thumbnails = new Array();
			var copyright = smkCommon.computeCopyright(doc) != false; // compute copyright for the artwork in the current detail view and apply it to all artwork's parts  

			var multi_works = doc.multi_work_ref.split(';-;');
			var work_parent = new Array();
			var work_siblings = new Array();
			var work_children = new Array();

			if (this.caller.getCurrent_selec() == null)
				this.caller.setCurrent_selec(doc.id);

			for ( var i = 0, l = multi_works.length; i<l; ++i ) {

				var work = multi_works[i].split(';--;');

				switch(work[0]){

				case "parent":
					work_parent.push(work);
					break;
				case "sibling":
					work_siblings.push(work);
					break;
				case "child":
					work_children.push(work);
					break;		  		  
				};
			}

			if (work_parent.length == 0){
				thumbnails.push({
					img_id : doc.id,
					title : doc.title_first,
					image : doc.medium_image_url !== undefined ? doc.medium_image_url : this.caller.default_picture_path,
							current: this.caller.getCurrent_selec() == doc.id,
							copyright: copyright ? sprintf('&copy; %s', doc.artist_name) : false 
				}); 		
			}
			else{
				for (var i = 0; i < work_parent.length; i++) {		  
					this.push_work_til_thumb(work_parent[i], thumbnails, copyright ? sprintf('&copy; %s', doc.artist_name) : false);
				}
			};

			for (var i = 0; i < work_siblings.length; i++) {		  
				this.push_work_til_thumb(work_siblings[i], thumbnails, copyright ? sprintf('&copy; %s', doc.artist_name) : false);
			}		

			for (var i = 0; i < work_children.length; i++) {		  
				this.push_work_til_thumb(work_children[i], thumbnails, copyright ? sprintf('&copy; %s', doc.artist_name) : false);
			}

			data = {"label": this.caller.manager.translator.getLabel("thumbs_label"), "thumb" : thumbnails};  	  

			return data;	  

		};       

		this.push_work_til_thumb = function(work, thumbnails, copyright){
			var id = work[1];		  
			var title = work[2];
			var thumb = work[3] != "" ? smkCommon.getScaledPicture (work[3], 'small') : this.caller.default_picture_path;			   

			thumbnails.push({
				img_id : id,
				title : title,
				image : thumb,
				current: this.caller.getCurrent_selec() == id,
				copyright: copyright 
			});  	  
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

					event.data.caller.setCurrent_selec(img_id);  			    			    		

					$(event.data.caller).trigger({
						type: "smk_search_call_detail",
						detail_id: event.data.detail_id,
						detail_view_intern_call: false,
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
				.click({detail_id: img_id, caller:self}, 
						function (event) {
					event.preventDefault();

					// if this view is the current view, do nothing 
					if ($(this).parent().attr("class") == 'current')
						return;

					event.data.caller.setCurrent_selec(img_id);

					$(event.data.caller).trigger({
						type: "smk_search_call_detail",
						detail_id: event.data.detail_id,
						detail_view_intern_call: false,
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