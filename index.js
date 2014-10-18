var express = require('express');

// Get config
if (process.argv.length >= 3) {
  config = require('./lib/config').load(process.argv[2]);
} else {
  config = require('./lib/config').getDefaults();
}

// Initialize Rundown module and API
var rundown = require('./lib/rundown').init({config: config}),
    api = require('./lib/api').init({rundown: rundown});

var app = express();

// Serve static files
app.use(express.static(__dirname + '/public'));

// API routing
app.get('/notify', api.notify);

// Fire up server
var server = app.listen(config.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('RundownD listening at http://%s:%s', host, port)

});

