import * as functions from "firebase-functions/v1";
import { db } from "./index";

const deleteSubscriber = functions.https.onCall(
  async (data, context) => {
    const { subscriberId } = data;
    try {
      await db
        .collection("subscribers")
        .doc(subscriberId)
        .delete();
      return {
        success: true,
        message:
          "Subscriber deleted successfully",
      };
    } catch (error) {
      console.error(
        "Error deleting subscriber:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Failed to delete subscriber: " +
          (error instanceof Error
            ? error.message
            : String(error))
      );
    }
  }
);

export default deleteSubscriber;
