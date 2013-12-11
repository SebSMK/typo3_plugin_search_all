(function (callback) {
  if (typeof define === 'function' && define.amd) {
    define(['core/Core', 'core/ParameterStore'], callback);
  }
  else {
    callback();
  }
}(function () {

/**
 */
AjaxSolr.smkParameterStore = AjaxSolr.ParameterStore.extend(
  /** @lends AjaxSolr.ParameterStore.prototype */
  {

  /**
   *
   * <p>Stores the values of the exposed parameters in persistent storage. This
   * method should usually be called before each Solr request.</p>
   */
  save: function () {	  
	  $.cookie("smk_previous_solr_request", this.exposedString());
  },

  /**
   *
   * <p>Returns the string to parse from persistent storage.</p>
   *
   * @returns {String} The string from persistent storage.
   */
  storedString: function () {
	  var res = $.cookie("smk_previous_solr_request");
	  
	  if (res != null){
		  return res;
	  }else{
		  return '';
	  }
		  
  }
  
});

}));
