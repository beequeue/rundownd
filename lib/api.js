

module.exports = {

  /**
   * Initialize API module
   */
  init: function(options) {

    var rundown = options.rundown,
        io = options.io;

    return {

      /**
       * Handler for incoming notification
       */
      notify: function(req, res) {
        var params = req.query;
        rundown.notify(params, function(err, result) {
          if(err) {
            res.status(500).json(err);
          } else {
            res.status(200).send('OK');
          }
        });
      },

      /**
       * Handler for dataset request
       */
      getDataset: function(req, res) {
        rundown.getDataset(req.params.name, function(err, data) {
          if(err) {
            res.status(500).json(err);
          } else {
            res.status(200).json(data);
          }
        });
      }

    };

  }

}