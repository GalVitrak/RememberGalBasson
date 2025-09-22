import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { db } from "./index";

const deleteEvent = functions.https.onCall(
  async (data, context) => {
    try {
      const { eventId } = data;

      // Validate input
      if (
        !eventId ||
        typeof eventId !== "string"
      ) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event ID is required"
        );
      }

      // Check if event exists
      const eventRef = db
        .collection("events")
        .doc(eventId);
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Event not found"
        );
      }

      const eventData = eventDoc.data();

      // Delete all files for this event from storage
      try {
        const bucket = admin.storage().bucket();
        console.log(
          `Deleting all files for event: ${eventId}`
        );

        // Delete the entire gallery folder for this event
        const [files] = await bucket.getFiles({
          prefix: `galleries/${eventId}/`,
        });

        console.log(
          `Found ${files.length} files to delete in galleries/${eventId}/`
        );

        if (files.length > 0) {
          await Promise.all(
            files.map((file) => file.delete())
          );
          console.log(
            `Successfully deleted all files for event: ${eventId}`
          );
        }

        // Delete gallery document if it exists
        if (eventData?.hasGallery) {
          const galleryQuery = await db
            .collection("galleries")
            .where("eventId", "==", eventId)
            .get();

          if (!galleryQuery.empty) {
            await galleryQuery.docs[0].ref.delete();
            console.log(
              `Deleted gallery document for event: ${eventId}`
            );
          }
        }
      } catch (error) {
        console.error(
          `Error deleting event files: ${eventId}`,
          error
        );
        throw new functions.https.HttpsError(
          "internal",
          "Failed to delete event files from storage"
        );
      }

      // Delete the event document
      await eventRef.delete();

      return {
        success: true,
        message: "Event deleted successfully",
      };
    } catch (error) {
      console.error(
        "Error in deleteEvent function:",
        error
      );

      if (
        error instanceof
        functions.https.HttpsError
      ) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        "Internal server error: " +
          (error instanceof Error
            ? error.message
            : String(error))
      );
    }
  }
);

export default deleteEvent;
