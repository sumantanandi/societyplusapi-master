'use strict';
var express = require("express");
var fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require("request");
var nforce = require('nforce');
//var async  = require('async');
var org = "";
var oauth;

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
var calls = [];

// When we submit an appication it can take a long time
var submitApplicationProcess = new EventEmitter();

/**
 * Offline processing of an application should be handled here. Ensure that the
 * processing status is updated when you are done.
 */
submitApplicationProcess.on('submit-application', function (application) {
  var caseType = 'Websites Assign DAM';
  var caseStatus = 'In Progress'; //CaseNumber = \'' + caseNumber + '\'
  var queryToGetCase = 'select CaseNumber from case where Type = \'' + caseType + '\'  and Status = \'' + caseStatus + '\'';

  var configuration = JSON.parse(
    fs.readFileSync(path.join(__dirname, './config/configs.js'))
  );
  console.log(" NODE ENV IN EXPORT APPS", environment);
  var loginUrl = configuration[environment].salesforce.username;
  var clientId = configuration[environment].salesforce.clientId;
  var clientSecret = configuration[environment].salesforce.clientSecret;
  var redirectUri = configuration[environment].salesforce.redirectUri;
  var apiVersion = configuration[environment].salesforce.apiVersion;
  var sfdcEnvironment = configuration[environment].salesforce.environment;
  var username = configuration[environment].salesforce.username; //'gewsprod@ge.com.orig.orignzqa' //@lfs.com.orignzqa';
  var password = configuration[environment].salesforce.password; //
  var token = configuration[environment].salesforce.securityToken;; //securityToken
  var interval = 15 * 1000; // 5 seconds;
  var counter = 0;
  console.log(" clientId : ", clientId);
  console.log(" clientSecret ", clientSecret);
  console.log(" sfdcEnvironment ", sfdcEnvironment);
  console.log(" token ", token);

  org = nforce.createConnection({
    loginUrl: loginUrl,
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
    apiVersion: apiVersion,  // optional, defaults to current salesforce API version 
    environment: sfdcEnvironment,  // optional, salesforce 'sandbox' or 'production', production default 
    mode: 'multi' // optional, 'single' or 'multi' user mode, multi default 
  });

  org.authenticate({ username: username, password: password, securityToken: token }, function (err, oauth) {
    if (err) {
      console.error('unable to authenticate to sfdc');
    } else {
      org.query({ query: queryToGetCase, oauth: oauth }, function (err, resp) {
        if (err) throw err;
        if (resp.records && resp.records.length) {
          //setTimeout(function () {
          resp.records.forEach(function (rec) {
            counter = counter + 1;
            var caseNumber = rec.get('CaseNumber');
            console.log('Case ID : ' + caseNumber);
            console.log('counter: ' + counter);
            console.log('Change Status of Case ID Salesforce Application ', caseNumber);
            // async function getTrace (){
            console.log(" test contd ");
            // }

            setTimeout(function (counter) {
              console.log(" test contd");
              salesforceConnection.saveApplication(caseNumber);
            }, interval * counter, counter);


          });
          //}, 5000);
        }
      });
    }
  });


  //salesforceConnection.saveApplication(caseNumber);
});

/*async.parallel(calls, function() {
  console.log(AllLinks);
});*/

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
  var caseNo = req.body.id;
  //var content = req.body.content;
  console.log("Origination Application Notification Received:", app);
  //newContact.createDate = new Date();
  console.log("Case Number : " + caseNo);
  submitApplicationProcess.emit('submit-application', req);
  //emit sync response
  handleSucess(res, "Received Case Information ", 201);
  res.end();
});
module.exports = app;