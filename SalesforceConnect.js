var nforce = require('nforce');
//var truncate = require('truncate');
//var dateFormat = require('dateformat');
var fs = require("fs");
var path = require("path");
var environment = process.env.NODE_ENV || 'local';
var org = "";
var oauth;
var caseNumber = '';
var createCustomer  = require('./CreateCustomerLP');

createCase = (caseDetails) => {
    console.log(' Inside Case Object  :');
    var caseQuery = 'SELECT Service__r.Id, Service__r.Main_Contact_Email_Address__c,Service__r.Main_Contact_Full_Name__c,Service__r.New_Website__c,	ContactPhone, Service__r.csordmedia__Product_Bundle__c FROM Case where CaseNumber = "03055059"';


}

exports.saveApplication = (caseNumber) => {
    console.log(" Calling Salesforce Object :: Received Case Number ",caseNumber);
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
        console.log('OAuth ', oauth);
        console.log('Access Token :: ' + oauth.access_token);
        console.log("User ID :: " + oauth.id);
        console.log('Instance URL ::', oauth.instance_url);
        //caseNumber = '03054754'; //03054754 03055059
        var caseQuery = 'SELECT Service__r.MainContact__r.FirstName,Service__r.MainContact__r.LastName,Service__r.MainContact__r.Phone, Service__r.MainContact__r.MobilePhone,Service__r.Total_Recurring_Charges__c, Service__r.Service_Type__c, Service__r.Id, Service__r.Main_Contact_Email_Address__c, Service__r.Main_Contact_Full_Name__c, Service__r.New_Website__c,  Service__r.csordmedia__Product_Bundle__c FROM Case  WHERE CaseNumber = \'' + caseNumber + '\'';
        org.query({ query: caseQuery, oauth: oauth }, function (err, resp) {
            if (!err && resp.records) {
                var accoutName = resp.records[0];
                //var fields = accoutName._fields;
                console.log(" Accout Name  ::", accoutName);
                var emailAddress = resp.records[0]._fields.service__r.Main_Contact_Email_Address__c;
                var contactMobile = resp.records[0]._fields.service__r.MainContact__r.Phone;
                var conatctFirstName = resp.records[0]._fields.service__r.MainContact__r.FirstName;
                var contactLastName = resp.records[0]._fields.service__r.MainContact__r.LastName;
                var contactFullName = resp.records[0]._fields.service__r.Main_Contact_Full_Name__c;
                var websiteDomain = resp.records[0]._fields.service__r.New_Website__c;
                var productServiceType = resp.records[0]._fields.service__r.Service_Type__c;
                var totalrecurringCharges = resp.records[0]._fields.service__r.Total_Recurring_Charges__c;
                var salesforceID = resp.records[0]._fields.service__r.Id;
                var productServiceID = "";
                if (productServiceType == 'Sensis Website'){
                    productServiceID = '21';
                }
                console.log(" ----------------------  START  ------------------------------   ::");
                console.log(" contactFullName  ::", contactFullName);
                console.log(" conatctFirstName  ::", conatctFirstName);
                console.log(" contactLastName  ::", contactLastName);
                console.log(" emailAddress  ::", emailAddress);
                console.log(" contactMobile  ::", contactMobile);
                console.log(" websiteDomain  ::", websiteDomain);
                console.log(" productServiceType  ::", productServiceType);
                console.log(" productServiceID  ::", productServiceID);
                console.log(" totalrecurringCharges  ::", totalrecurringCharges);
                console.log(" salesforceID  ::", salesforceID);
                console.log(" emailAddress  ::", emailAddress);
                console.log(" ----------------------  END ------------------------------   ::");

                createCustomer.sendMessage(caseNumber,contactFullName,conatctFirstName,contactLastName,emailAddress,contactMobile,websiteDomain,productServiceID,totalrecurringCharges,productServiceType);
            }
            if (err) {
                console.log('ERROR MESSAGE :Salesforce Object Query ', err);
            }
        });


        if (err) {
            console.log('ERROR MESSAGE :Salesforce Object Calling ', err);
            //statusMessage = err.message;
        }
    });

};