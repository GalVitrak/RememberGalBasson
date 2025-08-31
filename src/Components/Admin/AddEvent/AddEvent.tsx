import { useForm } from "react-hook-form";
import "./AddEvent.css";
import EventModel from "../../../Models/EventModel";
import { useMemo, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  collection,
  query,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import { adminService } from "../../../Services/AdminService";
import EventTypeModel from "../../../Models/EventTypeModel";

interface AddEventProps {
  isModal?: boolean;
}

export function AddEvent({
  isModal = false,
}: AddEventProps): React.ReactElement {
  const { register, handleSubmit } =
    useForm<EventModel>();
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [imagePreview, setImagePreview] =
    useState<string | null>(null);
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const convertFileToBase64 = (
    file: File
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove the data:image/jpeg;base64, prefix
          const base64String =
            reader.result.split(",")[1];
          resolve(base64String);
        } else {
          reject(
            new Error(
              "Failed to convert file to base64"
            )
          );
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  async function send(formData: any) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let imageData = null;

      // Convert image to base64 if one is selected
      if (selectedFile) {
        const base64String =
          await convertFileToBase64(selectedFile);
        imageData = {
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          base64Data: base64String,
        };
      }

      // Find the selected event type to get its description and default image
      const selectedEventType = eventTypes.find(
        (eventType) =>
          eventType.name === formData.type
      );

      // Combine event description with event type description
      const combinedDescription =
        selectedEventType
          ? `${selectedEventType.description}\n\n${formData.description}`
          : formData.description;

      // Use default image if no custom image is provided
      let finalImageData: any = imageData;
      if (
        !imageData &&
        selectedEventType &&
        selectedEventType.defaultImageUrl
      ) {
        finalImageData = {
          fileName: "default_image",
          mimeType: "image/jpeg",
          useDefaultImage: true,
          defaultImageId:
            selectedEventType.defaultImageId,
          defaultImageUrl:
            selectedEventType.defaultImageUrl,
        };
      }

      // Create the event object with all the data
      const eventData = {
        title: formData.title,
        type: formData.type, // This is the eventType name from the select
        date: formData.date,
        description: combinedDescription,
        location: formData.location,
        locationLink: formData.locationLink || "",
        imageData: finalImageData, // Send the image data (custom or default) to the backend
      };

      console.log(
        "Sending event data to Firebase function:",
        {
          ...eventData,
          imageData: imageData
            ? "Image data included"
            : "No image",
        }
      );

      // Call the Firebase function through AdminService
      await adminService.addEvent(eventData);

      console.log("Event added successfully!");

      // Reset form state
      setSelectedFile(null);
      setImagePreview(null);

      // Reset the file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // If in modal, you might want to close it here
      // If standalone, you might want to navigate or show success message
    } catch (error) {
      console.error("Error adding event:", error);
      // You might want to show an error message to the user here
      alert("שגיאה בהוספת האירוע. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const eventTypesQuery = useMemo(() => {
    return query(collection(db, "eventTypes"));
  }, []);

  const [eventTypesSnapshot] = useCollection(
    eventTypesQuery
  );

  const eventTypes = useMemo(() => {
    if (!eventTypesSnapshot) return [];
    return eventTypesSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      } as EventTypeModel;
    });
  }, [eventTypesSnapshot]);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  return (
    <div
      className={`AddEvent ${
        !isModal ? "standalone" : ""
      }`}
    >
      {!isModal && <h1>הוספת אירוע זיכרון</h1>}
      <form onSubmit={handleSubmit(send)}>
        <div className="form-group">
          <label className="form-label required">
            כותרת האירוע
          </label>
          <input
            type="text"
            placeholder="הכנס כותרת האירוע"
            {...register("title", {
              required: true,
            })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">
              סוג האירוע
            </label>
            <select
              {...register("type", {
                required: true,
              })}
              defaultValue=""
            >
              <option value="" disabled>
                בחר סוג אירוע
              </option>
              {eventTypes.map((eventType) => (
                <option
                  key={eventType.id}
                  value={eventType.name}
                >
                  {eventType.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">
              תאריך האירוע
            </label>
            <input
              type="date"
              {...register("date", {
                required: true,
              })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label required">
            תיאור האירוע
          </label>
          <textarea
            placeholder="הכנס תיאור מפורט של האירוע"
            rows={4}
            {...register("description", {
              required: true,
            })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">
              מיקום האירוע
            </label>
            <input
              type="text"
              placeholder="הכנס מיקום האירוע"
              {...register("location", {
                required: true,
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              קישור למיקום
            </label>
            <input
              type="text"
              placeholder="קישור למפה או אתר (אופציונלי)"
              {...register("locationLink")}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            תמונת אירוע
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img
                src={imagePreview}
                alt="תצוגה מקדימה של תמונת אירוע"
                className="preview-image"
              />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => {
                  setImagePreview(null);
                  setSelectedFile(null);
                  // Reset the file input
                  const fileInput =
                    document.querySelector(
                      'input[type="file"]'
                    ) as HTMLInputElement;
                  if (fileInput)
                    fileInput.value = "";
                }}
              >
                הסר תמונה
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "שולח..."
            : "הוסף אירוע"}
        </button>
      </form>
    </div>
  );
}
