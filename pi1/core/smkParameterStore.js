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

	  constructor: function (attributes) {
		    AjaxSolr.smkParameterStore.__super__.constructor.apply(this, arguments);
		    AjaxSolr.extend(this, {
		    	q_default:null,
		    	qf_default:null
		    }, attributes);
	 },	 
	  
  /**
   *
   * <p>Stores the values of the exposed parameters in persistent storage. This
   * method should usually be called before each Solr request.</p>
   */
  save: function (isdefault) {	  
	  isdefault = isdefault === undefined ? false : isdefault;
	  
	  if (isdefault)
		  $.cookie("smk_default_solr_request", this.exposedString());
	  else
		  $.cookie("smk_previous_solr_request", this.exposedString());
  },

  /**
   * Loads the values of exposed parameters from persistent storage. It is
   * necessary, in most cases, to reset the values of exposed parameters before
   * setting the parameters to the values in storage. This is to ensure that a
   * parameter whose name is not present in storage is properly reset.
   *
   * @param {Boolean} [reset=true] Whether to reset the exposed parameters.
   *   before loading new values from persistent storage. Default: true.
   */
  load: function (reset, isdefault) {
	isdefault = isdefault === undefined ? false : isdefault;  
    
	if (reset === undefined) {
      reset = true;
    }
    if (reset) {
      this.exposedReset();
    }
    this.parseString(this.storedString(isdefault));
  },  
  
  /**
   *
   * <p>Returns the string to parse from persistent storage.</p>
   *
   * @returns {String} The string from persistent storage.
   */
  storedString: function (isdefault) {
	  isdefault = isdefault === undefined ? false : isdefault;
	  
	  var res = isdefault ? $.cookie("smk_default_solr_request") : $.cookie("smk_previous_solr_request");
	  
	  if (res != null){
		  return res;
	  }else{
		  return '';
	  }
		  
  },

  
  /**
   * see removeByvalue function in ParameterStore
   */
  removeElementFrom_q: function (value) {
    var indices = this.findIn_q(value);
    if (indices) {
      if (AjaxSolr.isArray(indices)) {
        for (var i = indices.length - 1; i >= 0; i--) {
          this.removeIn_q_value(indices[i]);
        }
      }
      else {
        this.remove(indices);
      }
    }
    return indices;
  },
  
  
  /**
   * see remove function in ParameterStore
   */
  removeIn_q_value: function (index) {
	var name = 'q';
	if (index === undefined) {
      delete this.params[name];
    }
    else {
      this.params[name].value.splice(index, 1);
      if (this.params[name].value.length == 0) {
        delete this.params[name];
      }
    }
  },
  
  /**
   * see find function in ParameterStore
   */
  findIn_q: function (value) {
	var name = 'q';  
    if (this.params[name] !== undefined) {
      //if (this.isMultiple(name)) {
        var indices = [];
        for (var i = 0, l = this.params[name].val().length; i < l; i++) {
	    	 if (AjaxSolr.equals(this.params[name].val()[i], value)) {
	             indices.push(i);
	           }    
        }
        return indices.length ? indices : false;
//      }
//      else {
//        if (AjaxSolr.equals(this.params[name].val(), value)) {
//          return name;
//        }
//      }
    }
    return false;
  },
  
  set_qf: function(json){
	  this.qf_default = json;	  
  },
  
  
  get_qf_string: function(){
	  
	  var res = "";
	  
	  if( this.qf_default != null){
		  $.each(this.qf_default, function(k, v) {
				res = res.concat(sprintf(' %s^%s', k, v));
		  });		  
	  };
	  
	  return res;
  },
  
  extract_q_from_manager: function(){	  
	  var res = '';
	  var q_all = this.get('q').value == null ? [] : this.get('q').value.slice();
	  return smkCommon.removeA(q_all, this.q_default);
  }
  
});

}));
