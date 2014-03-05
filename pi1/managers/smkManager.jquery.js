(function (callback) {
  if (typeof define === 'function' && define.amd) {
    define(['core/AbstractManager'], callback);
  }
  else {
    callback();
  }
}(function () {

/**
 * @see http://wiki.apache.org/solr/SolJSON#JSON_specific_parameters
 * @class Manager
 * @augments AjaxSolr.AbstractManager
 */
AjaxSolr.smkManager = AjaxSolr.AbstractManager.extend(
  /** @lends AjaxSolr.Manager.prototype */
  { 
  
	 constructor: function (attributes) {
		    AjaxSolr.smkManager.__super__.constructor.apply(this, arguments);
		    AjaxSolr.extend(this, {
		    	searchfilterList: [],
		    	allWidgetsProcessed: null,
		    	generalSolrError: null,
		    	translator:null
		    }, attributes);
	 },	  	  
	  
  executeRequest: function (servlet, string, handler, errorHandler) {
    var self = this,
        options = {dataType: 'json'};
    string = string || this.store.string();
    handler = handler || function (data) {
      self.handleResponse(data);
    };   
    errorHandler = errorHandler || function (jqXHR, textStatus, errorThrown) {
      self.handleError(textStatus + ', ' + errorThrown);
    };
    if (this.proxyUrl) {
      options.url = this.proxyUrl;
      options.data = {query: string};
      options.type = 'POST';
    }
    else {
      options.url = this.solrUrl + servlet + '?' + string + '&wt=json&json.wrf=?';
    }

    
    /*
     * Executing request
     * */
    
    //* 1st method: direct -> JSON without error / timeout handling
    //jQuery.ajax(options).done(handler).fail(errorHandler);
    
    //* 2nd method: indirect -> JSONP with error / timeout handling
    this.getJSONP(options, handler);
    
  },
  
  
  // fn to handle jsonp with timeouts and errors
  getJSONP: function(s, handler, errorhandler) {
	  var self = this;
	  //s.url = "http://csdev-seb:8180/solr-example/SMK_All_v/select?q=*%3A*&wt=json&json.wrf=?";
	  
	  s.url = s.url + '&callback=' + function(data){};      
      
//	  s.data = {'q': "*:*", 'wt':'json'};
//	  s.dataType = 'jsonp';
	  s.success = handler;
//	  s.jsonp = 'json.wrf'
//      
//	  s.jsonpCallback = handler;
	  jQuery.ajax(s);
	  
      //$.getJSON(s.url, handler);

      // figure out what the callback fn is
      var $script = $(document.getElementsByTagName('head')[0].firstChild);
      var url = $script.attr('src') || '';
      var cb = (url.match(/callback=(\w+)/)||[])[1];
      if (!cb)
          return; // bail
      var t = 0, cbFn = window[cb];

      $script[0].onerror = function(e) {
          $script.remove();
          handleError(s, {}, "error", e);
          clearTimeout(t);
      };

      if (!s.timeout)
          return;

/*
 * --------> if you want to use the timeout below, don't forget to clearTimeout after result handling!!!
 * */ 
//      window[cb] = function(json) {
//          clearTimeout(t);
//          cbFn(json);
//          cbFn = null;
//      };
//
//      t = setTimeout(function() {
//          $script.remove();
//          handleError(s, {}, "timeout");
//          if (cbFn)
//              window[cb] = function(){};
//      }, s.timeout);
      
      function handleError(s, o, msg, e) {
          // support jquery versions before and after 1.4.3
          //($.ajax.handleError || $.handleError)(s, o, msg, e);
    	  if(self.generalSolrError != null)
    	    	self.generalSolrError(msg);
      }
  },
  
  /**
   * This method is executed after the Solr response data arrives. Allows each
   * widget to handle Solr's response separately.
   *
   * @param {Object} data The Solr response.
   */
  handleResponse: function (data) {
    this.response = data;
    	    
    for (var widgetId in this.widgets) {
      this.widgets[widgetId].afterRequest();
    }; 
    
    //* Uses a function passed as an argument.
    //* The whole idea is that this function should refer to a function in StateManager
    if(this.allWidgetsProcessed != null)
    	this.allWidgetsProcessed();

   }  
});

}));
