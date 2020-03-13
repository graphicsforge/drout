var Drout = require("./lib/drout.js");
var http_server = require("http").createServer(httpHandler);
var socket_server = require('socket.io')(http_server);
var fs = require('fs');

var http_port = 3000;

var render_on_client = {
  "test_int": 5,
  "test_string": "this is only a test",
  "child_object": {
    "child_string": "this is in the child object"
  },
  "has_property": true
};
var render_on_server = {
  "child_object": {
    "wow_strings": "such strings!",
    "inner_child_object": {
      "inner_child_string": "within the child object"
    }
  },
  "stuff": true
};

var drout = Drout.boilerplate();

function stringifyReplacer(key, value) {
  return key.match(/^_drout_/)?undefined:value;
}

function httpHandler(request, response) {
  console.log(`request for ${request.url}`);
  // TODO abstract away this junk
  // we should on-the-fly browserify
  if (request.url=="/drout/drout.js") {
    fs.readFile("./build/drout.js", function(err, data) {
      response.end(data);
    });
    return;
  }

  if (request.url=="/") {
    drout.render(render_on_server, function(err, output) {
      response.write(`
        <!DOCTYPE html><style>${Drout.css}</style>
        <script src="/socket.io/socket.io.js"></script>
        <script src="/drout/drout.js"></script>
        <script>
          // attach onload event polyfill?
          if(typeof(window.attachEvent)=='undefined') {
            if(window.onload) {
              window.attachEvent = function(type, callback) {
                if (type.toLowerCase()!=='onload') return;
                var current_onload = window.onload;
                var new_onload = function() {
                  current_onload();
                  callback();
                };
                window.onload = newonload;
              }
            } else {
              window.attachEvent = function(type, callback) {
                if (type.toLowerCase()!=='onload') return;
                window.onload = callback;
              }
            }
          }

          var Drout = require('drout');
          var drout = new Drout();
          var render_on_client = ${JSON.stringify(render_on_client, stringifyReplacer)};
          //drout.render(render_on_client, function(err, out) {
          //  document.querySelector("html").innerHTML += "<hr>rendered on client side"+out;
          //});
          var socket = io('http://localhost:${http_port}');
        </script>
      `); // response.write
      response.end(`<html><hr>rendered on the server${output}</html>`);
    }); // drout.render
  }

  response.end("unhandled endpoint");
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


