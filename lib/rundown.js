(function() {

  'use strict';

  module.exports = {

    /**
     * @param  {Object} options.config
     * @return {Object}
     */
    init: function(options) {

      var config = options.config;

      return {

        /**
         * Process a notification
         *
         * @param {Object} params
         */
        notify: function(params) {

          console.log('rundown.notify');

        }

      };

    }

  };

}());

