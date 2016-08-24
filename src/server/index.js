
// Get config
if (process.argv.length >= 3) {
  config = require('./lib/config').load(process.argv[2]);
} else {
  config = require('./lib/config').getDefaults();
}

// Initialize express
var express = require('express'),
    app = express();

// Fire up server
var server = app.listen(config.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('RundownD listening at http://%s:%s', host, port)

});

// Initialize Rundown module and API
var io = require('socket.io').listen(server),
    rundown = require('./lib/rundown').init({config: config, io: io}),
    api = require('./lib/api').init({rundown: rundown});

// Serve static files
app.use(express.static(__dirname + '/../../public'));

// API routing
app.get('/notify', api.notify);
app.get('/api/dataset/:name', api.getDataset);
