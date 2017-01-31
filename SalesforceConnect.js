var nforce = require('nforce');
//var truncate = require('truncate');
//var dateFormat = require('dateformat');
var fs = require("fs");
var path = require("path");
var environment = process.env.NODE_ENV || 'local';
var org = "";
var oauth;
var caseNumber = '';

createCase = (caseDetails) => {
    console.log(' Inside Case Object  :');
    var caseQuery = 'SELECT Service__r.Id, Service__r.Main_Contact_Email_Address__c,Service__r.Main_Contact_Full_Name__c,Service__r.New_Website__c,	ContactPhone, Service__r.csordmedia__Product_Bundle__c FROM Case where CaseNumber = "03055059"';


}

exports.saveApplication = (application) => {
    console.log(" Calling Salesforce Object ");
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

    console.log(" clientId : ", clientId);
    console.log(" clientSecret ", clientSecret);
    console.log(" sfdcEnvironment ", sfdcEnvironment);

    org = nforce.createConnection({
        loginUrl: loginUrl,
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
        apiVersion: apiVersion,  // optional, defaults to current salesforce API version 
        environment: sfdcEnvironment,  // optional, salesforce 'sandbox' or 'production', production default 
        mode: 'multi' // optional, 'single' or 'multi' user mode, multi default 
    });

    org.authenticate({ username: username, password: password }, function (err, resp) {
        if (!err) oauth = resp;
        console.log('OAuth ', oauth);
        console.log('Access Token :: ' + oauth.access_token);
        console.log("User ID :: " + oauth.id);
        console.log('Instance URL ::', oauth.instance_url);
        //' and firstName LIKE \''+String.escapeSingleQuotes(name)+'%\'';
        caseNumber = "03055059";
        var caseQuery = 'SELECT Service__r.Id, Service__r.Main_Contact_Email_Address__c,Service__r.Main_Contact_Full_Name__c,Service__r.New_Website__c,	ContactPhone, Service__r.csordmedia__Product_Bundle__c FROM Case WHERE CaseNumber = \'' + caseNumber + '\'';
        org.query({ query: caseQuery, oauth: oauth }, function (err, resp) {
            if (!err && resp.records) {
                var accoutName = resp.records[0];
                var fields = accoutName._fields;
                console.log(" Accout Name  ::", fields.account.name);
                var contactEmail = accoutName.contact.Email;
                var mobilePhone = resp.records[0].mobilePhone;

                console.log(" Contact  Email  ::", contactEmail);
                console.log(" Mobile Phone  ::", mobilePhone);
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