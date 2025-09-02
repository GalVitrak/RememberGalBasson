import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { db } from "./index";

const deleteGalleryPhoto = functions.https.onCall(
  async (data, context) => {
    try {
 

      const { eventId, photoId } = data;

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

      if (
        !photoId ||
        typeof photoId !== "string"
      ) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Photo ID is required"
        );
      }

      // Get the gallery document
      const galleryQuery = await db
        .collection("galleries")
        .where("eventId", "==", eventId)
        .get();

      if (galleryQuery.empty) {
        throw new functions.https.HttpsError(
          "not-found",
          "Gallery not found for this event"
        );
      }

      const galleryDoc = galleryQuery.docs[0];
      const galleryData = galleryDoc.data();
      const photos = galleryData.photos || [];

      // Find the photo to delete
      const photoIndex = photos.findIndex(
        (photo: any) => photo.id === photoId
      );

      if (photoIndex === -1) {
        throw new functions.https.HttpsError(
          "not-found",
          "Photo not found in gallery"
        );
      }

      const photoToDelete = photos[photoIndex];

      // Delete the image from Firebase Storage
      try {
        const bucket = admin.storage().bucket();

        // Extract the file path from the URL
        // URL format: https://storage.googleapis.com/bucket-name/galleries/eventId/photoId.ext
        const url = photoToDelete.url;
        const urlParts = url.split("/");
        const fileName =
          urlParts[urlParts.length - 1];
        const filePath = `galleries/${eventId}/${fileName}`;


        const file = bucket.file(filePath);
        const [exists] = await file.exists();

        if (exists) {
          await file.delete();
     
        } else {
          console.warn(
            `File not found in storage: ${filePath}`
          );
        }
      } catch (storageError) {
        console.warn(
          "Error deleting file from storage:",
          storageError
        );
        // Don't fail the whole operation if storage deletion fails
      }

      // Remove the photo from the photos array
      photos.splice(photoIndex, 1);

      // Update the gallery document
      await galleryDoc.ref.update({
        photos: photos,
        updatedAt: new Date().toISOString(),
      });

      // If no photos left, optionally update event.hasGallery to false
      if (photos.length === 0) {
        try {
          await db
            .collection("events")
            .doc(eventId)
            .update({
              hasGallery: false,
            });
     
        } catch (eventUpdateError) {
          console.warn(
            "Error updating event hasGallery:",
            eventUpdateError
          );
          // Don't fail the operation
        }
      }

  

      return {
        success: true,
        message: "Photo deleted successfully",
      };
    } catch (error) {
      console.error(
        "Error in deleteGalleryPhoto function:",
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

export default deleteGalleryPhoto;
