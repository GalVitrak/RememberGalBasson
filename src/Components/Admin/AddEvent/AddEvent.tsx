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
import eventService from "../../../Services/EventService";
import EventTypeModel from "../../../Models/EventTypeModel";

interface AddEventProps {
  isModal?: boolean;
  onEventAdded?: () => void; // Callback to close modal
}

export function AddEvent({
  isModal = false,
  onEventAdded,
}: AddEventProps): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventModel>();
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [imagePreview, setImagePreview] =
    useState<string | null>(null);
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [showAlert, setShowAlert] =
    useState(false);
  const [alertMessage, setAlertMessage] =
    useState("");
  const [alertType, setAlertType] = useState<
    "success" | "error"
  >("success");

  const showCustomAlert = (
    message: string,
    type: "success" | "error"
  ) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

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
          ? `${selectedEventType.description}. \n ${formData.description}`
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
        time: formData.time, // Add time to the event data
        description: combinedDescription,
        location: formData.location,
        locationLink: formData.locationLink || "",
        imageData: finalImageData, // Send the image data (custom or default) to the backend
      };

      // Call the Firebase function through AdminService
      await eventService.addEvent(eventData);

      // Reset form state
      setSelectedFile(null);
      setImagePreview(null);

      // Reset the file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Reset the form
      const form = document.querySelector("form");
      if (form) {
        (form as HTMLFormElement).reset();
      }

      // Show success message
      showCustomAlert(
        "האירוע נוסף בהצלחה!",
        "success"
      );

      // If in modal, close it by calling the callback
      if (isModal && onEventAdded) {
        onEventAdded();
      }
    } catch (error) {
      // You might want to show an error message to the user here
      showCustomAlert(
        "שגיאה בהוספת האירוע. אנא נסה שוב.",
        "error"
      );
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
      {/* Admin page - no SEO needed, prevent indexing */}
      <meta
        name="robots"
        content="noindex, nofollow"
      />

      {/* Custom Alert */}
      {showAlert && (
        <div
          className={`custom-alert ${alertType}`}
        >
          <div className="alert-content">
            <span className="alert-icon">
              {alertType === "success"
                ? "✓"
                : "✗"}
            </span>
            <span className="alert-message">
              {alertMessage}
            </span>
            <button
              className="alert-close"
              onClick={() => setShowAlert(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {!isModal && <h1>הוספת אירוע זיכרון</h1>}
      <form onSubmit={handleSubmit(send)}>
        <div className="form-group">
          <label className="form-label required">
            כותרת האירוע
          </label>
          <input
            type="text"
            placeholder="הכנס כותרת האירוע"
            className={
              errors.title ? "error" : ""
            }
            {...register("title", {
              required:
                "כותרת האירוע היא שדה חובה",
            })}
          />
          {errors.title && (
            <span className="error-message">
              {errors.title.message}
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">
              סוג האירוע
            </label>
            <select
              className={
                errors.type ? "error" : ""
              }
              {...register("type", {
                required:
                  "בחירת סוג אירוע היא שדה חובה",
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
            {errors.type && (
              <span className="error-message">
                {errors.type.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label required">
              תאריך האירוע
            </label>
            <input
              type="date"
              className={
                errors.date ? "error" : ""
              }
              {...register("date", {
                required:
                  "תאריך האירוע הוא שדה חובה",
              })}
            />
            {errors.date && (
              <span className="error-message">
                {errors.date.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">
              שעת האירוע
            </label>
            <input
              type="time"
              className={
                errors.time ? "error" : ""
              }
              {...register("time", {
                required:
                  "שעת האירוע היא שדה חובה",
              })}
            />
            {errors.time && (
              <span className="error-message">
                {errors.time.message}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label required">
            תיאור האירוע
          </label>
          <textarea
            placeholder="הכנס תיאור מפורט של האירוע"
            rows={4}
            className={
              errors.description ? "error" : ""
            }
            {...register("description", {
              required:
                "תיאור האירוע הוא שדה חובה",
            })}
          />
          {errors.description && (
            <span className="error-message">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">
              מיקום האירוע
            </label>
            <input
              type="text"
              placeholder="הכנס מיקום האירוע"
              className={
                errors.location ? "error" : ""
              }
              {...register("location", {
                required:
                  "מיקום האירוע הוא שדה חובה",
              })}
            />
            {errors.location && (
              <span className="error-message">
                {errors.location.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              קישור למיקום
            </label>
            <input
              type="text"
              placeholder="https://maps.google.com/..."
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
