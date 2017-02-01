'use strict';
var express = require("express");
var fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");

var environment = process.env.NODE_ENV || 'local';
exports.environment = environment;

var EventEmitter = require('events').EventEmitter;
//var societyclient = require('./libs/societyclient');
//var credential = require('./model/Credential');
//var applicationStore = require('./libs/salesforceConnect');

var applicationStore = require('./CreateCustomerLP');
var salesforceConnection = require('./SalesforceConnect');


var fetchBasicAuthFromDatabase = {};
var fetchBasicAuthFromConfig = {};

// When we submit an appication it can take a long time
var submitApplicationProcess = new EventEmitter();

/**
 * Offline processing of an application should be handled here. Ensure that the
 * processing status is updated when you are done.
 */
submitApplicationProcess.on('submit-application', function (application) {
  //console.log(" submit submitApplicationProcess ", application)
  //applicationStore.sendMessage(application); //A131909 A130016
  //var application = req.body.id;
  salesforceConnection.saveApplication(application);
});

var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("Sensis application now running on port", port);
});

console.log(" NODE ENV ", environment);




// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ "error": message });
}

// Generic Success handler used by all endpoints.
function handleSucess(res, reason, message, code) {
  console.log("SUCCESS: " + reason);
  res.status(code || 201).json({ "success": message });
}



//app.all("/*", auth);

app.post("/api/v0/application", function (req, res) {
  //var newContact = req.body; //case number
  var app = req.body.id;
  //var content = req.body.content;
  console.log("Origination Application Notification Received:", app);
  //newContact.createDate = new Date();
  console.log("Case Number : " + app);
  submitApplicationProcess.emit('submit-application', req);
  //emit sync response
  handleSucess(res, "Received Case Information ", 201);
  res.end();
});
module.exports = app;