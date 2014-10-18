/**
 * flatfile.js
 */
(function() {

  'use strict';

  module.exports = {

    /**
     * @param  {Object} options.directory - Directory in which to store flatfiles
     * @return {Object}
     */
    init: function(options) {

      var directory = options.directory;

      return {

        /**
         *
         *
         * @param {Object} params
         */
        loadDataset: function(name, cb) {

        },

        saveDataset: function(name, dataset, cb) {

        }

      };

    }

  };

}());

