(function() {

  'use strict';

  var fs = require('fs');

  module.exports = {

    /**
     * Load and return the config specified in the passed file
     *
     * @param  {String} file - Config file
     * @return {Object}
     */
    load: function(file) {

      var config = eval('config = ' + fs.readFileSync(file));

      return config;
    },

    /**
     * Return the default config
     *
     * @return {Object} - A config object
     */
    getDefaults: function() {

      return {
        "port": 3000
      };

    }

  };

}());

