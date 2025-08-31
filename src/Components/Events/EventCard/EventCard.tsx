import React from "react";
import "./EventCard.css";
import EventModel from "../../../Models/EventModel";

interface EventCardProps {
  event: EventModel;
  isPastEvent?: boolean;
}

export function EventCard({
  event,
  isPastEvent = false,
}: EventCardProps): React.ReactElement {
  const formatDate = (dateInput: any) => {
    let date: Date;

    // Handle different date formats
    if (
      dateInput &&
      typeof dateInput === "object" &&
      dateInput.toDate
    ) {
      // Firestore Timestamp
      date = dateInput.toDate();
    } else if (
      dateInput &&
      typeof dateInput === "object" &&
      dateInput.seconds
    ) {
      // Firestore Timestamp object with seconds
      date = new Date(dateInput.seconds * 1000);
    } else if (dateInput) {
      // Regular date string or Date object
      date = new Date(dateInput);
    } else {
      return "תאריך לא זמין";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "תאריך לא זמין";
    }

    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLocationClick = () => {
    if (event.locationLink) {
      window.open(event.locationLink, "_blank");
    }
  };

  const handleGalleryClick = () => {
    // Navigate to gallery for this specific event
    // For now, we'll navigate to a general gallery page
    // TODO: Implement event-specific gallery routing
    window.location.href = `/gallery?event=${event.id}`;
  };

  return (
    <div className="event-card">
      {event.coverImageUrl && (
        <div className="event-card__image">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            loading="lazy"
          />
        </div>
      )}

      <div className="event-card__content">
        <div className="event-card__header">
          <h3 className="event-card__title">
            {event.title}
          </h3>
          <div className="event-card__type">
            {typeof event.type === "string"
              ? event.type
              : event.type.name}
          </div>
        </div>

        <div className="event-card__details">
          <div className="event-card__date">
            <span className="event-card__label">
              תאריך:
            </span>
            <span className="event-card__value">
              {formatDate(event.date)}
            </span>
          </div>

          <div className="event-card__location">
            <span className="event-card__label">
              מיקום:
            </span>
            <span
              className={`event-card__value ${
                event.locationLink
                  ? "event-card__value--link"
                  : ""
              }`}
              onClick={
                event.locationLink
                  ? handleLocationClick
                  : undefined
              }
            >
              {event.location}
            </span>
          </div>
        </div>

        <div className="event-card__description">
          <p>{event.description}</p>
        </div>

        <div className="event-card__footer">
          <span className="event-card__created">
            נוצר ב{formatDate(event.createdAt)}
          </span>
          {isPastEvent && (
            <button
              className="event-card__gallery-btn"
              onClick={handleGalleryClick}
              type="button"
            >
              צפה בגלריית תמונות
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
