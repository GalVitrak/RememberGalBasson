import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { db } from "./index";

const addEventType = functions.https.onCall(
  async (data, context) => {
    console.log(
      "Received event type data:",
      data
    );

    try {
      let defaultImageId = "";
      let defaultImageUrl = "";

      // Handle image upload if image data is provided
      if (data.imageData) {
        console.log(
          "Processing default image..."
        );
        const { fileName, mimeType, base64Data } =
          data.imageData;

        if (
          !fileName ||
          !mimeType ||
          !base64Data
        ) {
          throw new Error(
            "Missing image data fields"
          );
        }

        // Create a unique filename using UUID
        const fileExtension =
          fileName.split(".").pop() || "jpg";
        const uniqueId = uuidv4();
        const imageId = `eventTypes/${uniqueId}.${fileExtension}`;

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(
          base64Data,
          "base64"
        );

        // Get Firebase Storage bucket
        const bucket = admin.storage().bucket();
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
        defaultImageUrl = `https://storage.googleapis.com/${bucket.name}/${imageId}`;
        defaultImageId = uniqueId;

        console.log(
          "Default image uploaded successfully:",
          { defaultImageId, defaultImageUrl }
        );
      }

      // Create the event type object
      const eventTypeToSave = {
        name: data.name,
        description: data.description,
        defaultImageId,
        defaultImageUrl,
        createdAt: new Date(),
      };

      console.log(
        "Saving event type to Firestore:",
        eventTypeToSave
      );
      const docRef = await db
        .collection("eventTypes")
        .add(eventTypeToSave);

      console.log(
        "Event type saved with ID:",
        docRef.id
      );

      return {
        success: true,
        message: "Event type added successfully",
        id: docRef.id,
      };
    } catch (error) {
      console.error(
        "Error adding event type:",
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Failed to add event type: " +
          (error instanceof Error
            ? error.message
            : String(error))
      );
    }
  }
);

export default addEventType;
