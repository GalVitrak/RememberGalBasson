import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { db } from "./index";
import { logEventTypeActivity } from "./logger";

const updateEventType = functions.https.onCall(
  async (data, context) => {
    try {
      const {
        id,
        name,
        description,
        imageData,
        oldImageId,
      } = data;

      // Validate input
      if (!id || typeof id !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event type ID is required"
        );
      }

      if (
        !name ||
        typeof name !== "string" ||
        !name.trim()
      ) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Event type name is required"
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

      // Prepare update data
      const updateData: any = {
        name: name.trim(),
        description: description
          ? description.trim()
          : "",
        updatedAt: new Date().toISOString(),
      };

      // Handle image replacement if new image is provided
      if (imageData) {
        // Generate unique ID for the new image
        const imageId = uuidv4();
        const fileExtension =
          imageData.fileName.split(".").pop() ||
          "jpg";
        const fileName = `eventTypes/${imageId}.${fileExtension}`;

        // Upload new image to Storage
        const bucket = admin.storage().bucket();
        const file = bucket.file(fileName);

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(
          imageData.base64Data,
          "base64"
        );

        await file.save(imageBuffer, {
          metadata: {
            contentType: imageData.mimeType,
          },
        });

        // Make the file publicly accessible
        await file.makePublic();

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Update the event type data with new image info
        updateData.defaultImageId = imageId;
        updateData.defaultImageUrl = publicUrl;

        // Delete old image if it exists
        if (oldImageId) {
          try {
            const oldFileName = `eventTypes/${oldImageId}.jpg`; // Assuming jpg extension
            const oldFile =
              bucket.file(oldFileName);

            // Check if file exists before deleting
            const [exists] =
              await oldFile.exists();
            if (exists) {
              await oldFile.delete();
            }

            // Also try with other common extensions
            const extensions = [
              "png",
              "jpeg",
              "webp",
            ];
            for (const ext of extensions) {
              const altFileName = `eventTypes/${oldImageId}.${ext}`;
              const altFile =
                bucket.file(altFileName);
              const [altExists] =
                await altFile.exists();
              if (altExists) {
                await altFile.delete();
                break;
              }
            }
          } catch (deleteError) {
            // Don't fail the whole operation if image deletion fails
          }
        }
      }

      // Update the event type document
      await eventTypeRef.update(updateData);

      await logEventTypeActivity.updated(
        id,
        name,
        description,
        {
          updatedBy: context.auth?.uid || "admin",
        }
      );

      return {
        success: true,
        message:
          "Event type updated successfully",
      };
    } catch (error) {
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

export default updateEventType;
