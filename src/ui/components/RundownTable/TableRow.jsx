import React from 'react';

var RundownTableRow = React.createClass({

  render: function() {
    var item = this.props.item;
    var tdNodes = item.cols.map(function(val, i) {
      // Is this column collapsed to the one above?
      var cssClass = '';
      if (item.collapses[i]) {
        cssClass = 'collapsed';
      }
      return (
        <td key={i} className={cssClass}>{val}</td>
      );
    });
    return (
      <tr className={item.isHidden ? "hidden" : ""}>
        {tdNodes}
      </tr>
    );
  }
  
});

export default RundownTableRow