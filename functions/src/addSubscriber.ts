import * as functions from "firebase-functions/v1";
import { db } from "./index";

const addSubscriber = functions.https.onCall(
  async (data, context) => {
    const { subscriber } = data;

    try {
      await db
        .collection("subscribers")
        .add(subscriber);
      return {
        success: true,
        message: "Subscriber added successfully",
      };
    } catch (error) {
      console.error(
        "Error adding subscriber:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Failed to add subscriber: " +
          (error instanceof Error
            ? error.message
            : String(error))
      );
    }
  }
);

export default addSubscriber;
