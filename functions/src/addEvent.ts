import * as functions from "firebase-functions/v1";
import { getStorage } from "firebase-admin/storage";
import { Timestamp } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";
import { logEventActivity } from "./logger";
import { db } from "./index";

const addEvent = functions.https.onCall(
  async (data, context) => {
    const { event } = data;

    // Validate required fields
    if (!event) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Event data is missing"
      );
    }

    if (
      !event.title ||
      !event.type ||
      !event.date ||
      !event.time ||
      !event.description ||
      !event.location
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
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
              throw new functions.https.HttpsError(
                "invalid-argument",
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
            const bucket = getStorage().bucket();
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
          throw new functions.https.HttpsError(
            "internal",
            `Image upload failed: ${
              imageError instanceof Error
                ? imageError.message
                : String(imageError)
            }`
          );
        }
      }

      // Create the event object with image metadata
      // Combine date and time into a Firestore timestamp
      // Validate date format
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(event.date)
      ) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid date format. Expected YYYY-MM-DD"
        );
      }

      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(event.time)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid time format. Expected HH:mm"
        );
      }

      console.log(
        "Creating date from:",
        event.date,
        event.time
      );
      const [year, month, day] = event.date
        .split("-")
        .map(Number);
      const [hours, minutes] = event.time
        .split(":")
        .map(Number);

      // Validate date components
      if (
        year < 2000 ||
        year > 2100 ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31
      ) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid date values"
        );
      }

      // Validate time components
      if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid time values"
        );
      }

      const eventDateTime = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes
      );
      console.log(
        "Created eventDateTime:",
        eventDateTime
      );

      // Validate the created date is valid
      if (isNaN(eventDateTime.getTime())) {
        throw new functions.https.HttpsError(
          "internal",
          "Failed to create valid date from input"
        );
      }

      // Format date as DD/MM/YYYY
      const formattedDate = `${day
        .toString()
        .padStart(2, "0")}/${month
        .toString()
        .padStart(2, "0")}/${year}`;

      const eventToSave = {
        title: event.title,
        type: event.type,
        date: formattedDate,
        time: event.time,
        description: event.description,
        location: event.location,
        locationLink: event.locationLink || "",
        coverImageId,
        coverImageUrl,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const eventRef = await db
        .collection("events")
        .add(eventToSave);

      // Log event creation
      await logEventActivity.added(
        eventRef.id,
        event.title,
        {
          type: event.type,
          date: formattedDate,
          location: event.location,
          createdBy: context.auth?.uid || "admin",
        }
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
