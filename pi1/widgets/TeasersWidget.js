(function ($) {

	AjaxSolr.TeasersWidget = AjaxSolr.AbstractWidget.extend({  

		start: 0,		  

		default_picture_path: null, 

		teaser_article_class: null, // current article visualization classes	

		init: function(){

			var self = this;
			var $target = $(this.target);		

			//* load empty template
			var html = self.template;     
			$target.html($(html).find('#teaserInitTemplate').html());		

			$target.find('#teaser-container-grid article').hide();

			//* init masonry
			$target.find('#teaser-container-grid').masonry( {
				transitionDuration: 0
			});

			this.default_picture_path = smkCommon.getDefaultPicture('medium');      
			this.teaser_article_class = $target.find('#teaser-container-grid article').attr('class');	

		},  

		afterRequest: function () {  
			var self = this;
			var $target = $(this.target);

			if (!self.getRefresh()){
				self.setRefresh(true);
				return;
			}	 		  

			//* remove all articles
			self.removeAllArticles();		

			//* in case there are no results, we create an empty-invisible article - but with the correct visualization class
			//* ...and send "teaser loaded" event
			if (this.manager.response.response.docs.length == 0){
				var html = self.template_integration_json({"artworks": {}}, '#teaserArticleTemplate');     
				var $article = $(html);	      
				//* load current article visualization classes
				$article.removeClass().addClass(self.teaser_article_class);	      
				$target.find('#teaser-container-grid').append($article);	      	        
				$target.find('#teaser-container-grid').masonry('appended', $article);	 
				$target.find('.image_loading').removeClass('image_loading').hide();

				// trig "this image is loaded" event	      
				$(self).trigger({
					type: "smk_teasers_this_img_loaded"
				});
				$(self).trigger({
					type: "smk_teasers_this_img_displayed"
				});



				return;		
			}
			else{
				//* load data
				var artwork_data = null;		
				var dataHandler = new getData_Teasers.constructor(this);

				for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
					var doc = this.manager.response.response.docs[i];	      	      	      

					//* load data for this artwork		      
					artwork_data = dataHandler.getData(doc);	      	      

					//* merge data and template
					var html = self.template_integration_json({"artworks": artwork_data}, '#teaserArticleTemplate');     
					var $article = $(html);

					//* load current article visualization classes
					$article.removeClass().addClass(self.teaser_article_class);		      

					//* if the current article is an artwork, add a link to detail on click on title
					$article.find('.article_artwork')
					.click({detail_id: artwork_data.img_id, caller:this}, 
							function (event) {
						event.preventDefault();
						$(event.data.caller).trigger({
							type: "smk_search_call_detail",
							detail_id: event.data.detail_id,
							detail_view_intern_call: false,
							save_current_request: true
						});

						return;
					})	

					//* ...else if the current article is a link to a webpage
					$article.find('.article_link')
					.click({detail_id: artwork_data.img_id, caller:this}, 
							function (event) {
						//* the user leaves the current search page for a result page    
						if (typeof _gaq !== undefined)
							_gaq.push(['_trackEvent','Search', 'Paging result', $(this).attr("href"), 0, true]);

						event.preventDefault();		  	    		

						var url = $(this).attr("href");
						var windowName = $(this).attr("alt");	                    
						window.open(url, windowName);

						return;
					});	


					//* append the current article to list
					$target.find('#teaser-container-grid').append($article);	      

					//* refresh masonry
					$target.find('#teaser-container-grid').masonry('appended', $article);	      
				}						

				//* add image + link to detail on click on image to all articles
				$target.find('article').each(function() {    	    	
					dataHandler.getImage($(this), $(this).find('.image_loading'));
				});
			}	   

		}, 

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},

		removeAllArticles: function(){
			var $target = $(this.target); 
			var $all_articles = $target.find('#teaser-container-grid article');

			if($all_articles.length > 0 ){
				//* save current visualization class
				this.teaser_article_class = $target.find('#teaser-container-grid article').attr('class');
				$target.find('#teaser-container-grid').masonry('remove', $all_articles);		
			};		  
		},  

		switch_list_grid: function (view) {
			var self = this;  

			switch(view)
			{		  
			case "grid":
				self.setTeaserViewGrid();
				//$(this.target).find('#teaser-container-grid').masonry('layout');
				break;

			case "list":
				self.setTeaserViewList();
				break;

			default:
				self.setTeaserViewGrid();
			}		
		},

//		Grid view
		setTeaserViewGrid: function () {
			var $target = $(this.target);	  
			// Restyling articles
			var teasers = $target.find('article').each( function() {
				if ( $(this).hasClass('teaser--list') ) {

					// Switching classes
					$(this).removeClass('teaser--list');
					$(this).removeClass('teaser--two-columns');
					$(this).addClass('teaser--grid');

					// Removing inline css
					$(this).attr('style', '');

					// Adding CSS position (masonry doesn't add this automatically when rerun - see below)
					$(this).css('position', 'absolute');

					// Removing list style vertical alignment for thumbs
					$(this).find('img').css('margin-top', 'auto');
				} // end if
			});

			// Rerun masonry to enable grid
			$target.find('#teaser-container-grid').masonry({
				transitionDuration: 0
			});
		}, // setTeaserViewGrid

		// List view
		setTeaserViewList: function () {

			var $target = $(this.target);
			// Resetting the height of the containing element
			$target.find('#teaser-container-grid').css('height', 'auto');

			// Restyling articles
			$target.find('article').each( function() {
				if ( $(this).hasClass('teaser--grid') ) {

					// Switching classes
					$(this).removeClass('teaser--grid');
					$(this).addClass('teaser--list');

					// Adjusting CSS
					$(this).attr('style', '');
				} // end if

				// If the teaser container is full width, than make a two column layout.
				if ( $target.find('#teaser-container-grid').hasClass('full-width') ) {
					$(this).addClass('teaser--two-columns');
				}else{
					$(this).removeClass('teaser--two-columns');	
				}
			});

			this.verticalAlign();

		}, // setTeaserViewGrid


		verticalAlign: function() {

			var $target = $(this.target);	  

			$(this.target).show().children().not('.modal').show();

			// Vertically align thumbs (in relation to their frames)
			$target.find('.teaser--list img').each( function() {

				// Calculating offset that will vertically center the thumb
				// NOTE: 66 is the maximum thumb height in pixels
				var thumbHeight = $(this).height();
				var verticalOffset =  (66 - thumbHeight) / 2;

				if( $(this).height() < 66 ) {
					$(this).css('margin-top', verticalOffset + 'px');
				}
			});

		}


	});

})(jQuery);