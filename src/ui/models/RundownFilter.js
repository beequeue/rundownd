
function RundownFilter(param, values) {

  // The param we are filtering on
  this.param = param;

  // The list of possible values we can filter
  this.values = values || [];

  // The currently visible values
  this.activeValues = [];

  // Flag indicating whether we skip the filter and just show everything
  // i.e. if true, the filter is bypassed.
  this.showAll = false;

};

/**
 * Add a filter value to the list of possibles
 * @param {string} value The value to add
 * @param {bool}   checked Whether it is added as checked
 */
RundownFilter.prototype.addValue = function(value, checked) {
  if (this.values.indexOf(value) === -1) {
    this.values.push(value);
    this.values.sort();
  }
  if (checked) {
    this.showValue(value);
  } else {
    this.hideValue(value);
  }
};

/**
 * Set a value as being visible
 * @param  {string} value The value to make visible
 */
RundownFilter.prototype.showValue = function(value) {
  if (this.activeValues.indexOf(value) === -1) {
    this.activeValues.push(value);
  }
};

/**
 * Set a value as being hidden
 * @param  {string} value The value to hide
 */
RundownFilter.prototype.hideValue = function(value) {
  var index = this.activeValues.indexOf(value);
  if (index > -1) {
    this.activeValues.splice(index, 1);
  }
};

/**
 * Return true if we're allowing the value through the filter
 * @param  {string} value The value to hide
 */
RundownFilter.prototype.isActive = function(value) {
  return (this.showAll || this.activeValues.indexOf(value) > -1);
};

export default RundownFilter;
