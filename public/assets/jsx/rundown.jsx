
var RundownTable = React.createClass({
  getInitialState: function() {
    return {data: {}, view: {title: 'Loading...'}};
  },

  getDefaultProps: function() {
    return {
      dataset: 'default'
    };
  },

  // Get dataset config and current data
  componentDidMount: function() {
    var self = this;
    $.ajax({
      url: "api/dataset/" + this.props.dataset,
      success: function(resp) {
        var reducedData = [];
        var view = resp.config.views[0];

        // Reduce the data down to something more suitable for UI
        Object.keys(resp.data).forEach(function(key) {
          var item = resp.data[key].slice(-1)[0];
          reducedData.push(self.reduceItem(key, item, view.groups));
        });

        // Sort it by key
        reducedData.sort(function(a, b) {
          return a.key == b.key ? 0 : +(a.key > b.key) || -1;
        });

        // Check for collapsing cells
        reducedData.map(function(item, rowNum, data) {
          item.collapses = [];

          // Top row never collapses
          if (rowNum == 0) {
            return;
          }

          // Get previous row for col-by-col comparison
          prevItem = data[rowNum - 1];

          // If the above cell is the same, we can collapse into it.
          for (var i = 0; i < item.cols.length; i++) {
            if (prevItem.cols[i] == item.cols[i]) {
              item.collapses.push(true);
            } else {
              break; // We can't collapse a cell to the right of one that isn't collapsed
            }
          }
        });

        this.setState({
          data: reducedData,
          view: view
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <div>
        <h1>{this.state.view.title}</h1>
        <table>
          <RundownTableHead view={this.state.view} />
          <RundownTableBody data={this.state.data} />
        </table>
      </div>
    );
  },

  /**
   * Generate a reduced object suitable for UI
   * @param  {string} key    The unique key for the row
   * @param  {Object} item   The individual event to reduce
   * @param  {Array} groups  The groups (columns) to use
   * @return {Object}        With props for key and cols
   */
  reduceItem: function(key, item, groups) {
    reduced = {key: key, cols: [], collapses: []};
    groups.map(function(group) {
      var val = '';
      if (item[group.param]) {
        val = item[group.param]
      }
      reduced.cols.push(val);
    });
    return reduced;
  }
});

//--------------------------------------------------------------------------

var RundownTableHead = React.createClass({

  render: function() {
    if (!this.props.view.groups) {
      return (<thead/>);
    }
    var thNodes = this.props.view.groups.map(function(group) {
      return (
        <th key={group.param}>{group.display}</th>
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

//--------------------------------------------------------------------------

var RundownTableBody = React.createClass({
  getInitialState: function() {
    return {data: [], view: {}};
  },
  render: function() {
    if (!this.props.data.length) {
      return (<tbody/>);
    }
    var trNodes = this.props.data.map(function(item) {
      return (
        <RundownTableRow key={item.key} item={item} />
      );
    });
    return (
      <tbody>
        {trNodes}
      </tbody>
    );
  }
});

//--------------------------------------------------------------------------

var RundownTableRow = React.createClass({

 render: function() {
    var item = this.props.item;
    var tdNodes = item.cols.map(function(val, i) {
      // Is this column collapsed to the one above?
      var cssClass = '';
      if (item.collapses[i]) {
        console.log(item);
        cssClass = 'collapsed';
      }
      return (
        <td key={i} className={cssClass}>{val}</td>
      );
    });
    return (
      <tr>
        {tdNodes}
      </tr>
    );
  }

});


//--------------------------------------------------------------------------

React.render(
  <RundownTable socket={io()} />,
  document.getElementById('rundown-container')
);