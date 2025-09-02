import * as functions from "firebase-functions/v1";
import { db } from "./index";

const reportCandle = functions.https.onCall(
  async (data, context) => {
    const { candleId } = data;
    try {
      await db
        .collection("candles")
        .doc(candleId)
        .update({
          status: "Reported",
        });
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
