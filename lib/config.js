(function() {

  'use strict';

  var fs = require('fs');

  module.exports = {

    /**
     * @param  {String} file - Config file
     * @return {Object}
     */
    load: function(file) {

      var config = eval('config = ' + fs.readFileSync(file));

      /*
      fs.readFile(file, function (err, data) {
        if (err) { throw err; }
      });
      */

      return config;
    }

  };

}());

