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

      var opts = this.options,
          self = this;

      // Get dataset config and current data
      $.ajax({

        url: "api/dataset/" + opts.dataset

      }).success(function(resp) {

        console.log(resp);

        self.groupBy = resp.config.groupBy;

        self.initTable(resp.config.views[0]);
        self.hierarchy = self.refreshHierarchy(resp.data);
        self.refreshTableData(self.hierarchy);

      }).error(function() {

        console.log(error);

      });

      // Setup listener for incoming notifications
      this.options.socket.on('notify', function(data) {

        // Check that this notification is meant for us
        if (data['rd-dataset'] != opts.dataset) {
          return;
        }

        console.log(data);
      });

    },

    /**
     * Add the table element and columns for the passed view
     */
    initTable: function(view) {

      var el = $(this.element),
          table = $('<table><thead><tr/></thead><tbody/></table>'),
          headTr = table.find('thead tr');

      this.view = view;

      $.each(view.groups, function(idx, group) {
        var th = $('<th>' + group.display + '</th>').data('param', group.param);
        headTr.append(th);
      });

      el.empty();
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
          self = this,
          i = 0;

      $.each(node.children, function(val, child) {

        // If we've already added the first item at this level, go to a new row
        if (!curTr || ++i > 1) {
          tr = $('<tr/>');
          tbody.append(tr);
        } else {
          tr = curTr;
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

      var self = this,
          paramVal,
          groupCount = self.view.groups.length,
          hierarchy = {
            children: {},
            rowspan: 0
          };

      $.each(data, function(key, values) {

        var level = hierarchy,
            prevLevels = [],
            ev = values[values.length-1],
            i = 0,
            prevLevelCount = 0,
            group = null;

        for (i = 0; i < groupCount; i++) {

          group = self.view.groups[i];
          paramVal = ev[group.param];

          if (!level.children[paramVal]) {
            level.children[paramVal] = {
              children: {},
              rowspan: 0
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

        // Move level back to top for next event sample
        level = hierarchy;
      });

      return hierarchy;
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