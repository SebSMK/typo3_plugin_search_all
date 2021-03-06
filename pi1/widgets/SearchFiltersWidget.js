(function ($) {

	AjaxSolr.SearchFiltersWidget = AjaxSolr.AbstractFacetWidget.extend({

		constructor: function (attributes) {
			AjaxSolr.SearchFiltersWidget.__super__.constructor.apply(this, arguments);
			AjaxSolr.extend(this, {
				title: null
			}, attributes);
		},

		previous_values: {},

		init: function () {
			var self = this;
			var $target = $(this.target);

			var json_data = {"options" : new Array({title:this.title, search_lab:self.manager.translator.getLabel(sprintf('search_%s_lab', this.id)), values:[{ "value": 'value', "text": ''}]})};	 
			var html = self.template_integration_json(json_data, '#chosenTemplate'); 	

			$target.html(html);	

			$('#search-filters h2.heading--widgets').html(self.manager.translator.getLabel('search_filter'));

			this.previous_values[this.field] = new Array(),

			//* init 'chosen' plugin
			self.init_chosen();

			this.hide_drop();	  
		},

		beforeRequest: function(){			
			var self = this;
			var $target = $(this.target);
			var $select = $(this.target).find('select');
			
			if (!self.getRefresh())				
				return;			
			
			$select.attr('data-placeholder', self.manager.translator.getLabel('search_data_loading'));
			$target.find('select').trigger("chosen:updated");	

		},

		after_afterRequest: function () {
			var self = this;
			var $target = $(this.target);
			var $select = $(this.target).find('select');

			if (!self.getRefresh()){
				self.setRefresh(true);
				return;
			};	 		  	  			  		

			//* just in case...
			if (self.manager.response.facet_counts.facet_fields[self.field] === undefined) {
//				var template = Mustache.getTemplate(templ_path);			
//				var html = Mustache.to_html($(template).find('#chosenTemplate').html(), json_data);
//				$target.html(html);
//				$('.chosen--multiple').chosen({no_results_text: "No results found."});
				return;
			};

			//* proceed facet values
			var maxCount = 0;
			var objectedItems = [];

			switch (self.field){
			case 'object_production_century_earliest':		 			  			  			  
				for (var facet in self.manager.response.facet_counts.facet_fields[self.field]) {
					var count = parseInt(self.manager.response.facet_counts.facet_fields[self.field][facet]);
					if (count > maxCount) {
						maxCount = count;
					};	

					objectedItems.push({ "value": facet, "text": this.getCentury(facet), "count": count });  	  	    	  	      
				};
				objectedItems.sort(function (a, b) {
					return parseInt(b.value)-parseInt(a.value);	  	      
				});				  			  			  
				break;	

			case 'artist_natio':
			case 'object_type':
				for (var facet in self.manager.response.facet_counts.facet_fields[self.field]) {
					var count = parseInt(self.manager.response.facet_counts.facet_fields[self.field][facet]);
					if (count > maxCount) {
						maxCount = count;
					};

					objectedItems.push({ "value": facet, "text": smkCommon.firstCapital(self.manager.translator.getLabel(smkCommon.replace_dansk_char(facet))).trim(), "count": count });	    	  	  	      	  	      
				};
				objectedItems.sort(function (a, b) {
					if (self.manager.translator.getLanguage() == 'dk')
						return typeof (a.value === 'string') && typeof (b.value === 'string') ? (a.value.trim() < b.value.trim() ? -1 : 1) : (a.value < b.value ? -1 : 1);

						return typeof (a.text === 'string') && typeof (b.text === 'string') ? (a.text.trim() < b.text.trim() ? -1 : 1) : (a.text < b.text ? -1 : 1);
				});	  	 		  	  
				break;					  

			default:		    			  			   							  
				for (var facet in self.manager.response.facet_counts.facet_fields[self.field]) {
					var count = parseInt(self.manager.response.facet_counts.facet_fields[self.field][facet]);
					if (count > maxCount) {
						maxCount = count;
					};

					objectedItems.push({ "value": facet, "text": smkCommon.firstCapital(facet).trim(), "count": count });	    	  	  	      	  	      
				};
				objectedItems.sort(function (a, b) {
					return typeof (a.value === 'string') && typeof (b.value === 'string') ? (a.value.trim() < b.value.trim() ? -1 : 1) : (a.value < b.value ? -1 : 1);	  	      
				});	  	 		  	  
				break;		  
			};

			//* merge facet data and template			
			var json_data = {"options" : new Array({title:this.title, values:objectedItems})};	    	    	    
			var html = self.template_integration_json(json_data, '#chosenTemplate'); 

			//** refresh view
			//* save previous selected values in the target 'select' component	  	 
			$select.find("option:selected").each(function (){
				self.previous_values[self.field].push(this.value.replace(/^"|"$/g, ''));	  		
			});

			//$target.hide(); // hide until all styling is ready

			//* remove all options in 'select'...
			$select.empty();	  	
			//*... and copy the new option list
			$select.append($(html).find('option'));	  		  	

			//* add previous selected values in the target 'select' component
			if (self.previous_values[self.field].length > 0){

				// if there were no result after the request, we add 'manually' the previous selected values in the "select" component
				if (objectedItems.length == 0){
					for (var i = 0, l = self.previous_values[self.field].length; i < l; i++) {
						var facet = self.previous_values[self.field][i];
						objectedItems.push({ "value": facet, "text": smkCommon.firstCapital(facet), "count": '0' });					
					}	
					var json_data = {"options" : new Array({title:this.title, values:objectedItems})};	    	    	    
					var html = self.template_integration_json(json_data, '#chosenTemplate');
					$select.append($(html).find('option'));
				}

				// add previous selected values 
				$(this.target).find('select').val(self.previous_values[self.field]); 	

			}			
			
			//* add behaviour on select change
			$target.find('select').change(self.clickHandler());
			
			//* change default text			
			$select.attr('data-placeholder', self.manager.translator.getLabel(sprintf('search_%s_lab', this.id)));

			//* update 'chosen' plugin		
			$target.find('select').trigger("chosen:updated");		
			self.open_multiple_select();		

			//* show component
			$target.show();
			$target.find('chosen-choices').blur();

			//* .. but hide the list if a filter is already selected
			if (self.previous_values[self.field].length > 0){
				this.hide_drop();
			}else{
				$(this.target).find('.chosen-drop').show("1000");
			}			

			self.previous_values[self.field] = new Array();		

			//* send "loaded" event
			$(this).trigger({
				type: "smk_search_filter_loaded"
			});
		},


		getCentury: function(facet){

			var number = parseInt(facet);
			var ordinal = "";
			var century = this.manager.translator.getLabel("search_filter_cent");

			switch (this.manager.translator.getLanguage()){
			case "dk":
				number = (number -1) * 100; 
				ordinal = "-";					  			  			  
				break;
			case "en":		 			  			  			  
				ordinal = smkCommon.ordinal_suffix(number);					  			  			  
				break;		  
			};

			return sprintf('%s%s%s', number, ordinal, century); 

		},

		/**
		 * @param {String} value The value.
		 * @returns {Function} Sends a request to Solr if it successfully adds a
		 *   filter query with the given value.
		 */
		clickHandler: function () {
			var self = this, meth = this.multivalue ? 'add' : 'set';
			return function (event, params) {
				event.stopImmediatePropagation();     	    	
				self.hide_drop();

				$(self).trigger({
					type: "smk_search_filter_changed",
					params: params
				});    	    	

				return false;
			}
		},  

		template_integration_json: function (json_data, templ_id){	  
			var template = this.template; 	
			var html = Mustache.to_html($(template).find(templ_id).html(), json_data);
			return html;
		},

		init_chosen: function() {
			/*
	   § Chosen
	  \*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			var $target = $(this.target); 		

			$target.find('.chosen select').chosen();

			// Multiple select
			$target.find('.chosen--multiple select').chosen({
				width: "198px"
			});

			//this.open_multiple_select();

		},

		open_multiple_select: function(){

			var $target = $(this.target); 
			// Multiple select (always open).
			$target.find('.chosen--multiple.chosen--open').each( function() {

				// This 'fix' allows the user to see the select options before he has
				// interacted with the select box.
				// 
				// Chosen do not show the contents of the select boxes by default, so we
				// have to show them ourselves. In the code below we loop through the options
				// in the select boxes, adds these to an array, and append each array item
				// to the <ul> called .chosen-results. Chosen uses .chosen-results to show
				// the options.

				var chosenResults = $(this).find('.chosen-results');
				var selectOptions = [];

				// Put all select options in an array
				$(this).find('select option').each( function() {
					selectOptions.push( $(this).text() );
				});

				// For each item in the array, append a <li> to .chosen-results
				$.each(selectOptions, function(i, val) {
					if(this != "") {
						chosenResults.append('<li class="active-result" data-option-array-index="' + i + '">' + this + '</li>');
					}
				});
			});    	  	  
		},

		hide_drop: function(){	  	
			$(this.target).find('.chosen-drop').hide();	  
		},

		/**
		 * @param {String}
		 * */
		addSelectedFilter: function (value){	 
			this.previous_values[this.field].push(value.replace(/^"|"$/g, ''));
		},

		removeAllSelectedFilters: function(removeFromStore){
			var self = this;
			var $select = $(self.target).find('select');

			$select.find("option:selected").each(function (){
				$(this).removeAttr("selected");
				if(removeFromStore == true)
					self.manager.store.removeByValue('fq', self.fq(this.value));
			});	

			//* update 'chosen' plugin		
			$select.trigger("chosen:updated");

			this.previous_values[this.field] = new Array();
		}
	});

})(jQuery);
