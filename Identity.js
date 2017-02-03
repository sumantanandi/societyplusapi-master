'use strict';

//var url = require('url');

//var testapplication  = require('./CreateCustomerLP');
//var salesforceConnection =  require('./SalesforceConnect');
var getCustomerNotesDetails =  require('./GetCustomerNotes');

var name = " Customer Create service call";
var accountNumber = '001p000000HzOHzAAN';
//testapplication.sendMessage();
//salesforceConnection.saveApplication(name);
getCustomerNotesDetails.getCustomerNotes(accountNumber);
/*testapplication.sendMessage = function sendMessage(name) {
 console.log("hello " + name);   
}*/

/*
testapplication.sendMessage("test").then(function(resp) {
console.log("test call");
}
).catch(function(err) {
console.log("test error call");
}
*/