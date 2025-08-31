import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { Modal } from "antd";
import "./EventManagment.css";
import { useMemo } from "react";
import EventModel from "../../../Models/EventModel";
import { db } from "../../../../firebase-config";
import { AddEvent } from "../AddEvent/AddEvent";

export function EventManagment(): React.ReactElement {
  const navigate = useNavigate();
  const [events, setEvents] = useState<
    EventModel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<Error | null>(null);
  const [
    addEventModalOpen,
    setAddEventModalOpen,
  ] = useState(false);

  const formatDate = (dateString: string) => {
    if (
      !dateString ||
      dateString === "תאריך לא ידוע"
    )
      return dateString;

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("he-IL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="EventManagment">
      <div className="approve-header">
        <h2>ניהול אירועים</h2>
        <Link to="/admin" className="back-button">
          חזרה לפאנל ניהול
        </Link>
      </div>

      <div className="events-description">
        <p>
          ניהול אירועים זיכרון ותצוגת האירועים
          הקיימים
        </p>
        <p>ניתן להוסיף, לערוך ולמחוק אירועים</p>
      </div>

      <div className="event-buttons-section">
        <button
          className="add-event-button"
          onClick={() =>
            setAddEventModalOpen(true)
          }
        >
          + הוסף אירוע חדש
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

      {loading && (
        <div className="loading">
          טוען אירועים...
        </div>
      )}

      {error && (
        <div className="error">
          שגיאה בטעינת האירועים: {error.message}
        </div>
      )}

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
                className="event-card"
              >
                <div className="event-header">
                  <span className="event-title">
                    {event.title}
                  </span>
                  <span className="event-date">
                    {formatDate(event.date)}
                  </span>
                </div>

                <div className="event-details">
                  <div className="event-type">
                    סוג: {event.type.name}
                  </div>
                  <div className="event-location">
                    מיקום: {event.location}
                  </div>
                  <div className="event-description">
                    {event.description}
                  </div>
                </div>

                <div className="event-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      // TODO: Add edit functionality
                      console.log(
                        "Edit event:",
                        event.id
                      );
                    }}
                  >
                    <span className="btn-icon">
                      ✏️
                    </span>
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => {
                      // TODO: Add delete functionality
                      console.log(
                        "Delete event:",
                        event.id
                      );
                    }}
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
        title="הוספת אירוע זיכרון"
      >
        <AddEvent isModal={true} />
      </Modal>
    </div>
  );
}
