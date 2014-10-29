/**
 * rundown.js
 */
(function() {

  'use strict';

  var events = require('events');
  var eventEmitter = new events.EventEmitter();
  var config, io, ioSocket, storage, datasets = {};

  /**
   * Return the key to group the event as denoted by params by
   *
   * @param  {Object} params - The key/value params object
   * @param  {Array} groupBy - The array of param keys to generate the key for
   * @return {String} - The generated key
   */
  var buildKey = function(params, groupBy) {

    var keyVals = [];
    groupBy.forEach(function(keyParam) {
      if (params[keyParam]) {
        keyVals.push(params[keyParam]);
      } else {
        keyVals.push('');
      }
    });

    return keyVals.join(':');

  };

  /**
   * Handle flushing to persistence of named dataset
   *
   * @param  {String} name - The dataset name
   * @param  {Function} cb - Callback, takes err, result
   */
  var flushDataset = function(name, cb) {

    var flushMethod = config.datasets[name].flushMethod;

    // Immediate? Save the dataset now
    if (flushMethod == 'immediate') {
      storage.saveDataset(name, datasets[name], cb);
    }

    // No flushing mechanism - do nothing
    else {
      cb(null, true);
    }

    return;
  }

  module.exports = {

    /**
     * @param  {Object} options.config
     * @return {Object}
     */
    init: function(options) {

      config = options.config;
      io = options.io;

      // Initialize Rundown storage module
      storage = require('./storage/' + config.storage.type).init(config.storage.options);

      // Initialize Socket.io handling
      io.on('connection', function(socket) {
        console.log('a user connected');

        // Broadcast notifications to connected clients
        eventEmitter.on('notify', function(params) {
          socket.emit('notify', params);
        });
      });

      /**
       * Initialize in-process datasets
       */
      Object.keys(config.datasets).forEach(function(key) {

        // Attempt to load from storage, otherwise default to empty
        storage.loadDataset(key, function(err, dataset) {
          if (!err) {
            datasets[key] = dataset;
          } else {
            datasets[key] = {};
          }
        });
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

          // Add current timestamp if one hasn't been specified
          if (!validParams.timestamp) {
            validParams.timestamp = Math.round(Date.now() / 1000);
          }

          // Build our groupBy key
          var key = buildKey(validParams, dsConfig.groupBy);

          // Get our dataset
          var dataset = datasets[dsName];
          if (!dataset[key]) {
            dataset[key] = [];
          }

          // Handle keepCount setting
          var kc = dsConfig.keepCount,
              curlen = dataset[key].length;

          if (kc && curlen >= kc) {
            dataset[key] = dataset[key].slice(Math.max(curlen - kc, 1));
          }

          // Add event to dataset
          validParams['rd-dataset'] = dsName;
          dataset[key].push(validParams);

          // Broadcast event via socket.io
          eventEmitter.emit('notify', validParams);

          // Handle flushing
          flushDataset(dsName, function(err, msg) {

            // Return via callback
            if (err) {
              cb(err, null);
            } else {
              cb(null, true);
            }

          });

          return;
        },

        /**
         * Get dataset information
         *
         * @param {String} name - The name of the dataset
         * @param {Function} cb - Takes err and data as params
         */
        getDataset: function(name, cb) {

          if (!config.datasets[name]) {
            cb({'code': 'DATASET_NOTFOUND:'+name}, null);
            return;
          }
          var dsConfig = config.datasets[name];

          cb(null, {
            'config': dsConfig,
            'data': datasets[name]
          });
        }

      };

    }

  };

}());

