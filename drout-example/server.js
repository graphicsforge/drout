const server = require("http").createServer();
const Drout = require("drout");
const express = require("express");
const app = express();

app.use(Drout.render({
  componentId: "drout-config-store-fs",
  path: "./config.json",
}));
server.on("request", app);
server.listen(3000, function () {
  console.log("restarted webserver");
});
