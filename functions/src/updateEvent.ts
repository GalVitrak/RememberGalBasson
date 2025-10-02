import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { db } from "./index";
import { logEventActivity } from "./logger";

const updateEvent = functions.https.onCall(
  async (data, context) => {
    try {
      const {
        id,
        title,
        type,
        date,
        time, // Add time field
        description,
        location,
        locationLink,
        imageData,
        oldImageId,
        deleteCurrentImage,
        defaultImageData,
      } = data;

      // Validate input
      if (!id || typeof id !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event ID is required"
        );
      }

      if (!title || typeof title !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event title is required"
        );
      }

      if (!type || typeof type !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event type is required"
        );
      }

      if (!date || typeof date !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event date is required"
        );
      }

      if (!time || typeof time !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event time is required"
        );
      }

      // Check if event exists
      const eventRef = db
        .collection("events")
        .doc(id);
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Event not found"
        );
      }

      const oldEventData = eventDoc.data();

      // Update the event
      const updateData: any = {
        title: title.trim(),
        type: type.trim(),
        date: date,
        time: time, // Add time to update data
        updatedAt: new Date().toISOString(),
      };

      // Add optional fields if provided
      if (description !== undefined) {
        updateData.description =
          description.trim();
      }

      if (location !== undefined) {
        updateData.location = location.trim();
      }

      if (locationLink !== undefined) {
        updateData.locationLink =
          locationLink.trim();
      }

      // Handle image replacement if provided
      if (imageData) {
        try {
          const bucket = admin.storage().bucket();
          const imageId = uuidv4();
          const fileExtension =
            imageData.fileName.split(".").pop() ||
            "jpg";
          const fileName = `events/${id}/${imageId}.${fileExtension}`;

          const file = bucket.file(fileName);
          const imageBuffer = Buffer.from(
            imageData.base64Data,
            "base64"
          );

          await file.save(imageBuffer, {
            metadata: {
              contentType: imageData.mimeType,
            },
          });
          await file.makePublic();

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

          updateData.coverImageId = imageId;
          updateData.coverImageUrl = publicUrl;

          // Delete old image if it exists
          if (oldImageId) {
            try {
              const oldImagePath = `events/${id}/${oldImageId}`;
              // const oldFile =
              bucket.file(oldImagePath);

              // Try to delete with common extensions
              const extensions = [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
              ];
              for (const ext of extensions) {
                try {
                  const oldFileWithExt =
                    bucket.file(
                      `${oldImagePath}${ext}`
                    );
                  const [exists] =
                    await oldFileWithExt.exists();
                  if (exists) {
                    await oldFileWithExt.delete();

                    break;
                  }
                } catch (extError) {
                  // Continue trying other extensions
                }
              }
            } catch (deleteError) {
              console.warn(
                "Error deleting old image:",
                deleteError
              );
              // Don't fail the operation
            }
          }
        } catch (imageError) {
          console.error(
            "Error handling image replacement:",
            imageError
          );
          throw new functions.https.HttpsError(
            "internal",
            "Failed to process image replacement"
          );
        }
      }

      // Handle deletion of current image to use default
      if (deleteCurrentImage) {
        try {
          // Delete old image from storage if it exists
          if (oldImageId) {
            const bucket = admin
              .storage()
              .bucket();
            const oldImagePath = `events/${id}/${oldImageId}`;

            // Try to delete with common extensions
            const extensions = [
              ".jpg",
              ".jpeg",
              ".png",
              ".webp",
            ];
            for (const ext of extensions) {
              try {
                const oldFileWithExt =
                  bucket.file(
                    `${oldImagePath}${ext}`
                  );
                const [exists] =
                  await oldFileWithExt.exists();
                if (exists) {
                  await oldFileWithExt.delete();

                  break;
                }
              } catch (extError) {
                // Continue trying other extensions
              }
            }
          }

          // Use default image if provided, otherwise clear the fields
          if (
            defaultImageData &&
            defaultImageData.useDefaultImage
          ) {
            updateData.coverImageId =
              defaultImageData.defaultImageId;
            updateData.coverImageUrl =
              defaultImageData.defaultImageUrl;
          } else {
            // Clear the image fields if no default image
            updateData.coverImageId = null;
            updateData.coverImageUrl = null;
          }
        } catch (deleteError) {
          console.warn(
            "Error deleting current image:",
            deleteError
          );
          // Don't fail the operation
        }
      }

      await eventRef.update(updateData);

      // Log event update
      await logEventActivity.updated(id, title, {
        type: type,
        date: date,
        location: location,
        updatedBy: context.auth?.uid || "admin",
        updatedAt: new Date().toISOString(),
        changes: {
          oldTitle: oldEventData?.title,
          oldType: oldEventData?.type,
          oldDate: oldEventData?.date,
        },
      });

      return {
        success: true,
        message: "Event updated successfully",
      };
    } catch (error) {
      console.error(
        "Error in updateEvent function:",
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

export default updateEvent;
