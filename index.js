'use strict';
//var https = require ('https');
const fs = require('fs');

let rawdata = fs.readFileSync('audio.json');
let finalData = JSON.parse(rawdata);

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, text, output, repromptText, img, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'SSML',
            ssml: output,
        },
        card: {
            "type": "Standard",
            "title": title,
            "text": text,
            "image": {
                "smallImageUrl": "https://s3.amazonaws.com/footballimages/download.jpg",
                "largeImageUrl": "https://s3.amazonaws.com/footballimages/download.jpg"
            }
        },
        reprompt: {
            outputSpeech: {
                type: 'SSML',
                ssml: repromptText,
            },
        },
        "shouldEndSession": shouldEndSession
    };
}

function buildSpeechletResponseMusicEnque(title, token, output, url, previousToken, shouldEndSession) {
    return {
        "directives": [{
            "type": "AudioPlayer.Play",
            "playBehavior": "ENQUEUE",
            "audioItem": {
                "stream": {
                    "token": token,
                    "url": url,
                    "expectedPreviousToken": previousToken,
                    "offsetInMilliseconds": 0
                }
            }
        }],
        "shouldEndSession": true
    };
}

function buildSpeechletResponseMusicPause() {
    return {
        directives: [{
            type: "AudioPlayer.Stop"
        }],
        "shouldEndSession": true
    };
}


function buildSpeechletResponseMusic(title, text, output, url, img,offset, shouldEndSession) {
    return {
        "outputSpeech": {
            "type": "SSML",
            "ssml": output
        },
        "card": {
            "type": "Standard",
            "title": title,
            "content": text,
            "image": {
                "smallImageUrl": "https://s3.amazonaws.com/footballimages/download.jpg",
                "largeImageUrl": "https://s3.amazonaws.com/footballimages/download.jpg"
            }
        },
        "directives": [{
            "type": "AudioPlayer.Play",
            "playBehavior": "REPLACE_ALL",
            "audioItem": {
                "stream": {
                    "token": "0",
                    "url": url,
                    "offsetInMilliseconds": offset
                },
                
                "metadata": {
            "title": "My opinion: how could you diss-a-brie?",
            "subtitle": "Vince Fontana",
            "art": {
              "sources": [
                {
                  "url": "http://static.libsyn.com/p/assets/e/a/a/4/eaa4ad1223610ab4/TM_squared_updated.jpg"
                }
              ]
            },
            "backgroundImage": {
              "sources": [
                {
                  "url": "https://cdn.example.com/url-of-the-skill-image/brie-background.png"
                }
              ]
            }
            }
        }
        }],
        "shouldEndSession": true
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(launchRequest, callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    const cardTitle = 'Welcome';
    var speechOutput;
    var repromptText;
    var text = "nothing"
    speechOutput = '<speak>HI welcome to demo pod cast select from episode one, two, three</speak>';
    repromptText = speechOutput;
    const shouldEndSession = false;
    var img = null;
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, text, speechOutput, repromptText, img, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = '<speak>ok bye</speak>';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;
    var text = "bye";

    callback({}, buildSpeechletResponse(cardTitle, text, speechOutput, null, null, shouldEndSession));
}

function getHelpResponse(req, session, callback) {
    const sessionAttributes = {};
    const cardTitle = 'Help';
    const speechOutput = '<speak>There is no help run</speak>';
    const repromptText = speechOutput;
    const shouldEndSession = false;
    var img = null; //image link
    var text = "no help";
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, text, speechOutput, repromptText, img, shouldEndSession));
}
//------------------------FUNCTION------------------------------
function getMusicStarted(req, session, callback) {
    const sessionAttributes = {};
    const cardTitle = 'Scary Noises';
    var podNumber = req.request.intent.slots.num.value;
    const speechOutput = '<speak>heres your pod cast</speak>';
    var podURL = finalData.audio[0].url; //finalData.audio[podNumber - 1].url;
    const url = podURL;
    var data = {
        "curently_active": {

        }
    };
    data.curently_active.url = url;
    data.curently_active.title = finalData.audio[podNumber - 1].title;
    data.curently_active.offset = "0";
    fs.writeFile('/tmp/current.json', JSON.stringify(data), "utf8", function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("First item placed" + data);
            const shouldEndSession = false;
            var img = null; //image link
            var text = "plaing the music";
            callback(sessionAttributes,
                buildSpeechletResponseMusic(cardTitle, text, speechOutput, url, img,0, shouldEndSession));
        }
    });

}

function getFallbackResponse(req, session, callback) {
    const sessionAttributes = {};
    const cardTitle = 'Confused';
    const speechOutput = '<speak>I am Confused</speak>';
    const repromptText = speechOutput;
    const shouldEndSession = false;
    var img = null; //image link
    var text = "Error ";
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, text, speechOutput, repromptText, img, shouldEndSession));
}

function getresume(req, session, callback) {
    const sessionAttributes = {};
    const cardTitle = 'Scary Noises';
    const speechOutput = null;
    let raw = fs.readFileSync('audio.json');
    let data = JSON.parse(raw);

    const url = data.curently_active.url;
    var offset = req.context.AudioPlayer.offsetInMilliseconds
    const shouldEndSession = false;
    var img = null; //image link
    var text = "plaing the music";
    callback(sessionAttributes,
        buildSpeechletResponseMusic(cardTitle, text, speechOutput, url, img,offset, shouldEndSession));
}

function onPlayNearlyFinished(req, callback) {
    const sessionAttributes = {};
    const cardTitle = 'Music';
    const speechOutput = '<speak>Lets get things creepy</speak>';
    const url = "https://traffic.libsyn.com/franklintempletontalkingmarkets/Midyear_Outlook_Reining_in_Risk.mp3";
    console.log("----previous token------", req.context.AudioPlayer.token);
    var previousToken = req.context.AudioPlayer.token;
    var token = 1;
    token = token.toString();
    const shouldEndSession = false;
    // var img = null; //image link
    callback(sessionAttributes,
        buildSpeechletResponseMusicEnque(cardTitle, token, speechOutput, url, previousToken, shouldEndSession));
}

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);
    // Dispatch to your skill's launch.
    getWelcomeResponse(launchRequest, callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(req, session, callback) {
    // console.log(`onIntent requestId=${req.request.requestId}, sessionId=${session.sessionId}`);

    console.log("---------request-------------", req);
    //const intent = req.request.intent;
    const intentName = req.request.intent.name;


    // Dispatch to your skill's intent handlers
    if (intentName === 'selectPod') {
        getMusicStarted(req, session, callback);
    }
    else if (intentName === 'somethingElse') {
        getFallbackResponse(req, session, callback);
    }
    else if (intentName === 'AMAZON.PauseIntent') {
        callback({}, buildSpeechletResponseMusicPause());
    }
    else if (intentName === 'AMAZON.NextIntent') {
        getresume(req, session, callback);
    }
    else if (intentName === 'AMAZON.PreviousIntent') {
        getresume(req, session, callback);
    }
    else if (intentName === 'AMAZON.ResumeIntent') {
        getresume(req, session, callback);
    }
    else if (intentName === 'AMAZON.FallbackIntent') {
        getFallbackResponse(req, session, callback);
    }
    else if (intentName === 'AMAZON.HelpIntent') {
        getHelpResponse(req, session, callback);
    }
    else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    }
    else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here

}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        // console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.ask.skill.73902b0f-1de3-4e91-95c4-d94b32d5eb19') {
             callback('Invalid Application ID');
        }
        */
        console.log("---------event-----------", event);
        if (event.session !== undefined && event.session.new) {

            onSessionStarted({ requestId: event.request.requestId }, event.session);

        }

        if (event.request.type === 'LaunchRequest') {
            console.log("------------------launch request-----------------------");
            onLaunch(event,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        }
        else if (event.request.type === 'IntentRequest') {
            onIntent(event,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        }
        else if (event.request.type === 'AudioPlayer.PlaybackNearlyFinished') {
            onPlayNearlyFinished(event,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        }
        else if (event.request.type === 'System.ExceptionEncountered' && event.context.AudioPlayer.playerActivity === 'STOPPED') {
            getresume(event, null,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        }
        else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    }
    catch (err) {
        callback(err);
    }
};



