import * as admin from "firebase-admin";
import login from "./login";
import addCandle from "./addCandle";
import addForbiddenWords from "./addRestrictedWords";

admin.initializeApp();

export const db = admin.firestore();

exports.login = login;
exports.addCandle = addCandle;
exports.addForbiddenWords = addForbiddenWords;
