

function RundownFilter(param, values) {

  // The param we are filtering on
  this.param = param;

  // The list of possible values we can filter
  this.values = values || [];

  // The currently visible values
  this.activeValues = [];

  // Flag indicating whether we skip the filter and just show everything
  // i.e. if ture, the filter is bypassed.
  this.showAll = false;

};

/**
 * Add a filter value to the list of possibles
 * @param {string} value The value to add
 */
RundownFilter.prototype.addValue = function(value) {
  if (this.values.indexOf(value) === -1) {
    this.values.push(value);
    this.values.sort();
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

//------------------------------------------------------------

var RundownTable = React.createClass({

  getInitialState: function() {
    return {
      data: {},
      config: {},
      view: {
        title: 'Loading...'
      },
      filters: {}
    };
  },

  getDefaultProps: function() {
    return {
      dataset: 'default'
    };
  },

  /**
   * Return an array of filter objects for the necessary groups in the array passed
   * @param  {Object[] groups  An array of group objects
   * @return {Object} An object with param names as keys and RundownFilter objects as values
   */
  createFilters: function(groups) {
    var filters = {};
    groups.map(function(group) {
      if (group.hasFilter) {
        filters[group.param] = new RundownFilter(group.param);
      }
    });
    return filters;
  },

  updatefiltersFromItem: function(filters, item) {
    Object.keys(filters).forEach(function(key) {
      if (item[key]) {
        filters[key].addValue(item[key]);
      }
    });
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

        // Construct the necessary filters based on our groups
        var filters = self.createFilters(view.groups);

        self.setState({
          config: resp.config,
          view: view,
          filters: filters
        });

        // Reduce the data down to something more suitable for UI
        Object.keys(resp.data).forEach(function(key) {

          var item = resp.data[key].slice(-1)[0];
          self.updatefiltersFromItem(filters, item);

          var reducedItem = self.reduceItem(key, item, view.groups);
          reducedData.push(reducedItem);
        });

        // Sort data ...
        reducedData = self.sortData(reducedData);

        // ... then filter it ...
        var filteredData = self.filterData(reducedData);

        // ... then collapse it ....
        filteredData = self.collapseData(filteredData);

        self.setState({
          data: reducedData,
          filteredData: filteredData,
          config: resp.config,
          view: view,
          filters: filters
        });

        // Setup socket.io listener
        self.props.socket.on('notify', self.onSocketNotify);
      },
      error: function(xhr, status, err) {
        console.error(self.props.url, status, err.toString());
      }
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

  filterData: function(reducedData) {
    var filters = this.state.filters;
    var groups = this.state.view.groups;
    var filter, param;
    console.log(filters);
    console.log(groups);
    reducedData.map(function(item, rowNum, data) {

      for (var i = 0; i < item.cols.length; i++) {
        // Get the filter for this item
        param = groups[i].param;
        if (filters[param]) {
          filter = filters[param];
          // Is the filter allowing this value through?
          if (filter.isActive(item.cols[i])) {
            item.isHidden = false;
          } else {
            item.isHidden = true;
            break;
          }
        } else {
          // We don't have a filter for this column, let it show
          item.isHidden = false;
        }
      }

      //console.log(item);
    });
    return reducedData;
  },


  /**
   * Add cell collapse cues for vertically neighbouring cells that contain the same data
   * These cues are in the form of an array of bools - if a given index is set to true
   * then the cell at that index can be collapsed.
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
          <RundownTableHead view={this.state.view} filters={this.state.filters} />
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
        reducedItems = self.collapseData(self.filterData(reducedItems));
        return true;
      }
      return false;
    });

    // If the key doesn't exist, we need to add the item and re-sort / collapse
    if (!updated) {
      this.state.data.push(item);
      this.state.data = this.collapseData(this.filterData(this.sortData(this.state.data)));
    }

    this.setState(this.state);
  },

  repaint: function() {
    this.state.data = this.collapseData(this.filterData(this.sortData(this.state.data)));
    this.setState(this.state);
  }

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
    var self = this;
    if (!this.props.view.groups) {
      return (<thead/>);
    }
    var thNodes = this.props.view.groups.map(function(group) {

      // Do we have a filter?
      var filter = null;
      if (self.props.filters[group.param]) {
        filter = <RundownTableFilter filter={self.props.filters[group.param]} />
      }

      return (
        <th key={group.param}>
          {group.display}
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
      <tr className={item.isHidden ? "hidden" : ""}>
        {tdNodes}
      </tr>
    );
  }

});

//--------------------------------------------------------------------------

var RundownTableFilter = React.createClass({

  handleChange: function(event) {
    var cb = event.target;
    var filter = this.props.filter;
    if (cb.checked) {
      filter.showValue(cb.value);
    } else {
      filter.hideValue(cb.value);
    }

    console.log(filter.activeValues);

  },

  render: function() {
    var self = this;
    var filter = this.props.filter;
    var liNodes = filter.values.map(function(val, i) {
      var cbName = filter.param + '_' + val;
      return (
        <li>
          <input type="checkbox" key={i} id={cbName} value={val} onChange={self.handleChange}/>
          <label htmlFor={cbName}>{val}</label>
        </li>
      );
    });
    return (
      <ul>
        {liNodes}
      </ul>
    );
  }

});


//--------------------------------------------------------------------------

React.render(
  <RundownTable socket={io()} />,
  document.getElementById('rundown-container')
);