import * as functions from "firebase-functions/v1";
import { db } from "./index";

const addForbiddenWords = functions.https.onCall(
  async (data, context) => {
    const { words } = data;

    // Validate input
    if (!words) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Words array is required"
      );
    }

    // Ensure words is an array, convert single word to array
    const wordsArray = Array.isArray(words)
      ? words
      : [words];

    // Validate that we have at least one word
    if (wordsArray.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "At least one word is required"
      );
    }

    // Filter out empty/invalid words
    const validWords = wordsArray
      .filter(
        (word) =>
          word &&
          typeof word === "string" &&
          word.trim() !== ""
      )
      .map((word) => word.trim().toLowerCase());

    if (validWords.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "No valid words provided"
      );
    }

    try {
      // Add each word as a separate document for easier querying
      const batch = db.batch();
      const timestamp = new Date();

      validWords.forEach((word) => {
        const docRef = db
          .collection("ForbiddenWords")
          .doc();
        batch.set(docRef, {
          word: word,
          createdAt: timestamp,
        });
      });

      await batch.commit();

      return {
        message: `${validWords.length} forbidden word(s) added successfully`,
        addedWords: validWords.length,
        words: validWords,
      };
    } catch (error) {
      console.error(
        "Error adding forbidden words:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Failed to add forbidden words"
      );
    }
  }
);

export default addForbiddenWords;
