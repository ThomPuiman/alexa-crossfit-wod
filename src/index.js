/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
const Scraper = require('./scraper');
const Persistence = require('./persistence');
process.env.TZ = 'US/Eastern';
const ssml = {
    'break': '<break time=\"0.8s\" />'
};
var sentencePrefix = "";
const languageStrings = {
    'en-GB': {
        translation: {
            "intro": "The workout of the day is ",
            "introYesterday": "The workout of yesterday was ",
            "help": "If you want to hear the workout of the day. Just ask me what the workout of today is. You can also ask what the workout from yesterday was.",
            "goodbye": "Have a good rest. Speak to you tomorrow."
        },
    },
    'en-US': {
        translation: {
            "intro": "The workout of the day is ",
            "introYesterday": "The workout of yesterday was ",
            "help": "If you want to hear the workout of the day. Just ask me what the workout of today is. You can also ask what the workout from yesterday was.",
            "goodbye": "Have a good rest. Speak to you tomorrow."
        },
    }
};

const handlers = {
    'TodaysWorkoutIntent': function () {
        getWorkout(this, new Date(), "intro");
    },
    'YesterdaysWorkoutIntent': function () {
        var yesterday = new Date();
        yesterday = yesterday.setDate(yesterday.getDate() - 1);
        getWorkout(this, new Date(yesterday), "introYesterday");
    },
	'Unhandled': function () {
        var helpText = this.t("help");
        this.emit(':ask', helpText, helpText);
    },
    'AMAZON.HelpIntent': function () {
        var helpText = this.t("help");
        this.emit(':ask', helpText, helpText);
    },
    'AMAZON.StopIntent': function () {
        var goodbye = this.t("goodbye");
        this.emit(':tell', goodbye, goodbye);
    }
};

function getWorkout(self, date, prefix){
    console.log(date);
    var dbResult = Persistence.findWod(date, (result) => {
        if(result != null) {
            var sentences = result["sentence"];
            sentences.unshift(self.t(prefix));
            parserCallback(self, sentences);
        } else {
            Scraper(date, parserCallback, self);
        }
    });
}

function parserCallback(context, content){
    let speechSentence = sentencePrefix + content.join(ssml.break);
    speechSentence = speechSentence.replace(/(?:\r\n|\r|\n)/g, ssml.break);
    context.emit(':tell', speechSentence);
}

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = process.env.ALEXA_APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
