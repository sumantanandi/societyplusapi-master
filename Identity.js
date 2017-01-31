'use strict';

//var url = require('url');

var testapplication  = require('./CreateCustomerLP');
var salesforceConnection =  require('./SalesforceConnect');

var name = " Customer Create service call";

//testapplication.sendMessage();
salesforceConnection.saveApplication(name);

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