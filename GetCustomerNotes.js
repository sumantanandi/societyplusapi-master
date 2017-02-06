'use strict';
var request = require("request");
var nforce = require('nforce');
var fs = require("fs");
var path = require("path");
var moment = require('moment');
var org = "";
var oauth;
var counter = 0;
var access_token = "3BbszTGeIRQWlhPg9izUyooHB59zoYd7nA2bth1p/SKRQEQB8cj2Y1c+/pPAZdkm";
var environment = process.env.NODE_ENV || 'local';
var attachment = {};
var attachment = '';
var text;
var salesforceApplicantID;


function updateNoteSalesforce(text, salesforceApplicantID) {
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
    org.authenticate({ username: username, password: password, securityToken: token }, function (err, resp) {
        if (!err) oauth = resp;
        console.log(" Salesforce ID : ", salesforceApplicantID);
        console.log(" Customer Note : ", text);
        insertDocumentAttachment(text, oauth, salesforceApplicantID);

        if (err) {
            console.error('unable to authenticate to sfdc');
        }
    });

}


function insertDocumentAttachment(application, oauth, salesforceID) {
    //add attachment

    console.log(' Inside create Attachment   :');
    console.log(oauth);
    var attachmentName = 'Launchpad-NOTE- ' + salesforceID + ".txt";
    var attachment = nforce.createSObject('Note'); //Attachment
    attachment.set('Title',attachmentName);
    attachment.set('Body',application);
    attachment.set('ParentId',salesforceID);
    attachment.set('Id',salesforceID);
    /*attachment.setAttachment(attachmentName, JSON.stringify(application));
    attachment.set('Name', attachmentName);
    attachment.set('ParentId', salesforceID);
    attachment.set('Id', salesforceID);*/

    //var attachmentDoc = createAttachment(application, salesforceID);
    if (attachment) {
        org.insert({ sobject: attachment, oauth: oauth }, function (err, resp) {
            if (!err) console.log('It worked !! attachment');
            if (err) {
                console.log('ERROR MESSAGE :attachment', err);
            }
        });

    }
}



exports.getCustomerNotes = (accountID, finalAccount) => {
    console.log(" Get Customer ID for Account ID :: in LaunchPad");
    var apiRequestURL = 'https://service.boostability.com/api/partner/v3/customers/bymerchantid/' + finalAccount + '/id';
    return new Promise(function (resolve, reject) {
        console.log(" Get Customer ID for Account ID :: in LaunchPad", apiRequestURL);
        console.log(" FINAL AccountID  ::", finalAccount);
        console.log(" Account ID  :: ------------ ", accountID);

        var options = {
            method: 'GET',
            url: apiRequestURL,
            json: true,
            headers:
            {
                'Content-Type': 'application/json',
                'Authorization': access_token //'Bearer '
            },
            //body: bodyObj
        };
        request(options, function (error, response, body) {
            //console.log(response);
            var customerId = body;
            console.log("CUSTOMER ID CREATED IN LAUNCH PAD ::::::::::: ", customerId);
            //counter = counter + 1;
            setTimeout(function () {
                console.log('Change Status of Case ID Salesforce Application ');
                getCustomerNotes(customerId, accountID); // Retrieve Customer Note Details 
                //updateChatter(caseNumber, customerId);
            }, 5000);//interval * counter, counter

            if (error) {
                reject(error);
            }
            else if ([200, 201, 202, 204].indexOf(response.statusCode) > -1) {
                resolve({ provider: "LaunchPad API ", messageId: body.messageId });
            }
            else {
                reject('error to create customer to LaunchPad ' + response.statusCode);
            }
        });

    });

    /* createAttachment = (application, salesforceID) => {
          console.log(' Inside create Attachment   :');
          var attachmentName = 'Launchpad ' + salesforceID + ".txt";
          var attachment = nforce.createSObject('Attachment');
          //var textObj = "";
          var conversationData = [];
          attachment.setAttachment(file, JSON.stringify(conversationData));
          attachment.set('Name', attachmentName);
          attachment.set('ParentId', salesforceID);
          return attachment;
      }*/



    function getCustomerNotes(customerID, accountID) {
        console.log(" Get Customer Notes from Customer ID :: in LaunchPad");
        var apiRequestURLNotes = 'https://service.boostability.com/api/partner/v3/customers/' + customerID + '/notes';
        return new Promise(function (resolve, reject) {
            console.log(" Get Customer Notes From Customer ID :: in LaunchPad");
            console.log(" customerID  ::", customerID);

            var options = {
                method: 'GET',
                url: apiRequestURLNotes,
                json: true,
                headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': access_token //'Bearer '
                },
                //body: bodyObj
            };
            request(options, function (error, response, body) {
                //console.log(response);
                var customerNotes = body;
                console.log("CUSTOMER NOTES AVAILABLE IN LAUNCH PAD ::::::::::: ", customerNotes);
                if (customerNotes) {
                    customerNotes.forEach(function (note) {
                        var textInformation = note.text;
                        var userFullName = note.userFullName;
                        var insertedDate = note.insertedDate;
                        var userId = note.userId;
                        console.log("--------------------------");
                        console.log(" textInformation :: ", textInformation);
                        console.log(" userFullName :: ", userFullName);
                        console.log(" insertedDate :: ", insertedDate);
                        console.log(" userId :: ", userId);
                        console.log("---------------------------");
                        //insertDocumentAttachment(textInformation, oauth, accountID);
                        /* Logic to filter out the note which is not created with in 10 mins */
                        //var insertedDate = '2017-02-02T11:45:24.32';
                        var startTime = insertedDate.substring(11, 19);
                        var endTime = moment().format().substring(11, 19);
                        console.log("START TIME :: ", startTime);
                        console.log("END TIME :: ", endTime);
                        var mins = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("mm");
                        var TotalHours = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("HH");
                        console.log(" TIME DIFF :: IN mins ", mins);
                        console.log(" TIME DIFF :: IN Hour ", TotalHours);
                         updateNoteSalesforce(textInformation, accountID);
                        /*if (TotalHours == '00') {
                            if (mins <= 10) {
                                console.log(" Update notes in Salesforce ");
                                 updateNoteSalesforce(textInformation, accountID);
                            }
                        }*/

                       
                    }, this);
                }
                setTimeout(function () {
                    console.log('Change Status of Case ID Salesforce Application ');
                    //insertDocumentAttachment(application, oauth, salesforceApplicantID);
                    //getCustomerNotes(customerId); // Retrieve Customer Note Details 
                    //updateChatter(caseNumber, customerId);

                }, 5000);//interval * counter, counter

                if (error) {
                    reject(error);
                }
                else if ([200, 201, 202, 204].indexOf(response.statusCode) > -1) {
                    resolve({ provider: "LaunchPad API ", messageId: body.messageId });
                }
                else {
                    reject('error to create customer to LaunchPad ' + response.statusCode);
                }
            });

        });


    }


}