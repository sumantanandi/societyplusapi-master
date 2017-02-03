'use strict';
var request = require("request");
var nforce = require('nforce');
var chatter = require('nforce-chatter')(nforce);
var randomstring = require("randomstring");
//var truncate = require('truncate');
//var dateFormat = require('dateformat');
var fs = require("fs");
var path = require("path");
var org = "";
var oauth;
var counter = 0;
var access_token = "3BbszTGeIRQWlhPg9izUyooHB59zoYd7nA2bth1p/SKRQEQB8cj2Y1c+/pPAZdkm";
var environment = process.env.NODE_ENV || 'local';


function updateChatter(salesforceCaseID, caseNumber, customerID) {

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
        mode: 'multi',
        plugins: ['chatter'] // optional, 'single' or 'multi' user mode, multi default postFeedItem
    });

    org.authenticate({ username: username, password: password, securityToken: token }, function (err, resp) {
        if (!err) oauth = resp;
        console.log("Salesforce ID ", salesforceCaseID);
        //org.chatter.postFeedItem({id: '500p0000003Ip70AAC', text: 'My Awesome Post!!'}, function(err, resp) {
        var chatterText = "Case ID : " + caseNumber + "  has been closed and LaunchPad Customer ID : " + customerID + " has been updated ";
        org.chatter.postFeedItem({ id: salesforceCaseID, text: chatterText, oauth: oauth }, function (err, resp) {
            console.log(" --- update salesforce chatter --- ");
            if (!err) console.log("resp");
            if (err) console.log(err);
        });
    });
}



function updateLaunchPadDetails(customerID) {
    console.log(" Calling Salesforce Object for Case to update customer ID");
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
        console.log(" Update Customer ID  in Case", customerID);
        //console.log(" Update Case  ID  in Case", caseID);
        var caseNumber = '03054754'; //03054754 03055059
        var caseInfo = 'SELECT Id,CaseNumber,Legacy_Case_ID__c,Legacy_Advertiser_ID__c,APF_Case_ID__c FROM Case  WHERE CaseNumber = \'' + caseNumber + '\'';
        org.query({ query: caseInfo, oauth: oauth }, function (err, resp) {

            if (!err && resp.records) {
                var caseHistory = resp.records[0];
                var salesforceCaseID = resp.records[0]._fields.id;
                console.log(" Case History :: ", caseHistory);
                console.log(" Samesforce Case ID :: ", salesforceCaseID);
                caseHistory.set('Id', salesforceCaseID);
                caseHistory.set('CaseNumber', caseNumber);
                caseHistory.set('Case_Comments__c', customerID);
                //caseHistory.setExternalId('Id', caseNumber);
                //caseHistory.setExternalId('Legacy_Advertiser_ID__c', caseNumber);
                //caseHistory.setExternalId('APF_Case_ID__c', caseNumber);
                //acc.set('Industry', 'Cleaners');
                //setTimeout(function () {
                org.update({ sobject: caseHistory, oauth: oauth }, function (err, resp) {
                    if (!err) console.log('It worked! Case Updated with Customer ID ');
                    if (err) {
                        console.log('ERROR MESSAGE :UPDATE ', err);
                    }
                });
                // }, 7000);

            }
        });

        if (err) {
            console.log('ERROR MESSAGE :Salesforce Object Calling ', err);
            //statusMessage = err.message;
        }
    });


}


function populateStatus(caseID, customerID) {

    console.log(" Calling Salesforce Object for case to change the status of the case ");
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
        console.log(" Update Customer ID  in Case", customerID);
        console.log(" Update Case  ID  in Case", caseID);
        //var caseNumber = '03055059';
        var caseInfo = 'SELECT Id,CaseNumber,Status,Legacy_Case_ID__c,Legacy_Advertiser_ID__c,APF_Case_ID__c FROM Case  WHERE CaseNumber = \'' + caseID + '\'';
        org.query({ query: caseInfo, oauth: oauth }, function (err, resp) {

            if (!err && resp.records) {
                var caseHistory = resp.records[0];
                var salesforceCaseID = resp.records[0]._fields.id;
                console.log(" Case History :: ", caseHistory);
                console.log(" Samesforce Case ID :: ", salesforceCaseID);
                caseHistory.set('Id', salesforceCaseID);
                caseHistory.set('CaseNumber', caseID);
                caseHistory.set('Status', 'Closed');
                caseHistory.set('Case_Comments__c', customerID);
                updateChatter(salesforceCaseID, caseID, customerID);
                //caseHistory.setExternalId('Id', caseNumber);
                //caseHistory.setExternalId('Legacy_Advertiser_ID__c', caseNumber);
                //caseHistory.setExternalId('APF_Case_ID__c', caseNumber);
                //acc.set('Industry', 'Cleaners');
                org.update({ sobject: caseHistory, oauth: oauth }, function (err, resp) {
                    if (!err) console.log('It worked! Case Closed ');
                    if (err) {
                        console.log('ERROR MESSAGE :UPDATE ', err);
                    }
                });

            }
        });

        if (err) {
            console.log('ERROR MESSAGE :Salesforce Object Calling ', err);
            //statusMessage = err.message;
        }
    });
}


exports.sendMessage = (accountID, accountName, caseNumber, contactFullName, contactFirstName, contactLastName, emailAddress, contactMobile, websiteDomain, productServiceID, totalrecurringCharges, productServiceType) => {
    return new Promise(function (resolve, reject) {
        console.log(" Message to create customer in LaunchPad");
        console.log(" caseNumber  ::", caseNumber);
        console.log(" contactFullName  ::", contactFullName);
        console.log(" accountID  ::", accountID);
        console.log(" accountName  ::", accountName);
        console.log(" contactFirstName  ::", contactFirstName);
        console.log(" contactLastName  ::", contactLastName);
        console.log(" emailAddress  ::", emailAddress);
        console.log(" contactMobile  ::", contactMobile);
        console.log(" websiteDomain  ::", websiteDomain);
        console.log(" productServiceID  ::", productServiceID);
        console.log("productServiceType ", productServiceType);
        console.log(" totalrecurringCharges  ::", totalrecurringCharges);
        if (websiteDomain == null) {
            websiteDomain = "www.sensis.com";
        }
        var emailField = randomstring.generate(7) + emailAddress;// "launchpad63.testemail@test.com";
        var bodyObj = {
            "countryId": 15,
            "email": emailField,//emailAddress,//"launchpad63.testemail@test.com",
            "merchantCampaignManager": "null",
            "merchantCampaignManagerContact": "null",
            "merchantCategory": "null",
            "merchantCategoryId": "null",
            "merchantConsultant": "null",
            "merchantConsultantContact": "null",
            "merchantContractEndDate": "null",
            "merchantCustomerValue": "null",
            "merchantId": "001p000000HzOHzAAN",//accountID,
            "merchantItemId": "null",
            "merchantMiscId": "null",
            "merchantProductCode": "null",
            "merchantProposalId": "null",
            "merchantRegion": "null",
            "merchantServiceLevel": "null",
            "merchantSource": "sensis",
            "merchantSubCategory": "null",
            "merchantSubCategoryId": "null",
            "merchantUdac": "null",
            "phone": contactMobile,
            "products": [
                {
                    "cost": totalrecurringCharges,
                    "productId": productServiceID
                }
            ],
            "userEmail": emailAddress,
            "userFirstName": contactFirstName,
            "userLastName": contactLastName,
            "accountManagerUserId": 0,
            "campaignEndDate": "0001-01-01T00:00:00",
            "campaignStartDate": "0001-01-01T00:00:00",
            "domain": websiteDomain,
            "keywords": [
                "customer"
            ],
            "languageId": 0,
            "merchantSitePublishDate": "0001-01-01T00:00:00",
            "name": accountName,//productServiceType, //company name
            "note": "this is customer note",
            "setupFee": 0,
            "taskHoursPerMonth": 0
        };

        var options = {
            //proxy: config.proxy,
            method: 'POST',
            url: 'https://service.boostability.com/api/partner/v3/customers',
            json: true,
            headers:
            {
                'Content-Type': 'application/json',
                'Authorization': access_token //'Bearer '
            },
            body: bodyObj
        };
        var interval = 5 * 1000; // 5 seconds;

        request(options, function (error, response, body) {
            //console.log(response);
            var customerId = body.customerId;
            console.log("CUSTOMER ID CREATED IN LAUNCH PAD ::::::::::: ", customerId);
            counter = counter + 1;
            //setTimeout(function () {
            console.log('Update Customer ID in  Case :: Salesforce Application ');
            //updateLaunchPadDetails(customerId)
            setTimeout(function (counter) {
                console.log('Chaneg Status of Case ID Salesforce Application ');
                populateStatus(caseNumber, customerId);
                //updateChatter(caseNumber, customerId);
            }, 5000);//interval * counter, counter
            // }, 5000);


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
