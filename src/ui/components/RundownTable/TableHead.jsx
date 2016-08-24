import React from 'react';
import RundownTableFilter from './TableFilter.jsx';

var RundownTableHead = React.createClass({

  getDefaultProps: function() {
    return {
      view: {}
    };
  },

  handleFilterToggle: function(refName) {
    this.refs[refName].toggleShowHide();
  },

  render: function() {
    var self = this;
    if (!this.props.view.groups) {
      return (<thead/>);
    }
    var thNodes = this.props.view.groups.map(function(group) {

      // Do we have a filter?
      var filter;
      var filterShowHide;
      if (self.props.filters[group.param]) {
        filter = <RundownTableFilter filter={self.props.filters[group.param]} 
                                     table={self.props.table} 
                                     ref={group.param}/>

        // @todo Use a nice filter icon instead of this text
        filterShowHide = <span className="filterShowHide" 
                               onClick={self.handleFilterToggle.bind(self, group.param)}>
                          [f]
                         </span>
      }

      return (
        <th key={group.param}>
          {group.display} {filterShowHide}
          {filter}
        </th>
      );
    });
    return (
      <thead>
        <tr>
          {thNodes}
        </tr>
      </thead>
    );
  }
});

export default RundownTableHead;