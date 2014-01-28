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
		  
  },
  
  /**
   * If the parameter may be specified multiple times, creates a parameter using
   * the given name and value, and adds it to the list of identically-named
   * parameters, unless one already exists with the same value. If it may be
   * specified only once, replaces the parameter.
   *
   * @param {String} name The name of the parameter.
   * @param {String|Number|String[]|Number[]} value The value.
   * @param {Object} [locals] The parameter's local parameters.
   * @param {String} [text] Text associated with request (used f.ex. as a label in currentSearch)
   * @returns {AjaxSolr.Parameter|Boolean} The parameter, or false.
   */
  addByValue: function (name, value, locals, text) {
    if (locals === undefined) {
      locals = {};
    }
    if (text === undefined) {
        text = "";
      }
    if (this.isMultiple(name) && AjaxSolr.isArray(value)) {
      var ret = [];
      for (var i = 0, l = value.length; i < l; i++) {
        ret.push(this.add(name, new AjaxSolr.Parameter({ name: name, value: value[i], locals: locals, text: text })));
      }
      return ret;
    }
    else {
      return this.add(name, new AjaxSolr.Parameter({ name: name, value: value, locals: locals, text: text }));
    }
  },
  
  /**
   * If the parameter may be specified multiple times, returns the values of
   * all identically-named parameters. If the parameter may be specified only
   * once, returns the value of that parameter.
   *
   * @param {String} name The name of the parameter.
   * @returns {String[]|Number[]} The value(s) of the parameter.
   */
  values: function (name) {
    if (this.params[name] !== undefined) {
      if (this.isMultiple(name)) {
        var values = [];
        for (var i = 0, l = this.params[name].length; i < l; i++) {          
        	if (this.params[name][i].text !== undefined && this.params[name][i].text != ""){
        		values.push({'value':this.params[name][i].val(), 'text':this.params[name][i].text});
        	}else{
        		values.push(this.params[name][i].val());
        	}        		
        }
        return values;
      }
      else {
    	var value = null;
    	if (this.params[name][i].text !== undefined && this.params[name][i].text != ""){
      		value = ({'value':this.params[name].val(), 'text':this.params[name].text});
      	}else{
      		value = (this.params[name].val());
      	}  
    	  
        return [ value ];
      }
    }
    return [];
  },
  
});

}));
