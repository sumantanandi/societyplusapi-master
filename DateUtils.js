
var moment = require('moment');
console.log(" moment date format :: ",moment().format());
console.log(" moment format ", moment().format().substring(11, 19));

var insertedDate = '2017-02-03T01:18:00.88';
var startTime = insertedDate.substring(11, 19);
var endTime = moment().format().substring(11, 19);
console.log("START TIME :: ", startTime);
console.log("END TIME :: ", endTime);
var mins = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("mm");
var TotalHours = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("HH");
console.log(" TIME DIFF :: IN mins ", mins);
console.log(" TIME DIFF :: IN Hour ", TotalHours);
if (TotalHours == '00') {
    if (mins <= 10) {
        console.log(" Update notes in Salesforce ");
    }
}


