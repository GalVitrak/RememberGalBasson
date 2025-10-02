import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { Modal, Upload } from "antd";
import "./EventManagement.css";
import { useMemo } from "react";

import { db } from "../../../../firebase-config";
import { AddEvent } from "../AddEvent/AddEvent";
import { EditEvent } from "./EditEvent";
import {
  collection,
  orderBy,
  query,
} from "firebase/firestore";
import { EventCard } from "../../Events/EventCard/EventCard";
import eventService from "../../../Services/EventService";

export function EventManagement(): React.ReactElement {
  const navigate = useNavigate();

  useState<Error | null>(null);
  const [
    addEventModalOpen,
    setAddEventModalOpen,
  ] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] =
    useState(false);
  const [selectedEventId, setSelectedEventId] =
    useState<string | null>(null);
  const [
    selectedEventTitle,
    setSelectedEventTitle,
  ] = useState<string>("");
  const [selectedFiles, setSelectedFiles] =
    useState<any[]>([]);
  const [isUploading, setIsUploading] =
    useState(false);
  const [notification, setNotification] =
    useState<{
      message: string;
      type:
        | "success"
        | "error"
        | "warning"
        | "info";
      visible: boolean;
    } | null>(null);

  // Edit and delete states
  const [editModalOpen, setEditModalOpen] =
    useState(false);
  const [editingEvent, setEditingEvent] =
    useState<any | null>(null);

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);
  const [deletingEvent, setDeletingEvent] =
    useState<any | null>(null);
  const [isDeleting, setIsDeleting] =
    useState(false);

  // Custom notification helper
  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => {
    setNotification({
      message,
      type,
      visible: true,
    });
    setTimeout(() => {
      setNotification(null);
    }, 5000); // Hide after 5 seconds
  };

  const eventsQuery = useMemo(() => {
    return query(
      collection(db, "events"),
      orderBy("date", "desc")
    );
  }, []);

  const [eventsSnapshot, loading, error] =
    useCollection(eventsQuery);

  const events = useMemo(() => {
    if (!eventsSnapshot) return [];
    return eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      // For now, just use the data directly without EventModel to avoid type issues
      return {
        id: doc.id,
        title: data.title,
        type: data.type, // This should be a string
        date: data.date,
        time: data.time, // Add time field
        description: data.description,
        location: data.location,
        locationLink: data.locationLink,
        coverImageId: data.coverImageId,
        coverImageUrl: data.coverImageUrl,
        createdAt: data.createdAt,
        hasGallery: data.hasGallery || false,
      };
    });
  }, [eventsSnapshot]);

  // Event types for default image handling
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
      } as any; // Using any to avoid type issues with Firestore data
    });
  }, [eventTypesSnapshot]);

  const handleUploadPhotos = (
    eventId: string,
    eventTitle: string
  ) => {
    setSelectedEventId(eventId);
    setSelectedEventTitle(eventTitle);
    setSelectedFiles([]);
    setUploadModalOpen(true);

    // Show notification that upload modal opened
    showNotification(
      `העלאת תמונות לאירוע הנצחה "${eventTitle}"`,
      "info"
    );
  };

  const handleFileChange = (info: any) => {
    setSelectedFiles(info.fileList);
  };

  const handleUploadComplete = async () => {
    if (
      !selectedEventId ||
      selectedFiles.length === 0
    ) {
      showNotification(
        "אנא בחר לפחות תמונה אחת להעלאה לזיכרון",
        "warning"
      );
      return;
    }

    setIsUploading(true);

    try {
      // Convert files to base64
      const photosData = [];
      for (const fileItem of selectedFiles) {
        const file = fileItem.originFileObj;
        if (file) {
          const base64Data =
            await convertFileToBase64(file);
          photosData.push({
            fileName: file.name,
            mimeType: file.type,
            base64Data,
          });
        }
      }

      if (photosData.length === 0) {
        throw new Error(
          "לא נמצאו תמונות תקפות להעלאה"
        );
      }

      // Upload photos
      const response =
        await eventService.uploadGalleryPhotos(
          selectedEventId,
          photosData
        );

      // Show success notification
      showNotification(
        `הועלו ${
          response?.uploadedCount || "Unknown"
        } מתוך ${
          response?.totalSubmitted || "Unknown"
        } תמונות לזיכרון "${selectedEventTitle}"`,
        "success"
      );

      // Close modal and reset state
      setUploadModalOpen(false);
      setSelectedEventId(null);
      setSelectedEventTitle("");
      setSelectedFiles([]);
    } catch (error) {
      // Show error notification
      showNotification(
        "שגיאה בהעלאת התמונות לזיכרון. אנא נסה שוב.",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Edit event handlers
  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventUpdated = () => {
    showNotification(
      "האירוע עודכן בהצלחה",
      "success"
    );
    closeEditModal();
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

  // Delete event handlers
  const openDeleteModal = (event: any) => {
    setDeletingEvent(event);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    try {
      setIsDeleting(true);

      await eventService.deleteEvent(
        deletingEvent.id
      );

      showNotification(
        `האירוע "${deletingEvent.title}" נמחק בהצלחה`,
        "success"
      );

      closeDeleteModal();
    } catch (error) {
      showNotification(
        "שגיאה במחיקת האירוע. אנא נסה שוב.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="EventManagment">
      {/* Admin page - no SEO needed, prevent indexing */}
      <meta
        name="robots"
        content="noindex, nofollow"
      />

      <div className="approve-header">
        <h2>ניהול אירועים</h2>
        <Link to="/admin" className="back-button">
          חזרה לפאנל ניהול
        </Link>
      </div>

      <div className="events-description">
        <p>ניתן להוסיף, לערוך ולמחוק אירועים</p>
        <p>ניתן להעלות תמונות לגלריה של האירוע</p>
      </div>

      <div className="event-buttons-section">
        <button
          className="add-event-button"
          onClick={() =>
            setAddEventModalOpen(true)
          }
        >
          הוסף אירוע חדש
        </button>
        <button
          className="add-event-button"
          onClick={() => {
            navigate("/admin/manage-event-types");
          }}
        >
          ניהול סוגי אירועים
        </button>
      </div>

      {!loading &&
        !error &&
        events.length === 0 && (
          <div className="no-events">
            אין אירועים להצגה
          </div>
        )}

      {!loading &&
        !error &&
        events.length > 0 && (
          <div className="events-container">
            {events.map((event) => (
              <div
                key={event.id}
                className="admin-event-wrapper"
              >
                <EventCard event={event} />
                <div className="admin-actions">
                  <button
                    className="admin-upload-btn"
                    onClick={() =>
                      handleUploadPhotos(
                        event.id,
                        event.title
                      )
                    }
                    title="העלה תמונות לאירוע הנצחה"
                  >
                    📷
                  </button>

                  <button
                    className="admin-edit-btn"
                    onClick={() =>
                      openEditModal(event)
                    }
                    title="ערוך אירוע"
                  >
                    ✏️
                  </button>

                  <button
                    className="admin-delete-btn"
                    onClick={() =>
                      openDeleteModal(event)
                    }
                    title="מחק אירוע"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal
        open={addEventModalOpen}
        closable={true}
        onCancel={() =>
          setAddEventModalOpen(false)
        }
        footer={null}
        centered={true}
        width={900}
        style={{ direction: "rtl" }}
        destroyOnHidden={true}
        title="הוספת אירוע הנצחה"
      >
        <AddEvent
          isModal={true}
          onEventAdded={() =>
            setAddEventModalOpen(false)
          }
        />
      </Modal>

      <Modal
        open={uploadModalOpen}
        closable={true}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
        centered={true}
        width={600}
        style={{ direction: "rtl" }}
        destroyOnHidden={true}
        title={`העלאת תמונות לגלריה - ${selectedEventTitle}`}
      >
        <div className="upload-gallery-content">
          <p>העלה תמונות לגלריית האירוע</p>
          <Upload.Dragger
            name="photos"
            multiple={true}
            accept="image/*"
            beforeUpload={() => false} // Prevent auto upload
            onChange={handleFileChange}
            fileList={selectedFiles}
            style={{
              background: "#fafafa",
              border: "2px dashed #d9d9d9",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center" as const,
            }}
          >
            <p className="ant-upload-drag-icon">
              📷
            </p>
            <p className="ant-upload-text">
              לחץ או גרור תמונות לכאן להעלאה
            </p>
            <p className="ant-upload-hint">
              ניתן לבחור מספר תמונות בו זמנית
            </p>
          </Upload.Dragger>

          <div
            className="upload-actions"
            style={{
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            <button
              onClick={handleUploadComplete}
              disabled={
                isUploading ||
                selectedFiles.length === 0
              }
              style={{
                backgroundColor:
                  isUploading ||
                  selectedFiles.length === 0
                    ? "#ccc"
                    : "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor:
                  isUploading ||
                  selectedFiles.length === 0
                    ? "not-allowed"
                    : "pointer",
                marginLeft: "10px",
              }}
            >
              {isUploading
                ? "מעלה..."
                : `העלה ${selectedFiles.length} תמונות`}
            </button>
            <button
              onClick={() =>
                setUploadModalOpen(false)
              }
              disabled={isUploading}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: isUploading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              ביטול
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Event Modal */}
      <EditEvent
        isOpen={editModalOpen}
        onClose={closeEditModal}
        event={editingEvent}
        eventTypes={eventTypes}
        onEventUpdated={handleEventUpdated}
      />

      {/* Delete Event Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onCancel={closeDeleteModal}
        footer={null}
        title="מחיקת אירוע"
        centered
        width={400}
        style={{ direction: "rtl" }}
      >
        <div className="delete-event-content">
          <p>
            האם אתה בטוח שברצונך למחוק את האירוע{" "}
            <strong>
              "{deletingEvent?.title}"
            </strong>
            ?
          </p>
          <p className="delete-warning">
            פעולה זו תמחק את האירוע, הגלריה שלו
            וכל התמונות הקשורות אליו. פעולה זו
            אינה ניתנת לביטול.
          </p>

          <div className="delete-event-buttons">
            <button
              className="confirm-delete-btn"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting
                ? "מוחק..."
                : "מחק אירוע"}
            </button>
            <button
              className="cancel-delete-btn"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              ביטול
            </button>
          </div>
        </div>
      </Modal>

      {/* Custom Notification */}
      {notification && notification.visible && (
        <div
          className={`custom-notification ${notification.type}`}
        >
          <div className="notification-content">
            <span className="notification-message">
              {notification.message}
            </span>
            <button
              className="notification-close"
              onClick={() =>
                setNotification(null)
              }
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
