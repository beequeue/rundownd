

module.exports = {

  /**
   * Initialize API module
   */
  init: function(options) {

    var rundown = options.rundown;

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
      }

    };

  }

}