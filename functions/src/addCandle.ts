import * as functions from "firebase-functions/v1";
import { db } from "./index";
import sendMessage from "./telegramBot";
import { HttpsError } from "firebase-functions/v1/https";
import { logCandleActivity } from "./logger";

const addCandle = functions.https.onCall(
  async (data, context) => {
    const { candle } = data;

    try {
      // Get forbidden words
      const forbiddenWordsSnapshot = await db
        .collection("ForbiddenWords")
        .get();
      const forbiddenWords =
        forbiddenWordsSnapshot.docs.map((doc) =>
          doc.data().word.toLowerCase()
        );

      // Check for forbidden words in both name and text
      const lowerName =
        candle.writerName?.toLowerCase() || "";
      const lowerText =
        candle.text?.toLowerCase() || "";

      for (const word of forbiddenWords) {
        const pattern = new RegExp(
          `\\b${word}\\b`,
          "i"
        );
        if (pattern.test(lowerName)) {
          throw new HttpsError(
            "failed-precondition",
            `המילה "${word}" בשם הכותב אסורה לשימוש`
          );
        }
        if (pattern.test(lowerText)) {
          throw new HttpsError(
            "failed-precondition",
            `המילה "${word}" אסורה לשימוש בהקדשה`
          );
        }
      }

      const docRef = await db
        .collection("candles")
        .add({
          ...candle,
          status: "Pending",
          createdAt: candle.createdAt,
        });

      // Log the candle being lit
      try {
        await logCandleActivity.lit(docRef.id, {
          writerName: candle.writerName,
          text: candle.text,
          status: "Pending",
        });
      } catch (logError) {
        // Don't throw the error - we still want to continue even if logging fails
      }

      await sendMessage(
        "נר חדש ממתין לאישור🕯️" +
          "\n" +
          `שם הכותב: ${candle.writerName}\n` +
          `הקדשה: ${candle.text}\n` +
          `תאריך: ${new Date().toLocaleDateString(
            "he-IL"
          )}\n` +
          `סטטוס: ממתין לאישור` +
          "\n" +
          "\n" +
          `ID: ${docRef.id}`,
        docRef.id
      );

      return {
        success: true,
        candleId: docRef.id,
      };
    } catch (error) {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to add candle"
      );
    }
  }
);

export default addCandle;
