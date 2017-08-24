'use strict';

process.env.DEBUG = 'actions-on-google:*';


const Debug = require('debug');
const debug = Debug('actions-on-google:debug');
const error = Debug('actions-on-google:error');

const Assistant = require('actions-on-google').ApiAiAssistant;
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// API.AI Intent names
const BOOK_HOTEL='book.hotel';
const BOOK_CAB ='book.cab';
const CONFIRM_BOOK_CAB = 'confirm.book.cab';
const ENQUIRY_SIGHTSEEING='enquiry.sightseeing';
const ENQUIRY_SIGHTSEEING_CONFIRM='enquiry.sightseeing.confirm';

// Contexts
const CAB_BOOKING_CONTEXT = 'cabbooking';
const SIGHTSEEING_CONTEXT =  'sightseeing';

// Context Parameters
const CAB_BOOKING_ENABLED = 'isEnableCab';
const CAB_BOOKING_TIME ="cabbooktime";
const QUESTION_PARAM = 'question';

exports.neudesicHotelDemo = functions.https.onRequest((request, response) => {
    console.log('headers: ' + JSON.stringify(request.headers));
    console.log('body: ' + JSON.stringify(request.body));

    const assistant = new Assistant({request: request, response: response});

    let actionMap = new Map();
    actionMap.set(BOOK_HOTEL,bookHotel);
    actionMap.set(ENQUIRY_SIGHTSEEING,sightseeing);
    actionMap.set(ENQUIRY_SIGHTSEEING_CONFIRM, confirmSightSeeing);
    actionMap.set(BOOK_CAB,bookCab);
    actionMap.set(CONFIRM_BOOK_CAB,confirmBookCab);
    assistant.handleRequest(actionMap);

    function bookHotel(assistant){       
         debug("Neudesic ::bookHotel ################################## dest:" + assistant.getArgument("destination") );
         //assistant.getContextArgument(QUESTION_CONTEXT, ID_PARAM).value;
        assistant.tell("WEBHOOK:: Input Data--> Destination: " + assistant.getArgument("destination") +", checkin: "+assistant.getArgument("check-in")+", checkout: "+ assistant.getArgument("check-out"));
    }

    function bookCab(assistant){
        const parameters = {};
        parameters[CAB_BOOKING_ENABLED] =true;
        parameters[CAB_BOOKING_TIME] =assistant.getArgument("datetime");
        assistant.setContext(CAB_BOOKING_CONTEXT, 10, parameters);
        assistant.ask("where you would like to go?");
    }

    function confirmBookCab(assistant){
        const cabBookTime = assistant.getContextArgument(CAB_BOOKING_CONTEXT, CAB_BOOKING_TIME);
        assistant.tell("Your booking request was processed for the cab on "+ cabBookTime.value+", will send you the confirmation sms to your mobile.")
    }

    function sightseeing(assistant){
        const destinationType = assistant.getArgument("destinationType");
        debug("Neudesic :: Sight seeing ################################## dest type:" + destinationType);
        switch(destinationType){
            case 'beaches' : assistant.ask("There are 3 beaches nearby, \n 1. Cherai Beach, Which has super view "
                                          +"\n 2. Fortkochi beach, which has nice sunset view at 6pm"
                                          +"\n 3. Kuzhipilly Beach, which has nice greenery"
                                          +"\n please choose any one of the beach. "); break;
            case 'waterfall': assistant.tell("waterfall lists here");break;
            case 'hilly area' : assistant.tell("hilly area lists here"); break;
            default : assistant.ask("please choose one of the favorite type like beaches, waterfall, hilly area.");
        }
    }
    
    function confirmSightSeeing(assistant){
        const isCabEnable = assistant.getContextArgument(CAB_BOOKING_CONTEXT, CAB_BOOKING_ENABLED);
        if(isCabEnable!=null && isCabEnable.value) {
             assistant.tell("That's great choice, you would like to book a cab for it?");
        }else {
            assistant.tell("That's great choice.");

        }

    }


    





});