const cheerio = require('cheerio');
const request = require("tinyreq");
const Persistence = require("./persistence");

module.exports = (date, cb, context, retry) => {
    var content = [];
    var self = this;
    var url = `http://www.crossfit.com/workout/${date.getFullYear()}/${('0' + (date.getMonth()+1)).slice(-2)}/${('0' + date.getDate()).slice(-2)}`;
    request(url, (err, body) => {
        if(err && !retry){
            var yesterday = date.setDate(date.getDate() - 1);
            return require('./scraper')(yesterday, cb, context, true);
        }

        $ = cheerio.load(body);
        var breakContent = false;
        $("#wodContainer .content p").each(function(i, elem) {
            var currentParagraph = $(elem).text();
            if(!currentParagraph.match(/^Post.*to comments/) && !breakContent){
                content.push(parseTerms(currentParagraph));
            } else {
                breakContent = true;
            }
        });
        Persistence.saveInDB(date, content, () => {
            cb(context, content);
        });
    });
    return content;
};

function parseTerms(sentence){
    var numberRepsRegex = /([0-9,-]{5,})/g;
    var matchNumberReps = numberRepsRegex.exec(sentence);
    if(matchNumberReps != null && matchNumberReps[1]){
        console.log(matchNumberReps);

        var reps = matchNumberReps[1].split('-');
        var sameReps = true;
        for(var i = 0; i < reps.length; i++)
            if(reps[i] !== reps[0])
                sameReps = false;
        
        if(sameReps){
            console.log(reps);
            sentence = sentence.replace(matchNumberReps[1], reps.length + " times " + reps[0]);
            console.log(sentence);
        }
    }
    return sentence;
}