import * as admin from "firebase-admin";
import login from "./login";
import addCandle from "./addCandle";
import addForbiddenWords from "./addRestrictedWords";
import reportCandle from "./reportCandle";
import addEventType from "./addEventType";
import addEvent from "./addEvent";

admin.initializeApp();

export const db = admin.firestore();

exports.login = login;
exports.addCandle = addCandle;
exports.addForbiddenWords = addForbiddenWords;
exports.reportCandle = reportCandle;
exports.addEventType = addEventType;
exports.addEvent = addEvent;
