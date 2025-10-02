import * as functions from "firebase-functions/v1";
import { db } from "./index";
import { logForbiddenWordsActivity } from "./logger";

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
        const wordDoc = await db
          .collection("ForbiddenWords")
          .doc(wordId)
          .get();

        await wordDoc.ref.delete();

        await logForbiddenWordsActivity.deleted(
          wordDoc.data()?.word || "Unknown",
          {
            deletedBy:
              context.auth?.uid || "admin",
          }
        );

        return {
          success: true,
          message:
            "Forbidden word deleted successfully",
        };
      } catch (error) {
        throw new functions.https.HttpsError(
          "internal",
          "Failed to delete forbidden word"
        );
      }
    }
  );

export default deleteForbiddenWord;
