import * as admin from "firebase-admin";
import login from "./login";
admin.initializeApp();

export const db = admin.firestore();

exports.login = login;
