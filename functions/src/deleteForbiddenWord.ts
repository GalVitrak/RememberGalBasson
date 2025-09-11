import * as functions from "firebase-functions/v1";
import { db } from "./index";

const deleteForbiddenWord =
  functions.https.onCall(
    async (data, context) => {
      const { wordId } = data;

      // Validate input
      if (!wordId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Word ID is required"
        );
      }

      try {
        // Delete the forbidden word document
        await db
          .collection("ForbiddenWords")
          .doc(wordId)
          .delete();

        return {
          success: true,
          message:
            "Forbidden word deleted successfully",
        };
      } catch (error) {
        console.error(
          "Error deleting forbidden word:",
          error
        );
        throw new functions.https.HttpsError(
          "internal",
          "Failed to delete forbidden word"
        );
      }
    }
  );

export default deleteForbiddenWord;
