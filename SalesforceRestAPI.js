var sf = require('node-salesforce');
var username = "sumanta.nandi@accenture.com.newco.sit";
var password =  "S1%ummer";
var conn = new sf.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env. 
   loginUrl : 'https://test.salesforce.com' 
});
conn.login("sumanta.nandi@accenture.com.newco.sit", "S1%ummer", function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information. 
  // Save them to establish connection next time. 
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property 
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // 
});