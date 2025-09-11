import * as functions from "firebase-functions/v1";
import { db } from "./index";
import sendMessage from "./telegramBot";

const reportCandle = functions.https.onCall(
  async (data, context) => {
    const { candleId } = data;
    try {
      // Get the candle data first
      const candleDoc = await db
        .collection("candles")
        .doc(candleId)
        .get();

      if (!candleDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Candle not found"
        );
      }

      const candleData = candleDoc.data();

      // Update status to Reported
      await db
        .collection("candles")
        .doc(candleId)
        .update({
          status: "Reported",
        });

      // Send Telegram notification for reported candle
      await sendMessage(
        "🚨 נר מדווח - דורש בדיקה🚨" +
          "\n" +
          `שם הכותב: ${candleData?.writerName}\n` +
          `הקדשה: ${candleData?.text}\n` +
          `תאריך: ${new Date().toLocaleDateString(
            "he-IL"
          )}\n` +
          `סטטוס: מדווח` +
          "\n" +
          "\n" +
          `ID: ${candleId}`,
        candleId
      );

      return { success: true };
    } catch (error) {
      console.error(error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to report candle"
      );
    }
  }
);

export default reportCandle;
