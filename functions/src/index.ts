import * as admin from "firebase-admin";
import login from "./login";
import addCandle from "./addCandle";
import addForbiddenWords from "./addForbiddenWords";
import deleteForbiddenWord from "./deleteForbiddenWord";
import reportCandle from "./reportCandle";
import addEventType from "./addEventType";
import addEvent from "./addEvent";
import uploadGalleryPhotos from "./uploadGalleryPhotos";
import updateEventType from "./updateEventType";
import deleteGalleryPhoto from "./deleteGalleryPhoto";
import updateEvent from "./updateEvent";
import deleteEvent from "./deleteEvent";
import approveCandle from "./approveCandle";
import { telegramWebhook } from "./telegramBot";
import addSubscriber from "./addSubscriber";
import unsubscribeSubscriber from "./unsubscribeSubscriber";
import {
  onEventPublished,
  testMailjet,
} from "./sendEventEmail";

admin.initializeApp();

export const db = admin.firestore();

exports.login = login;
exports.addCandle = addCandle;
exports.addForbiddenWords = addForbiddenWords;
exports.deleteForbiddenWord = deleteForbiddenWord;
exports.reportCandle = reportCandle;
exports.addEventType = addEventType;
exports.addEvent = addEvent;
exports.uploadGalleryPhotos = uploadGalleryPhotos;
exports.updateEventType = updateEventType;
exports.deleteGalleryPhoto = deleteGalleryPhoto;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.approveCandle = approveCandle;
exports.telegramWebhook = telegramWebhook;
exports.addSubscriber = addSubscriber;
exports.testMailjet = testMailjet;
exports.onEventPublished = onEventPublished;
exports.unsubscribeSubscriber =
  unsubscribeSubscriber;
