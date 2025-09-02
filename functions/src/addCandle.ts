import * as functions from "firebase-functions/v1";
import { db } from "./index";

const addCandle = functions.https.onCall(
  async (data, context) => {
    const { candle } = data;
    try {
      await db.collection("candles").add(candle);
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
