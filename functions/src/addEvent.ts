import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { db } from "./index";

const addEvent = functions.https.onCall(
  async (data, context) => {
    console.log(
      "Function called with data:",
      data
    );

    const { event } = data;
    console.log("Received event data:", event);

    // Validate required fields
    if (!event) {
      throw new Error("Event data is missing");
    }

    if (
      !event.title ||
      !event.type ||
      !event.date ||
      !event.description ||
      !event.location
    ) {
      throw new Error(
        "Required event fields are missing"
      );
    }

    try {
      let coverImageId = "";
      let coverImageUrl = "";

      // Handle image upload if image data is provided
      if (event.imageData) {
        console.log("Processing image data...");
        try {
          // Check if using default image
          if (event.imageData.useDefaultImage) {
            console.log(
              "Using default event type image"
            );
            coverImageId =
              event.imageData.defaultImageId;
            coverImageUrl =
              event.imageData.defaultImageUrl;
            console.log("Default image set:", {
              coverImageId,
              coverImageUrl,
            });
          } else {
            // Handle custom image upload
            const {
              fileName,
              mimeType,
              base64Data,
            } = event.imageData;

            console.log("Image details:", {
              fileName,
              mimeType,
              base64Length: base64Data?.length,
            });

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
            const imageId = `events/${uniqueId}.${fileExtension}`;

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(
              base64Data,
              "base64"
            );

            console.log(
              "Image buffer created, size:",
              imageBuffer.length
            );

            // Get Firebase Storage bucket
            const bucket = admin
              .storage()
              .bucket();
            const file = bucket.file(imageId);

            console.log(
              "Uploading to storage path:",
              imageId
            );

            // Upload the file
            await file.save(imageBuffer, {
              metadata: {
                contentType: mimeType,
              },
            });

            console.log(
              "File uploaded, making public..."
            );

            // Make the file publicly readable
            await file.makePublic();

            // Get the public URL
            coverImageUrl = `https://storage.googleapis.com/${bucket.name}/${imageId}`;
            coverImageId = uniqueId;

            console.log(
              "Image uploaded successfully:",
              { uniqueId, coverImageUrl }
            );
          }
        } catch (imageError) {
          console.error(
            "Error processing image:",
            imageError
          );
          throw new Error(
            `Image upload failed: ${
              imageError instanceof Error
                ? imageError.message
                : String(imageError)
            }`
          );
        }
      }

      // Create the event object with image metadata
      const eventToSave = {
        title: event.title,
        type: event.type,
        date: event.date,
        description: event.description,
        location: event.location,
        locationLink: event.locationLink || "",
        coverImageId,
        coverImageUrl,
        createdAt: new Date(),
      };

      console.log(
        "Saving event to Firestore:",
        eventToSave
      );

      const docRef = await db
        .collection("events")
        .add(eventToSave);

      console.log(
        "Event saved with ID:",
        docRef.id
      );

      return {
        success: true,
        message: "Event added successfully",
      };
    } catch (error) {
      console.error("Error adding event:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to add event: " +
          (error instanceof Error
            ? error.message
            : String(error))
      );
    }
  }
);

export default addEvent;
