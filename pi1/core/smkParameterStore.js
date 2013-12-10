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

  all_counts: -1,	  
  
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
		  
  },
    
  /**
   * If the parameter may be specified multiple times, adds the given parameter
   * to the list of identically-named parameters, unless one already exists with
   * the same value. If it may be specified only once, replaces the parameter.
   * 
   * If the parameter is not a 'fq' request on 'category', the 'all' number of results (self.all_counts variable) is set to -1 so that to be refreshed with response.response.numfound
   *
   * @param {String} name The name of the parameter.
   * @param {AjaxSolr.Parameter} [param] The parameter.
   * @returns {AjaxSolr.Parameter|Boolean} The parameter, or false.
   */
  add: function (name, param) {
    if (param === undefined) {
      param = new AjaxSolr.Parameter({ name: name });
    }
    if (this.isMultiple(name)) {
      if (this.params[name] === undefined) {
        this.params[name] = [ param ];
      }
      else {
        if (AjaxSolr.inArray(param.val(), this.values(name)) == -1) {
          this.params[name].push(param);
        }
        else {
          return false;
        }
      }
    }
    else {
      this.params[name] = param;
    }
    
    if(param.name != 'fq' || param.value.indexOf('category') == -1)
    	this.all_counts = -1;
    
    return param;
  },
  
  /**
   * Deletes a parameter.
   *
   * @param {String} name The name of the parameter.
   * @param {Number} [index] The index of the parameter.
   */
  remove: function (name, index) {
    if (index === undefined) {
    	if(name != 'fq')
    		this.all_counts = -1;
    	
    	delete this.params[name];
    }
    else {
      if(name != 'fq' || this.params[name][index].value.indexOf('category') == -1)
        	this.all_counts = -1;
      
      this.params[name].splice(index, 1);
      if (this.params[name].length == 0) {
        delete this.params[name];
      }
    }
  }
  
});

}));
