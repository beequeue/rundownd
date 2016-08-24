import React from 'react';

var RundownTableFilter = React.createClass({

  getInitialState: function() {
    return {visible: false};
  },

  handleChange: function(event) {
    var cb = event.target;
    var filter = this.props.filter;
    var table = this.props.table;

    if (cb.checked) {
      filter.showValue(cb.value);
    } else {
      filter.hideValue(cb.value);
    }

    table.repaint();
  },

  toggleShowHide: function() {
    this.setState({visible: !this.state.visible});
  },

  render: function() {
    var self = this;
    var filter = this.props.filter;
    var liNodes = filter.values.map(function(val, i) {
      var cbName = filter.param + '_' + val;
      return (
        <li key={i}>
          <input type="checkbox" 
                 
                 id={cbName} 
                 value={val} 
                 onChange={self.handleChange}
                 checked={filter.isActive(val)}
          />
          <label htmlFor={cbName}>{val}</label>
        </li>
      );
    });

    var cssClass = "filter";
    if (!this.state.visible) {
      cssClass += " hidden";
    }

    return (
      <ul className={cssClass}>
        {liNodes}
      </ul>
    );
  }

});

export default RundownTableFilter;
