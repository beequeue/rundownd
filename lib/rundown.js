/**
 * rundown.js
 */
(function() {

  'use strict';

  module.exports = {

    /**
     * @param  {Object} options.config
     * @return {Object}
     */
    init: function(options) {

      var config = options.config;

      // Initialize Rundown storage module
      var storage = require('./storage/' + config.storage.type).init(config.storage.options);

      /**
       * Initialize in-process datasets
       */
      var datasets = {};
      Object.keys(config.datasets).forEach(function(key) {
        datasets[key] = [];
      });

      return {

        /**
         * Process a notification
         *
         * @param {Object} params
         * @param {Function} cb - Takes err and res as params
         */
        notify: function(params, cb) {

          var dsName = params['rd-dataset'] ? params['rd-dataset'] : 'default';
          if (!config.datasets[dsName]) {
            cb({'code': 'DATASET_NOTFOUND:'+params['rd-dataset']}, null);
            return;
          }
          var dsConfig = config.datasets[dsName];

          // Get valid param data
          var validParams = {};
          Object.keys(params).forEach(function(key) {
            var val = params[key];
            if (dsConfig.params.indexOf(key) > -1) {
              validParams[key] = val;
            }
          });

          // Add current datetime if one hasn't been specified
          if (!validParams.datetime) {
            validParams.datetime = new Date();
          }

          var dataset = datasets[dsName];
          dataset.push(validParams);

          cb(null, true);
          return;
        }

      };

    }

  };

}());

