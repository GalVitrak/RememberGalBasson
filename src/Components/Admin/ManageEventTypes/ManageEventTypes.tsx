import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { adminService } from "../../../Services/AdminService";
import "./ManageEventTypes.css";
import { useMemo } from "react";
import { db } from "../../../../firebase-config";

interface EventType {
  id: string;
  name: string;
  description: string;
  defaultImageId: string;
  defaultImageUrl: string;
  createdAt: string;
}

export function ManageEventTypes(): React.ReactElement {
  const navigate = useNavigate();
  const [eventTypes, setEventTypes] = useState<
    EventType[]
  >([]);
  const [isProcessing, setIsProcessing] =
    useState<{ [key: string]: boolean }>({});
  const [newTypeName, setNewTypeName] =
    useState("");
  const [
    newTypeDescription,
    setNewTypeDescription,
  ] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

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

  const eventTypesQuery = useMemo(() => {
    return query(collection(db, "eventTypes"));
  }, []);

  const deleteEventType = async (id: string) => {
    try {
      setIsProcessing((prev) => ({
        ...prev,
        [id]: true,
      }));

      // Get the document reference
      const eventTypeRef = doc(
        db,
        "eventTypes",
        id
      );

      // Delete the document
      await deleteDoc(eventTypeRef);

      // Update local state
      setEventTypes((prev) =>
        prev.filter(
          (eventType) => eventType.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting event type:",
        error
      );
    } finally {
      setIsProcessing((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const addEventType = async () => {
    if (!newTypeName.trim() || !selectedFile) {
      alert(
        "נא למלא את כל השדות הנדרשים כולל תמונה ברירת מחדל"
      );
      return;
    }

    try {
      setIsAdding(true);

      // Convert image to base64
      const base64String =
        await convertFileToBase64(selectedFile);

      // Prepare data for Firebase function
      const eventTypeData = {
        name: newTypeName.trim(),
        description: newTypeDescription.trim(),
        imageData: {
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          base64Data: base64String,
        },
      };

      console.log(
        "Sending event type data to AdminService"
      );

      // Call through AdminService
      const response =
        await adminService.addEventType(
          eventTypeData
        );

      console.log(
        "Event type added successfully:",
        response
      );

      // Clear form
      setNewTypeName("");
      setNewTypeDescription("");
      setSelectedFile(null);
      setImagePreview(null);

      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(
        "Error adding event type:",
        error
      );
      alert(
        "שגיאה בהוספת סוג האירוע. אנא נסה שוב."
      );
    } finally {
      setIsAdding(false);
    }
  };

  const [eventTypesSnapshot, loading, error] =
    useCollection(eventTypesQuery);

  useEffect(() => {
    if (eventTypesSnapshot) {
      const eventTypesData =
        eventTypesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
          } as EventType;
        });
      setEventTypes(eventTypesData);
    }
  }, [eventTypesSnapshot]);

  return (
    <div className="ManageEventTypes">
      <div className="approve-header">
        <h2>ניהול סוגי אירועים</h2>
        <button
          onClick={() => navigate(-1)}
          className="back-button"
        >
          חזרה לעמוד הקודם
        </button>
      </div>

      <div className="event-types-description">
        <p>ניהול סוגי האירועים הזמינים במערכת</p>
        <p>
          ניתן להוסיף סוגי אירועים חדשים ולמחוק
          קיימים
        </p>
      </div>

      <div className="add-type-section">
        <div className="add-type-form">
          <input
            type="text"
            placeholder="שם סוג האירוע"
            value={newTypeName}
            onChange={(e) =>
              setNewTypeName(e.target.value)
            }
            className="type-name-input"
          />
          <input
            type="text"
            placeholder="תיאור סוג האירוע"
            value={newTypeDescription}
            onChange={(e) =>
              setNewTypeDescription(
                e.target.value
              )
            }
            className="type-description-input"
          />
          <div className="image-upload-section">
            <label className="image-upload-label">
              תמונת ברירת מחדל *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-upload-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="תצוגה מקדימה"
                  className="preview-image"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedFile(null);
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
            onClick={addEventType}
            disabled={
              !newTypeName.trim() ||
              !selectedFile ||
              isAdding
            }
            className="add-type-button"
          >
            {isAdding ? "מוסיף..." : "+ הוסף סוג"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          טוען סוגי אירועים...
        </div>
      )}

      {error && (
        <div className="error">
          שגיאה בטעינת סוגי האירועים:{" "}
          {error.message}
        </div>
      )}

      {!loading &&
        !error &&
        eventTypes.length === 0 && (
          <div className="no-event-types">
            אין סוגי אירועים להצגה
          </div>
        )}

      {!loading &&
        !error &&
        eventTypes.length > 0 && (
          <div className="event-types-container">
            {eventTypes.map((eventType) => (
              <div
                key={eventType.id}
                className="event-type-card"
              >
                {eventType.defaultImageUrl && (
                  <div className="event-type-card__image">
                    <img
                      src={
                        eventType.defaultImageUrl
                      }
                      alt={eventType.name}
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="event-type-card__content">
                  <div className="event-type-card__header">
                    <h3 className="event-type-card__title">
                      {eventType.name}
                    </h3>
                  </div>

                  <div className="event-type-card__description">
                    <p>
                      {eventType.description ||
                        "אין תיאור"}
                    </p>
                  </div>
                </div>

                <div className="event-type-actions">
                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteEventType(
                        eventType.id
                      )
                    }
                    disabled={
                      isProcessing[eventType.id]
                    }
                  >
                    <span className="btn-icon">
                      ✕
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
