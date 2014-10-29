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

    this.init();
  }

  Plugin.prototype = {

    init: function() {

      var opts = this.options,
          self = this;

      // Get dataset config and current data
      $.ajax({
        url: "api/dataset/" + opts.dataset
      }).success(function(data) {
        console.log(data);
        self.setupView(data.config.views[0]);
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

    setupView: function(view) {
      var el = $(this.element),
          table = $('<table><thead><tr/></thead><tbody/></table>');

      $.each(view.groups, function(idx, group) {
        console.log(group);
        table.find('thead tr').append('<th>' + group.display + '</th>');
      });

      el.empty();
      el.append(table);
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