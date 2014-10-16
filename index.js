var express = require('express'),
    config = require('./lib/config').load(process.argv[2]),
    rundown = require('./lib/rundown').init({config: config}),
    api = require('./lib/api').init({rundown: rundown});

var app = express();

// Serve static files
app.use(express.static(__dirname + '/public'));

// API routing
app.get('/notify', api.notify);


// Fire up server
var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('RundownD listening at http://%s:%s', host, port)

});

