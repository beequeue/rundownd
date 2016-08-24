import React from 'react';
import RundownTableRow from './TableRow.jsx';

var RundownTableBody = React.createClass({

  getInitialState: function() {
    return {data: [], view: {}};
  },

  render: function() {
    var self = this;
    if (!this.props.data.length) {
      return (<tbody/>);
    }
    var trNodes = this.props.data.map(function(item, i) {
      return (
        <RundownTableRow key={i} item={item} table={self.props.table} />
      );
    });
    return (
      <tbody>
        {trNodes}
      </tbody>
    );
  }
});

export default RundownTableBody;