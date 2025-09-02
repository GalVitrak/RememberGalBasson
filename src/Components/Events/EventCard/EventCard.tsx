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

  const handleGoogleMapsClick = () => {
    if (event.locationLink) {
      // Use the locationLink directly for Google Maps
      window.open(event.locationLink, "_blank");
    }
  };

  const handleWazeClick = () => {
    if (event.locationLink) {
      // Extract coordinates from locationLink for Waze navigation
      let wazeUrl = "";

      try {
        // Check if it's a Google Maps URL with coordinates
        if (
          event.locationLink.includes(
            "google.com/maps"
          )
        ) {
          // Extract coordinates from Google Maps URL
          const coordMatch =
            event.locationLink.match(
              /@(-?\d+\.\d+),(-?\d+\.\d+)/
            );
          if (coordMatch) {
            const lat = coordMatch[1];
            const lng = coordMatch[2];
            wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
          } else {
            // Fallback to location name if no coordinates found
            wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
              event.location
            )}&navigate=yes`;
          }
        } else if (
          event.locationLink.includes(
            "maps.apple.com"
          )
        ) {
          // Extract coordinates from Apple Maps URL
          const coordMatch =
            event.locationLink.match(
              /ll=(-?\d+\.\d+),(-?\d+\.\d+)/
            );
          if (coordMatch) {
            const lat = coordMatch[1];
            const lng = coordMatch[2];
            wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
          } else {
            wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
              event.location
            )}&navigate=yes`;
          }
        } else {
          // For other URL types, try to extract coordinates or fallback to location name
          wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
            event.location
          )}&navigate=yes`;
        }

        window.open(wazeUrl, "_blank");
      } catch (error) {
        console.error(
          "Error creating Waze URL:",
          error
        );
        // Fallback to location name
        const fallbackUrl = `https://waze.com/ul?q=${encodeURIComponent(
          event.location
        )}&navigate=yes`;
        window.open(fallbackUrl, "_blank");
      }
    }
  };

  const handleAddToCalendar = () => {
    // Create calendar event data
    const eventDate = new Date(event.date);
    if (event.time) {
      const [hours, minutes] =
        event.time.split(":");
      eventDate.setHours(
        parseInt(hours),
        parseInt(minutes),
        0,
        0
      );
    }

    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 2); // Default 2 hour duration

    // Format dates for calendar
    const startDateStr =
      eventDate
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";
    const endDateStr =
      endDate
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";

    // Create calendar URL
    const calendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.origin}
DTSTART:${startDateStr}
DTEND:${endDateStr}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    // Create download link and trigger download
    const link = document.createElement("a");
    link.href = calendarUrl;
    link.download = `${event.title.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            onError={(e) => {
              // Image failed to load
            }}
            onLoad={() => {
              // Image loaded successfully
            }}
          />
        </div>
      )}

      <div className="event-card__content">
        <div className="event-card__header">
          <h3 className="event-card__title">
            {event.title}
          </h3>
          <div className="event-card__type">
            {event.type}
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

          {/* Only show time for upcoming events */}
          {!isPastEvent && (
            <div className="event-card__time">
              <span className="event-card__label">
                שעה:
              </span>
              <span className="event-card__value">
                {event.time || "לא צוינה"}
              </span>
            </div>
          )}

          <div className="event-card__location">
            <span className="event-card__label">
              מיקום:
            </span>
            <span className="event-card__value">
              {event.location}
            </span>
          </div>

          {/* Navigation Row - Only show for upcoming events */}
          {!isPastEvent && event.locationLink && (
            <div className="event-card__navigation">
              <span className="event-card__label">
                נווט:
              </span>
              <div className="event-card__navigation-buttons">
                <button
                  className="event-card__nav-btn event-card__nav-btn--google"
                  onClick={handleGoogleMapsClick}
                  title="פתח ב-Google Maps"
                  type="button"
                >
                  {/* Google Maps Icon */}
                  <img
                    src="/src/assets/icons/google-maps.png"
                    alt="Google Maps"
                    className="nav-icon"
                  />
                </button>
                <button
                  className="event-card__nav-btn event-card__nav-btn--waze"
                  onClick={handleWazeClick}
                  title="נווט עם Waze"
                  type="button"
                >
                  <img
                    src="/src/assets/icons/waze.png"
                    alt="Waze"
                    className="nav-icon"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Calendar Row - Only show for upcoming events */}
          {!isPastEvent && (
            <div className="event-card__calendar">
              <span className="event-card__label">
                לוח שנה:
              </span>
              <button
                className="event-card__calendar-btn"
                onClick={handleAddToCalendar}
                title="הוסף ללוח השנה"
                type="button"
              >
                <svg
                  className="calendar-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  {/* Calendar Icon */}
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                הוסף ללוח שנה
              </button>
            </div>
          )}
        </div>

        <div className="event-card__description">
          <p>{event.description}</p>
        </div>

        <div className="event-card__footer">
          <span className="event-card__created">
            נוצר ב{formatDate(event.createdAt)}
          </span>
          {event.hasGallery && (
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
