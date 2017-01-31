'use strict';
var request = require("request");
var access_token = "3BbszTGeIRQWlhPg9izUyooHB59zoYd7nA2bth1p/SKRQEQB8cj2Y1c+/pPAZdkm";

exports.sendMessage = (message) => {
    return new Promise(function (resolve, reject) {
        console.log(" Message to create customer in LaunchPad", message);
        var bodyObj = {
            "countryId": 15,
            "email": "launchpad12.testemail@test.com",
            "merchantCampaignManager": "testmanager",
            "merchantCampaignManagerContact": "0470898787",
            "merchantCategory": "string",
            "merchantCategoryId": "string",
            "merchantConsultant": "string",
            "merchantConsultantContact": "string",
            "merchantContractEndDate": "string",
            "merchantCustomerValue": "string",
            "merchantId": "string",
            "merchantItemId": "string",
            "merchantMiscId": "string",
            "merchantProductCode": "string",
            "merchantProposalId": "string",
            "merchantRegion": "string",
            "merchantServiceLevel": "string",
            "merchantSource": "sensis",
            "merchantSubCategory": "string",
            "merchantSubCategoryId": "string",
            "merchantUdac": "string",
            "phone": "0470898888",
            "products": [
                {
                    "cost": 1000,
                    "productId": 1
                }
            ],
            "userEmail": "ttt.mm@geee.com",
            "userFirstName": "apitest",
            "userLastName": "createcustomer",
            "accountManagerUserId": 0,
            "campaignEndDate": "2017-01-30T01:27:36.861Z",
            "campaignStartDate": "2017-01-30T01:27:36.861Z",
            "domain": "www.abbcpppppp.com",
            "keywords": [
                "customer"
            ],
            "languageId": 0,
            "merchantSitePublishDate": "2017-01-30T01:27:36.861Z",
            "name": "testcompany", //company name
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

        request(options, function (error, response, body) {
            //console.log(response);
            var customerId = body.customerId;
            console.log("CUSTOMER ID CREATED IN LAUNCH PAD ", customerId);
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
