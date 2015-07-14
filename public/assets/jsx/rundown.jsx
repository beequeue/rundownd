
var RundownTable = React.createClass({
  getInitialState: function() {
    return {data: {}, config: {}, view: {title: 'Loading...'}};
  },

  getDefaultProps: function() {
    return {
      dataset: 'default'
    };
  },

  /**
   * Get dataset config and current data
   */
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

        // Sort data and add cell collapse cues
        reducedData = this.collapseData(this.sortData(reducedData));

        this.setState({
          data: reducedData,
          config: resp.config,
          view: view
        });

        // Setup socket.io listener
        this.props.socket.on('notify', this.onSocketNotify);

      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  /**
   * Sort the data by key
   * @param  {Object[]} reducedData The row data
   * @return {Object[]}
   */
  sortData: function(reducedData) {
    reducedData.sort(function(a, b) {
      return a.key == b.key ? 0 : +(a.key > b.key) || -1;
    });

    return reducedData;
  },

  /**
   * Add cell collapse cues for vertically neighbouring cells that contain the same data
   * @param  {Object[]} reducedData The row data
   * @return {Object[]}
   */
  collapseData: function(reducedData) {
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

    return reducedData;
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
    var self = this;
    reduced = {key: key, cols: [], collapses: []};
    groups.map(function(group) {
      var val = '';
      if (item[group.param]) {
        val = item[group.param]
      }
      reduced.cols.push(self.formatValue(group, val));
    });
    return reduced;
  },

  /**
   * Apply any formatting to the value to be used as a cell's content
   * @param  {Object} group Contains a 'param' property
   * @param  {mixed}  val   The value to format
   * @return {mixed}        The formatted value
   */
  formatValue: function(group, val) {
    if (group.param == 'timestamp') {
      val = new Date(val*1000).toLocaleString('en-GB');
    }
    return val;
  },

  /**
   * Generate a key based on the groupBy config
   * @param  {Object} event A notification event
   * @return {String}       A colon-delimited string
   */
  generateEventKey: function(event) {
    var parts = [];
    this.state.config.groupBy.map(function(param) {
      parts.push(event[param]);
    });
    return parts.join(':');
  },

  /**
   * Add the passed event into the table, updating it's state
   * @param {Object} event A notification event
   */
  addEvent: function(event) {
    var self = this;
    var key = this.generateEventKey(event);
    var item = this.reduceItem(key, event, this.state.view.groups)

    // We need to check if an event with this key already exists and if so replace it
    var updated = this.state.data.some(function(reducedItem, i, reducedItems) {
      if (reducedItem.key == key) {
        reducedItems[i] = item;
        reducedItems = self.collapseData(reducedItems);
        return true;
      }
      return false;
    });

    // If the key doesn't exist, we need to add the item and re-sort / collapse
    if (!updated) {
      this.state.data.push(item);
      this.state.data = this.collapseData(this.sortData(this.state.data));
    }

    this.setState(this.state);
  },

  /**
   * Handler for socket.io 'notify' event
   * @param  {Object} event A notification event
   */
  onSocketNotify: function(event) {
    this.addEvent(event);
  }

});

//--------------------------------------------------------------------------

var RundownTableHead = React.createClass({

  getDefaultProps: function() {
    return {
      view: {}
    };
  },

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
    var trNodes = this.props.data.map(function(item, i) {
      return (
        <RundownTableRow key={i} item={item} />
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