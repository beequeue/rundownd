/**
 * flatfile.js
 */
(function() {

  'use strict';

  var fs = require('fs'),
      path = require('path');

  var directory;

  var getDatasetFilename = function(datasetName) {
    return path.join(directory, datasetName + '.json');
  };

  module.exports = {

    /**
     * @param  {Object} options.directory - Directory in which to store flatfiles
     * @return {Object}
     */
    init: function(options) {

      directory = path.resolve(options.directory);

      return {

        loadDataset: function(name, cb) {
          var filename = getDatasetFilename(name);
          fs.readFile(filename, function(err, data) {
            if (data) {
              var obj = JSON.parse(data);
              cb(err, obj);
            } else {
              cb(err, null);
            }
          });
        },

        saveDataset: function(name, dataset, cb) {
          var filename = getDatasetFilename(name);
          fs.writeFile(filename, JSON.stringify(dataset), function(err) {
            if (err) {
              cb(err, null);
            } else {
              cb(null, true);
            }
          });
        }

      };

    }

  };

}());

