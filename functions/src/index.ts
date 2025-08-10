import * as admin from "firebase-admin";
import login from "./login";
import addCandle from "./addCandle";

admin.initializeApp();

export const db = admin.firestore();

exports.login = login;
exports.addCandle = addCandle;
