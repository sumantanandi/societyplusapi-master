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
        apiVersion: apiVersion,
        environment: sfdcEnvironment,
        mode: 'multi'
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

function updateNotesToChatter(text, salesforceApplicantID) {
    console.log(" Calling Salesforce Chatter Update Service ");
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
    var username = configuration[environment].salesforce.username;
    var password = configuration[environment].salesforce.password; //
    var token = configuration[environment].salesforce.securityToken;; //securityToken

    org = nforce.createConnection({
        loginUrl: loginUrl,
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
        apiVersion: apiVersion,
        environment: sfdcEnvironment,
        mode: 'multi',
        plugins: ['chatter']
    });

    org.authenticate({ username: username, password: password, securityToken: token }, function (err, oauth) {
        if (err) {
            console.error('unable to authenticate to sfdc');
        } else {
            setTimeout(function () {
                org.authenticate({ username: username, password: password, securityToken: token }, function (err, resp) {
                    if (!err) oauth = resp;
                    console.log("Salesforce ID ", salesforceApplicantID);
                    var chatterText = text;
                    org.chatter.postFeedItem({ id: salesforceApplicantID, text: chatterText, oauth: oauth }, function (err, resp) {
                        console.log(" --- update salesforce chatter for Notes--- ");
                        if (!err) console.log("resp");
                        if (err) console.log(err);
                    });
                });
            }, 10000);
        }
    });
}

function insertDocumentAttachment(application, oauth, salesforceID) {
    //add attachment
    console.log(' Inside create Attachment   :');
    console.log(oauth);
    var attachmentName = 'Launchpad-NOTE- ' + salesforceID + ".txt";
    var attachment = nforce.createSObject('Note'); //Attachment
    attachment.set('Title', attachmentName);
    attachment.set('Body', application);
    attachment.set('ParentId', salesforceID);
    attachment.set('Id', salesforceID);
    if (attachment) {
        org.insert({ sobject: attachment, oauth: oauth }, function (err, resp) {
            if (!err) console.log('It worked !! attachment');
            if (err) {
                console.log('ERROR MESSAGE :attachment', err);
            }
        });

    }
}


function getCustomerDetails(customerID) {

    var salesforceAccountID = "";
    console.log(" Get Customer Notes from Customer ID :: in LaunchPad --", customerID);
    var apiGETCustomerRequest = 'https://service.boostability.com/api/partner/v3/customers/' + customerID;
    return new Promise(function (resolve, reject) {
        var options = {
            method: 'GET',
            url: apiGETCustomerRequest,
            json: true,
            headers:
            {
                'Content-Type': 'application/json',
                'Authorization': access_token //'Bearer '
            },
        };
        request(options, function (error, response, body) {
            //console.log(response);
            var customerNotes = body;
            salesforceAccountID = body.merchantId;
            console.log("CUSTOMER ACCOUNT NUMBER AVAILABLE IN LAUNCH PAD ::::::::::: ", salesforceAccountID);
            /* Get Salesforce Account ID from LP Merchant ID */
            console.log(" Calling Salesforce Chatter Update Service ");
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

            var serviceType = "Sensis Website";
            var accountTemp = "100003048310";
            var status = 'Live';
            var externalAccountID = '';
            var finalAccount = '';

            var queryToGetAccountDetails = 'SELECT id,Account_Id__c,Customer_Number__c,Account__c,csord__Status__c,Service_Type__c,csord__Order__r.csord__Account__r.Legacy_Customer_Number__c  FROM csord__Service__c where Service_Type__c =  \'' + serviceType + '\'' + ' and customer_number__c = \'' + salesforceAccountID + '\''; //salesforceApplicantID
            console.log(" clientId : ", clientId);
            console.log(" clientSecret ", clientSecret);
            console.log(" sfdcEnvironment ", sfdcEnvironment);
            console.log(" token ", token);

            org = nforce.createConnection({
                loginUrl: loginUrl,
                clientId: clientId,
                clientSecret: clientSecret,
                redirectUri: redirectUri,
                apiVersion: apiVersion,
                environment: sfdcEnvironment,
                mode: 'multi',
                plugins: ['chatter']
            });
            org.authenticate({ username: username, password: password, securityToken: token }, function (err, oauth) {
                if (err) {
                    console.error('unable to authenticate to sfdc');
                } else {
                    org.query({ query: queryToGetAccountDetails, oauth: oauth }, function (err, resp) {
                        if (err) throw err;
                        if (resp.records && resp.records.length) {
                            resp.records.forEach(function (rec) {
                                var accountID = rec.get('Account_Id__c');
                                var legacyAccountNumber = rec.get('csord__order__r');
                                finalAccount = rec.get('Customer_Number__c');//legacyAccountNumber.csord__Account__r.Legacy_Customer_Number__c;
                                externalAccountID = rec.get('id');
                                console.log('Account ID : ' + finalAccount);
                                console.log('externalAccountID : ' + externalAccountID);
                            });
                            getLaunchpadNotes(customerID, externalAccountID)
                        }

                    });
                }

            });
            // getLaunchpadNotes(customerID, externalAccountID)
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

function getLaunchpadNotes(customerID, accountID) {
    var apiRequestURLNotes = 'https://service.boostability.com/api/partner/v3/customers/' + customerID + '/notes';
    console.log(" API End point ::: ", apiRequestURLNotes);
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
        };
        request(options, function (error, response, body) {
            var customerNotes = body;
            console.log("CUSTOMER NOTES AVAILABLE IN LAUNCH PAD ::::::::::: " + customerID + " NOTES " + customerNotes);
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
                    var startTime = insertedDate.substring(11, 19);
                    var endTime = moment().format().substring(11, 19);
                    console.log("START TIME :: ", startTime);
                    console.log("END TIME :: ", endTime);
                    var mins = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("mm");
                    var TotalHours = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("HH");
                    console.log(" TIME DIFF :: IN mins ", mins);
                    console.log(" TIME DIFF :: IN Hour ", TotalHours);
                    updateNotesToChatter(textInformation, accountID);
                    /*if (TotalHours == '00') {
                        if (mins <= 10) {
                            console.log(" Update notes in Salesforce ");
                             updateNoteSalesforce(textInformation, accountID);
                        }
                    }*/


                }, this);
            }
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


exports.getCustomerNoteInformation = (customerID) => {
    console.log(" CUSTOMER ID ", customerID);
    var counter = 0;
    var customerNumber = '';
    for (var i = 0; i < customerID.length; i++) {
        customerNumber = customerID.substring(counter, counter + 6);
        console.log("No Of Customer ID  :", customerNumber);
        getCustomerDetails(customerNumber);
        counter = counter + 6;
        i = counter;
    }

}

exports.getCustomerNotes = (accountID, finalAccount) => {
    console.log(" Get Customer ID for Account ID :: in LaunchPad");
    var apiRequestURL = 'https://service.boostability.com/api/partner/v3/customers/bymerchantid/' + finalAccount + '/id';
    return new Promise(function (resolve, reject) {
        console.log(" Get Customer ID for Account ID :: in LaunchPad", apiRequestURL);
        console.log(" FINAL AccountID  ::", finalAccount);
        console.log(" External Account ID  :: ------------ ", accountID);

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
            var customerId = body;
            console.log("CUSTOMER ID CREATED IN LAUNCH PAD ::::::::::: ", customerId);
            setTimeout(function () {
                console.log('Change Status of Case ID Salesforce Application ');
                getCustomerNotes(customerId, accountID); // Retrieve Customer Note Details 

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
            };
            request(options, function (error, response, body) {

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
                        var startTime = insertedDate.substring(11, 19);
                        var endTime = moment().format().substring(11, 19);
                        console.log("START TIME :: ", startTime);
                        console.log("END TIME :: ", endTime);
                        var mins = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("mm");
                        var TotalHours = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("HH");
                        console.log(" TIME DIFF :: IN mins ", mins);
                        console.log(" TIME DIFF :: IN Hour ", TotalHours);
                        //updateNoteSalesforce(textInformation, accountID);
                        updateNotesToChatter(textInformation, accountID);
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