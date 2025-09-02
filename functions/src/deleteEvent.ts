import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { db } from "./index";

const deleteEvent = functions.https.onCall(
  async (data, context) => {
    try {


      const { eventId } = data;

      // Validate input
      if (!eventId || typeof eventId !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event ID is required"
        );
      }

      // Check if event exists
      const eventRef = db.collection("events").doc(eventId);
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Event not found"
        );
      }

      const eventData = eventDoc.data();

      // Delete gallery and photos if they exist
      if (eventData?.hasGallery) {
        try {

          // Get gallery document
          const galleryQuery = await db
            .collection("galleries")
            .where("eventId", "==", eventId)
            .get();

          if (!galleryQuery.empty) {
            const galleryDoc = galleryQuery.docs[0];
            const galleryData = galleryDoc.data();
            const photos = galleryData.photos || [];

            // Delete photos from Firebase Storage
            if (photos.length > 0) {
              const bucket = admin.storage().bucket();
              
              for (const photo of photos) {
                try {
                  // Extract file path from URL
                  const url = photo.url;
                  const urlParts = url.split('/');
                  const fileName = urlParts[urlParts.length - 1];
                  const filePath = `galleries/${eventId}/${fileName}`;
                  
                  
                  const file = bucket.file(filePath);
                  const [exists] = await file.exists();
                  
                  if (exists) {
                    await file.delete();
                  }
                } catch (photoError) {
                  console.warn("Error deleting photo from storage:", photoError);
                  // Continue with other photos
                }
              }
            }

            // Delete gallery document
            await galleryDoc.ref.delete();
          }
        } catch (galleryError) {
          console.warn("Error deleting gallery:", galleryError);
          // Don't fail the whole operation
        }
      }

      // Delete cover image from storage if it exists
      if (eventData?.coverImageId) {
        try {
          const bucket = admin.storage().bucket();
          const coverImagePath = `events/${eventId}/${eventData.coverImageId}`;
          
          
          const file = bucket.file(coverImagePath);
          const [exists] = await file.exists();
          
          if (exists) {
            await file.delete();
          }
        } catch (coverError) {
          console.warn("Error deleting cover image:", coverError);
          // Don't fail the whole operation
        }
      }

      // Delete the event document
      await eventRef.delete();

      return {
        success: true,
        message: "Event deleted successfully",
      };
    } catch (error) {
      console.error("Error in deleteEvent function:", error);

      if (error instanceof functions.https.HttpsError) {
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
