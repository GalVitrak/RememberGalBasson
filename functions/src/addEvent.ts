import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { db } from "./index";

const addEvent = functions.https.onCall(
  async (data, context) => {
    const { event } = data;

    // Validate required fields
    if (!event) {
      throw new Error("Event data is missing");
    }

    if (
      !event.title ||
      !event.type ||
      !event.date ||
      !event.time ||
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
        try {
          // Check if using default image
          if (event.imageData.useDefaultImage) {
           
            coverImageId =
              event.imageData.defaultImageId;
            coverImageUrl =
              event.imageData.defaultImageUrl;
          } else {
            // Handle custom image upload
            const {
              fileName,
              mimeType,
              base64Data,
            } = event.imageData;

     

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


            // Get Firebase Storage bucket
            const bucket = admin
              .storage()
              .bucket();
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
            coverImageUrl = `https://storage.googleapis.com/${bucket.name}/${imageId}`;
            coverImageId = uniqueId;

       
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
        time: event.time, // Add time field
        description: event.description,
        location: event.location,
        locationLink: event.locationLink || "",
        coverImageId,
        coverImageUrl,
        createdAt: new Date(),
      };


      const docRef = await db
        .collection("events")
        .add(eventToSave);


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
