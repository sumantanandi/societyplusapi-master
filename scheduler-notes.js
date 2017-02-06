var request = require("request");
var createCustomerAPI = process.env.NODE_API_CREATE_CUSTOMER || 'http://localhost:8080/api/v0/application';
var updateNoteAPI = process.env.NODE_API_UPDATE_NOTE || 'http://localhost:8080/api/v0/updatenote';

function createCustomerAndCloseCase() {
    console.log('-----  :::  Scheduler is runnning now :: for Update Customer Notes in Launchpad :   ----  ');
    return new Promise(function (resolve, reject) {
        var bodyObj = {
            "id": "001"
        };
        var options = {
            //proxy: config.proxy,
            method: 'POST',
            url: updateNoteAPI,
            json: true,
            headers:
            {
                'Content-Type': 'application/json',
                // 'Authorization': access_token //'Bearer '
            },
            body: bodyObj
        };

        request(options, function (error, response, body) {
            console.log(":::   UPDATE TO CUSTOMER NOTE IS RUNNING NOW ::::::::::: ");
            if (error) {
                reject(error);
            }
            else if ([200, 201, 202, 204].indexOf(response.statusCode) > -1) {
                resolve({ provider: "LaunchPad API ", messageId: body.messageId });
            }
            else {
                reject('error to create Notes in Salesforce ' + response.statusCode);
            }
        });
    });
}
createCustomerAndCloseCase();