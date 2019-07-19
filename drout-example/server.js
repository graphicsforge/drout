const server = require('http').createServer();
const Drout = require("drout");
const express = require("express");
const app = express();

app.use(Drout.render({
  componentId: "drout-express",
  paths: {
    "/": {
      componentId: "test-include",
      content: {
        what: "up",
      },
    },
    "/wat": {
      content: "yo",
    },
  },
}));
server.on('request', app);
server.listen(3000, function () {
  console.log("restarted webserver");
});
