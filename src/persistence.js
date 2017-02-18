const WOD_TABLE_NAME = "wodhistory";
var AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-1'});

var ddb = new AWS.DynamoDB.DocumentClient();

module.exports = {
    saveInDB: (date, sentence, cb) => {
        var params = {
            TableName: WOD_TABLE_NAME,
            Item:{
                "date": date.toISOString().substring(0, 10),
                "sentence": sentence
            }
        };
        console.log("saveInDB", params);

        ddb.put(params, function(err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
            cb();
        });
        
    },
    findWod: (date, cb) => {

        var params = {
            TableName: WOD_TABLE_NAME,
            Key:{
                "date": date.toISOString().substring(0, 10),
            }
        };

        ddb.get(params, function(err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                cb();
            } else {
                if(typeof data.Item !== "undefined"){
                    cb(data.Item);
                } else {
                    cb();
                }
            }
        });
    }

};