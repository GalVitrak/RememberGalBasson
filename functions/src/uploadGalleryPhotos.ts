import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { db } from "./index";

const uploadGalleryPhotos =
  functions.https.onCall(
    async (data, context) => {
      const { eventId, photos } = data;

      // Validate required fields
      if (!eventId) {
        throw new Error("Event ID is missing");
      }

      if (
        !photos ||
        !Array.isArray(photos) ||
        photos.length === 0
      ) {
        throw new Error(
          "Photos data is missing or empty"
        );
      }

      try {
        const uploadedPhotos = [];
        const bucket = admin.storage().bucket();

        // Process each photo
        for (const photo of photos) {
          const {
            fileName,
            mimeType,
            base64Data,
          } = photo;

          if (
            !fileName ||
            !mimeType ||
            !base64Data
          ) {
            continue; // Skip this photo and continue with others
          }

          try {
            // Create a unique filename using UUID
            const fileExtension =
              fileName.split(".").pop() || "jpg";
            const uniqueId = uuidv4();
            const imageId = `galleries/${eventId}/${uniqueId}.${fileExtension}`;

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(
              base64Data,
              "base64"
            );

            const file = bucket.file(imageId);

            // Upload the file
            await file.save(imageBuffer, {
              metadata: {
                contentType: mimeType,
              },
            });

            // Make the file publicly readable
            await file.makePublic();

            // Get the public URL
            const imageUrl = `https://storage.googleapis.com/${bucket.name}/${imageId}`;

            // Add to uploaded photos array
            uploadedPhotos.push({
              id: uniqueId,
              url: imageUrl,
            });
          } catch (photoError) {
            // Continue with other photos even if one fails
          }
        }

        if (uploadedPhotos.length === 0) {
          throw new Error(
            "No photos were uploaded successfully"
          );
        }

        // Save gallery photos metadata to Firestore
        const galleryData = {
          eventId,
          photos: uploadedPhotos,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Check if gallery already exists for this event
        const galleryQuery = await db
          .collection("galleries")
          .where("eventId", "==", eventId)
          .get();

        if (galleryQuery.empty) {
          // Create new gallery document
          await db
            .collection("galleries")
            .add(galleryData);

          // Update event to mark it has gallery
          await db
            .collection("events")
            .doc(eventId)
            .update({ hasGallery: true });
        } else {
          // Update existing gallery document
          const existingDoc =
            galleryQuery.docs[0];
          const existingData = existingDoc.data();

          const updatedPhotos = [
            ...(existingData.photos || []),
            ...uploadedPhotos,
          ];

          await existingDoc.ref.update({
            photos: updatedPhotos,
            updatedAt: new Date(),
          });
        }

        return {
          success: true,
          message: `${uploadedPhotos.length} photos uploaded successfully`,
          uploadedCount: uploadedPhotos.length,
          totalSubmitted: photos.length,
        };
      } catch (error) {
        throw new Error(
          `Photo upload failed: ${
            error instanceof Error
              ? error.message
              : String(error)
          }`
        );
      }
    }
  );

export default uploadGalleryPhotos;
