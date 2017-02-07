'use strict';
var express = require("express");
var fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var request = require("request");
var nforce = require('nforce');
var moment = require('moment');
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
var getCustomerNotes = require('./GetCustomerNotes');


var fetchBasicAuthFromDatabase = {};
var fetchBasicAuthFromConfig = {};
var calls = [];

// When we submit an appication it can take a long time
var submitApplicationProcess = new EventEmitter();
var submitNotificationProcess = new EventEmitter();

submitNotificationProcess.on('update-application', function (application) {
  console.log(" UPDATE NOTE APPLICATION :: ", environment);
  var serviceType = "Sensis Website";
  var accountTemp = "100003048310"; //customer_number__c 100003048310 old : 100003047799
  var status = 'Live'; //csord__status__c
  //var queryToGetAccountDetails = 'SELECT id,Account_Id__c,Account__c,csord__Status__c,Service_Type__c,csord__Order__r.csord__Account__r.Legacy_Customer_Number__c  FROM csord__Service__c where Service_Type__c =  \'' + serviceType + '\'' + ' and Account_Id__c = \'' + accountTemp +'\'';
  //Legacy_Customer_Number__c 
  var queryToGetAccountDetails = 'SELECT id,Account_Id__c,Customer_Number__c,Account__c,csord__Status__c,Service_Type__c,csord__Order__r.csord__Account__r.Legacy_Customer_Number__c  FROM csord__Service__c where Service_Type__c =  \'' + serviceType + '\'' + ' and customer_number__c = \'' + accountTemp + '\'';
  //queryToGetAccountDetails = queryToGetAccountDetails + ' and csord__status__c = \'' + status + '\'';
  //queryToGetAccountDetails = queryToGetAccountDetails +  '\'';
  console.log("queryToGetAccountDetails ", queryToGetAccountDetails);
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
      org.query({ query: queryToGetAccountDetails, oauth: oauth }, function (err, resp) {
        if (err) throw err;
        if (resp.records && resp.records.length) {
          //setTimeout(function () {
          resp.records.forEach(function (rec) {
            counter = counter + 1;
            console.log(rec);
            var accountID = rec.get('Account_Id__c');
            var legacyAccountNumber = rec.get('csord__order__r');
            var finalAccount = rec.get('Customer_Number__c');//legacyAccountNumber.csord__Account__r.Legacy_Customer_Number__c;
            var externalAccountID = rec.get('id');
            console.log('Account ID : ' + finalAccount);
            //console.log('legacyAccountNumber : ' + legacyAccountNumber);
            //console.log('finalAccount : ' + finalAccount);
            console.log('externalAccountID : ' + externalAccountID);
            console.log('counter: ' + counter);
            //console.log('Change Status of Case ID Salesforce Application ', caseNumber);

            setTimeout(function (counter) {
              console.log(" test contd");
              getCustomerNotes.getCustomerNotes(externalAccountID, finalAccount);
            }, interval * counter, counter);


          });
          //}, 5000);
        }
      });
    }
  });


  //salesforceConnection.saveApplication(caseNumber);
});

/**
 * Offline processing of an application should be handled here. Ensure that the
 * processing status is updated when you are done.
 */
submitApplicationProcess.on('submit-application', function (application) {
  console.log(" Inside Emitter function ");
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
          console.error('Case Loop to sfdc');
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
            }, 5000);


          });
          //}, 5000);interval * counter, counter);
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

app.post("/api/v0/updatenote", function (req, res) {
  //var newContact = req.body; //case number
  var caseNo = req.body.id;
  //var content = req.body.content;
  console.log("Update Note Scheduler Started :", app);
  //newContact.createDate = new Date();
  console.log("Case Number : " + caseNo);
  submitNotificationProcess.emit('update-application', req);
  //emit sync response
  handleSucess(res, "Received Note Notification ", 201);
  res.end();
});

module.exports = app;