import * as functions from "firebase-functions/v1";
import { db } from "./index";
import sendMessage from "./telegramBot";

const addCandle = functions.https.onCall(
  async (data, context) => {
    const { candle } = data;
    console.log(
      "addCandle called with data:",
      data
    );
    console.log("candle object:", candle);

    try {
      const docRef = await db
        .collection("candles")
        .add({
          ...candle,
          status: "Pending",
          createdAt: new Date().toISOString(),
        });

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
      console.error(error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to add candle"
      );
    }
  }
);

export default addCandle;
