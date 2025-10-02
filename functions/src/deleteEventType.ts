import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { db } from "./index";
import { logEventTypeActivity } from "./logger";

const deleteEventType = functions.https.onCall(
  async (data, context) => {
    try {
      const { id } = data;

      // Validate input
      if (!id || typeof id !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event type ID is required"
        );
      }

      // Get reference to the event type document
      const eventTypeRef = db
        .collection("eventTypes")
        .doc(id);

      // Check if the event type exists
      const eventTypeDoc =
        await eventTypeRef.get();
      if (!eventTypeDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Event type not found"
        );
      }

      const eventTypeData = eventTypeDoc.data();
      const eventTypeName =
        eventTypeData?.name || "Unknown";
      const eventTypeDescription =
        eventTypeData?.description || "";

      // Delete associated image from Storage if it exists
      if (eventTypeData?.defaultImageId) {
        try {
          const bucket = admin.storage().bucket();
          const imageId =
            eventTypeData.defaultImageId;

          // Try to delete with different extensions
          const extensions = [
            "jpg",
            "jpeg",
            "png",
            "webp",
          ];
          for (const ext of extensions) {
            const fileName = `eventTypes/${imageId}.${ext}`;
            const file = bucket.file(fileName);
            const [exists] = await file.exists();
            if (exists) {
              await file.delete();
              console.log(
                `Deleted image: ${fileName}`
              );
              break;
            }
          }
        } catch (imageError) {
          // Don't fail the whole operation if image deletion fails
          console.error(
            "Failed to delete event type image:",
            imageError
          );
        }
      }

      // Delete the event type document
      await eventTypeRef.delete();

      // Log the deletion
      try {
        await logEventTypeActivity.deleted(
          id,
          eventTypeName,
          eventTypeDescription,
          {
            deletedBy:
              context.auth?.uid || "admin",
          }
        );
        console.log(
          "Event type deletion logged successfully!"
        );
      } catch (logError) {
        console.error(
          "Failed to log event type deletion:",
          logError
        );
      }

      return {
        success: true,
        message:
          "Event type deleted successfully",
      };
    } catch (error) {
      if (
        error instanceof
        functions.https.HttpsError
      ) {
        throw error;
      }

      console.error(
        "Error deleting event type:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Failed to delete event type: " +
          (error instanceof Error
            ? error.message
            : String(error))
      );
    }
  }
);

export default deleteEventType;
