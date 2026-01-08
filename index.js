"use strict";
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
const fs = require("fs");
const cors = require("cors");
var config = require("config");
const port = config.get("configuration.port");
// var morgan = require("morgan-body");
// var moment = require("moment");

const { initSocket } = require("./sockets/socket");

var app = express();


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://healine-836d0.web.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// app.use(express.static("uploads"));
app.use(express.static(path.join(__dirname, "uploads")))
// app.use("/static", express.static("uploads/establishment"));
// app.use(
//   "/static",
//   express.static(path.join(__dirname, "uploads/establishment"))
// );
// app.use(express.static(path.join(__dirname, "uploads")));
app.use(
  cors(
    {
      origin: '*',
      credentials: true,
    }
  ));
// app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
// app.use(bodyParser.json({ limit: "50mb" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/public", express.static(path.join(__dirname, "public")));
// app.use("/static", express.static("./uploads/establishment/"));

// app.use("/static", express.static("./api/server/upload/PassportImage/"));

// log file create
// var log = fs.createWriteStream(path.join(__dirname + "/logs", moment().format('YYYY-MM-DD') + ".log"), { flags: "a" });
// logs
// morgan(app, {
//   noColors: true,
//   stream: log,
//   maxBodyLength: 1000000
// });
// route grouping
// const checkLog = (app) => {
//   var originalSend = app.response.send;
//   app.response.send = function sendOverWrite(body) {
//     originalSend.call(this, body);
//     // console.log(JSON.stringify(body));
//   };
// };

// admin route
app.use("/api/admin", require("./routes/admin/index.routes"));
app.use("/api/admin/notify", require("./routes/admin/notify.router"));

// checkLog(app);

const server = app.listen(port, () => {
  console.log(`The demo app is up on port ${port}`);
});

// Initialize Promotion Scheduler
const { initializeScheduler } = require('./services/promotion_scheduler');
initializeScheduler();

initSocket(server);

module.exports = app;