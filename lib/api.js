

module.exports = {

  init: function(options) {

    var rundown = options.rundown;

    return {

      /**
       * Handler for incoming notification
       */
      notify: function(req, res) {
        var params = req.query;
        rundown.notify(params);
        res.status(200).json(params);
      }

    };

  }

}