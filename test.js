var Drout = require("./lib/drout.js");
var http_server = require("http").createServer(httpHandler);
var socket_server = require('socket.io')(http_server);
var fs = require('fs');

var http_port = 3000;

var data = {
  "test_int": 5,
  "test_string": "this is only a test",
  "has_property": true
};
var drout = new Drout.DroutForm();

function httpHandler(request, response) {
  // TODO abstract away this junk
  // we should on-the-fly browserify
  if (request.url=="/drout/drout.js") {
    fs.readFile("./build/drout.js", function(err, data) {
      response.end(data);
    });
    return;
  }

  drout.render(data, function(err, output) {
    response.write(`
<!DOCTYPE html><style>${Drout.css}</style>
<script src="/socket.io/socket.io.js"></script>
<script src="/drout/drout.js"></script>
<script>
  var Drout = require('drout');
  var drout = new Drout.DroutForm();
  drout.render(${JSON.stringify(data)}, function(err, out){ document.innerHTML = out; });
  var socket = io('http://localhost:${http_port}');
</script>
    `);
    response.end(`<html>${output}</html>`);
  });
};

http_server.listen(http_port, function(){
  console.log(`test server listening on port ${http_port}`);
});


socket_server.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});


