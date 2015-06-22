/**
 * RundownD jQuery plugin
 */
;(function ( $, window, document, undefined ) {

  // Create the defaults once
  var pluginName = "rundownd",
      defaults = {
        dataset: "default",
        socket: null
      };

  // The actual plugin constructor
  function Plugin( element, options ) {

    this.element = element;

    this.options = $.extend( {}, defaults, options) ;

    this._defaults = defaults;
    this._name = pluginName;

    this.dataset = null;
    this.curView = null;
    this.groupBy = null;

    this.init();
  }

  Plugin.prototype = {

    /**
     * Initialize
     */
    init: function() {

      var self = this;
      var opts = this.options;

      // Do an initial pull on the data
      self.refresh();

      // Setup listener for incoming notifications
      opts.socket.on('notify', function(data) {

        // Check that this notification is meant for us
        if (data['rd-dataset'] != opts.dataset) {
          return;
        }

        self.refresh();
      });

    },

    /**
     * Do a full refresh of the UI
     */
    refresh: function() {

      var self = this;
      var opts = this.options;
      var el = $(this.element);

      // Get dataset config and current data
      $.ajax({

        url: "api/dataset/" + opts.dataset

      }).success(function(resp) {

        self.groupBy = resp.config.groupBy;
        self.view = resp.config.views[0];

        // Set up our data model
        self.hierarchy = {
          children: {},
          rowspan: 0
        };

        // Set up our view
        el.empty();

        // Add a header
        el.append($('<h1>' + self.view.title + '</h1>'));

        // Set up the table
        self.initTable(self.view);
        self.refreshHierarchy(resp.data);
        self.refreshTableData(self.hierarchy);

      }).error(function() {

        console.log(error);

      });

    },

    isGroupByParam: function(param) {

      return this.groupBy.indexOf(param) > -1;

    },

    /**
     * Add the passed event to the hierarchy and update the table
     */
    processEvent: function(event) {

      var self = this,
          level = self.hierarchy,
          groupCount = self.view.groups.length,
          prevLevels = [],
          paramVal,
          i = 0,
          prevLevelCount = 0,
          group = null;

      for (i = 0; i < groupCount; i++) {

        group = self.view.groups[i];
        paramVal = event[group.param];

        // If this is NOT a group by param, we need to overwrite it
        if (!self.isGroupByParam(group.param)) {
          level.children = {};
          level.rowspan = 0;
        }

        if (!level.children[paramVal]) {
          level.children[paramVal] = {
            children: {},
            rowspan: 0,
            param: group.param
          }
        }

        // Add a reference for later
        prevLevels.push(level);

        // Is this a leaf node?
        if (i == groupCount-1) {

          // Increase the row count of each parent
          prevLevels.forEach(function(prevLevel) {
            prevLevel.rowspan++;
          });

        } else {

          // Move to next level down
          level = level.children[paramVal];

        }

      }

    },

    /**
     * Add the table element and columns for the passed view
     */
    initTable: function(view) {

      var el = $(this.element),
          table = $('<table><thead><tr/></thead><tbody/></table>'),
          headTr = table.find('thead tr');

      $.each(view.groups, function(idx, group) {
        var th = $('<th>' + group.display + '</th>').data('param', group.param);
        headTr.append(th);
      });

      el.append(table);

    },

    /**
     * Use the passed in hierarchy to refresh the table data
     */
    refreshTableData: function(hierarchy) {

      var self = this,
          el = $(this.element),
          tbody = el.find('tbody');

      // Remove all table rows
      tbody.empty();

      self.addNodeToTable(tbody, null, hierarchy);
    },

    /**
     * Recursive helper function to populate table cells
     */
    addNodeToTable: function(tbody, curTr, node) {

      var tr,
          child,
          self = this,
          i = 0;

      // We want the keys to be ordered alphabetically
      var orderedKeys = Object.keys(node.children).sort();
      if (!orderedKeys.length) {
        return;
      }

      orderedKeys.forEach(function(val) {

        child = node.children[val];

        // If we've already added the first item at this level, go to a new row
        if (!curTr || ++i > 1) {
          tr = $('<tr/>');
          tbody.append(tr);
        } else {
          tr = curTr;
        }

        // Convert timestamps to... MySQL style datetime :)
        if (child.param == 'timestamp') {
          val = new Date(val*1000).toLocaleString('en-GB');
        }

        var newCell = $('<td>' + val + '</td>').attr('rowspan', child.rowspan);
        tr.append(newCell);

        // Recurse...
        self.addNodeToTable(tbody, tr, child);

      });

    },

    /**
     * Generate a hierarchy to represent our view with levels for each of the groups
     */
    refreshHierarchy: function(data) {

      var self = this;
      var event;

      $.each(data, function(key, values) {

        // Get the latest event for the group and process it
        event = values[values.length-1];
        self.processEvent(event);

      });

    }

  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName,
        new Plugin( this, options ));
      }
    });
  };

})( jQuery, window, document );