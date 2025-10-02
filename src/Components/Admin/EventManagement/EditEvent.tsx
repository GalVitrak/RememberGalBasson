import { useState, useEffect } from "react";
import { Modal } from "antd";
import "./EditEvent.css";

interface EditEventProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null;
  eventTypes: any[];
  onEventUpdated: () => void;
}

export function EditEvent({
  isOpen,
  onClose,
  event,
  eventTypes,
  onEventUpdated,
}: EditEventProps) {
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDescription, setEditDescription] =
    useState("");
  const [editLocation, setEditLocation] =
    useState("");
  const [editLocationLink, setEditLocationLink] =
    useState("");
  const [isUpdating, setIsUpdating] =
    useState(false);

  // Edit validation errors
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    type?: string;
    date?: string;
    time?: string;
    description?: string;
    location?: string;
  }>({});

  // Image editing states
  const [editSelectedFile, setEditSelectedFile] =
    useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] =
    useState<string | null>(null);
  const [
    deleteCurrentImage,
    setDeleteCurrentImage,
  ] = useState(false);

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      // Convert DD/MM/YYYY to YYYY-MM-DD for date input
      const [day, month, year] =
        event.date.split("/");
      const formattedDate = `${year}-${month.padStart(
        2,
        "0"
      )}-${day.padStart(2, "0")}`;

      setEditName(event.title);
      setEditType(event.type || "");
      setEditDate(formattedDate);
      setEditTime(event.time || "");
      setEditDescription(event.description || "");
      setEditLocation(event.location || "");
      setEditLocationLink(
        event.locationLink || ""
      );
      setEditErrors({});
      setEditSelectedFile(null);
      setEditImagePreview(null);
      setDeleteCurrentImage(false);
    }
  }, [event]);

  const handleEditImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(
          reader.result as string
        );
      };
      reader.readAsDataURL(file);
    } else {
      setEditSelectedFile(null);
      setEditImagePreview(null);
    }
  };

  const handleDeleteCurrentImage = () => {
    setEditSelectedFile(null);
    setEditImagePreview(null);
    setDeleteCurrentImage(true);

    // Clear the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const convertFileToBase64 = (
    file: File
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
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

  const validateEditForm = () => {
    const errors: any = {};

    if (!editName?.trim()) {
      errors.name = "כותרת האירוע היא שדה חובה";
    }

    if (!editType || editType === "") {
      errors.type =
        "בחירת סוג אירוע היא שדה חובה";
    }

    if (!editDate) {
      errors.date = "תאריך האירוע הוא שדה חובה";
    }

    if (!editTime) {
      errors.time = "שעת האירוע היא שדה חובה";
    }

    if (!editDescription?.trim()) {
      errors.description =
        "תיאור האירוע הוא שדה חובה";
    }

    if (!editLocation?.trim()) {
      errors.location =
        "מיקום האירוע הוא שדה חובה";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditEvent = async () => {
    if (!event) return;

    // Validate form
    if (!validateEditForm()) {
      return;
    }

    try {
      setIsUpdating(true);

      const updateData: any = {
        id: event.id,
        title: editName.trim(),
        type: editType.trim(),
        date: editDate,
        time: editTime,
        description: editDescription.trim(),
        location: editLocation.trim(),
        locationLink: editLocationLink.trim(),
      };

      // Handle image data if a new image is selected
      if (editSelectedFile) {
        const base64String =
          await convertFileToBase64(
            editSelectedFile
          );
        updateData.imageData = {
          fileName: editSelectedFile.name,
          mimeType: editSelectedFile.type,
          base64Data: base64String,
        };
        updateData.oldImageId =
          event.coverImageId;
      }

      // Handle deletion of current image to use default
      if (deleteCurrentImage) {
        updateData.deleteCurrentImage = true;
        updateData.oldImageId =
          event.coverImageId;

        // Find the event type to get its default image
        const selectedEventType = eventTypes.find(
          (eventType) =>
            eventType.name === editType
        );

        if (
          selectedEventType &&
          selectedEventType.defaultImageUrl
        ) {
          updateData.defaultImageData = {
            fileName: "default_image",
            mimeType: "image/jpeg",
            useDefaultImage: true,
            defaultImageId:
              selectedEventType.defaultImageId,
            defaultImageUrl:
              selectedEventType.defaultImageUrl,
          };
        }
      }

      // Import eventService dynamically to avoid circular dependencies
      const { default: eventService } =
        await import(
          "../../../Services/EventService"
        );
      await eventService.updateEvent(updateData);

      onEventUpdated();
      onClose();
    } catch (error) {
      // Error handled by notification system
    } finally {
      setIsUpdating(false);
    }
  };

  const closeEditModal = () => {
    onClose();
  };

  if (!event) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={closeEditModal}
      footer={null}
      title="עריכת אירוע"
      centered
      width={800}
      style={{ direction: "rtl" }}
      destroyOnHidden
    >
      <div className="edit-event-content">
        <div className="edit-form-group">
          <label className="edit-form-label required">
            שם האירוע
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) =>
              setEditName(e.target.value)
            }
            className={`edit-form-input ${
              editErrors.name ? "error" : ""
            }`}
            placeholder="שם האירוע"
          />
          {editErrors.name && (
            <span className="error-message">
              {editErrors.name}
            </span>
          )}
        </div>

        <div className="edit-form-row">
          <div className="edit-form-group">
            <label className="edit-form-label required">
              סוג האירוע
            </label>
            <select
              value={editType}
              onChange={(e) =>
                setEditType(e.target.value)
              }
              className={`edit-form-select ${
                editErrors.type ? "error" : ""
              }`}
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
            {editErrors.type && (
              <span className="error-message">
                {editErrors.type}
              </span>
            )}
          </div>

          <div className="edit-form-group">
            <label className="edit-form-label required">
              תאריך
            </label>
            <input
              type="date"
              value={editDate}
              onChange={(e) =>
                setEditDate(e.target.value)
              }
              className={`edit-form-input ${
                editErrors.date ? "error" : ""
              }`}
            />
            {editErrors.date && (
              <span className="error-message">
                {editErrors.date}
              </span>
            )}
          </div>

          <div className="edit-form-group">
            <label className="edit-form-label required">
              שעה
            </label>
            <input
              type="time"
              value={editTime}
              onChange={(e) =>
                setEditTime(e.target.value)
              }
              className={`edit-form-input ${
                editErrors.time ? "error" : ""
              }`}
            />
            {editErrors.time && (
              <span className="error-message">
                {editErrors.time}
              </span>
            )}
          </div>
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label required">
            תיאור
          </label>
          <textarea
            value={editDescription}
            onChange={(e) =>
              setEditDescription(e.target.value)
            }
            className={`edit-form-textarea ${
              editErrors.description
                ? "error"
                : ""
            }`}
            placeholder="תיאור האירוע"
            rows={4}
          />
          {editErrors.description && (
            <span className="error-message">
              {editErrors.description}
            </span>
          )}
        </div>

        <div className="edit-form-row">
          <div className="edit-form-group">
            <label className="edit-form-label required">
              מיקום
            </label>
            <input
              type="text"
              value={editLocation}
              onChange={(e) =>
                setEditLocation(e.target.value)
              }
              className={`edit-form-input ${
                editErrors.location ? "error" : ""
              }`}
              placeholder="מיקום האירוע"
            />
            {editErrors.location && (
              <span className="error-message">
                {editErrors.location}
              </span>
            )}
          </div>

          <div className="edit-form-group">
            <label className="edit-form-label">
              קישור למיקום
            </label>
            <input
              type="url"
              value={editLocationLink}
              onChange={(e) =>
                setEditLocationLink(
                  e.target.value
                )
              }
              className="edit-form-input"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>

        <div className="edit-form-group">
          <label className="edit-form-label">
            תמונת אירוע
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleEditImageChange}
            className="edit-form-input"
          />

          {/* Image Preview Section */}
          <div className="edit-image-preview-section">
            {editImagePreview ? (
              <div className="edit-image-preview">
                <img
                  src={editImagePreview}
                  alt="תמונה חדשה"
                  className="preview-image"
                />
                <div className="image-preview-info">
                  <span className="new-image-label">
                    תמונה חדשה
                  </span>
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setEditImagePreview(null);
                      setEditSelectedFile(null);
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
              </div>
            ) : event?.coverImageUrl &&
              !deleteCurrentImage ? (
              <div className="edit-image-preview">
                <img
                  src={event.coverImageUrl}
                  alt="תמונה נוכחית"
                  className="preview-image"
                />
                <div className="image-preview-info">
                  <span className="current-image-label">
                    תמונה נוכחית
                  </span>
                  <p className="image-hint">
                    בחר תמונה חדשה להחלפה
                  </p>
                  <button
                    type="button"
                    className="delete-current-image-btn"
                    onClick={() =>
                      handleDeleteCurrentImage()
                    }
                    title="מחק תמונה נוכחית והשתמש בתמונת ברירת מחדל"
                  >
                    מחק תמונה נוכחית
                  </button>
                </div>
              </div>
            ) : deleteCurrentImage ? (
              <div className="image-deletion-preview">
                <div className="deletion-info">
                  <span className="deletion-label">
                    תמונה נוכחית תימחק
                  </span>
                  <p className="deletion-hint">
                    תתבצע שימוש בתמונת ברירת מחדל
                    של סוג האירוע
                  </p>
                  <button
                    type="button"
                    className="undo-deletion-btn"
                    onClick={() =>
                      setDeleteCurrentImage(false)
                    }
                  >
                    בטל מחיקה
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-image-text">
                אין תמונת כיסוי לאירוע זה
              </div>
            )}
          </div>
        </div>

        <div className="edit-form-buttons">
          <button
            className="save-btn"
            onClick={handleEditEvent}
            disabled={isUpdating}
          >
            {isUpdating
              ? "שומר..."
              : "שמור שינויים"}
          </button>
          <button
            className="cancel-btn"
            onClick={closeEditModal}
            disabled={isUpdating}
          >
            ביטול
          </button>
        </div>
      </div>
    </Modal>
  );
}
