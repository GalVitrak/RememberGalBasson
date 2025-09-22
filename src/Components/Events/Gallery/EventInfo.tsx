import EventModel from "../../../Models/EventModel";
import "./EventInfo.css";

interface EventInfoProps {
  event: EventModel;
}

export function EventInfo({
  event,
}: EventInfoProps): React.ReactElement {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="event-info">
      <h1 className="event-title">
        {event.title}
      </h1>
      <div className="event-details">
        <div className="event-detail">
          <span className="detail-label">
            תאריך:
          </span>
          <span className="detail-value">
            {formatDate(event.date)}
          </span>
        </div>
        <div className="event-detail">
          <span className="detail-label">
            סוג אירוע:
          </span>
          <span className="detail-value">
            {event.type}
          </span>
        </div>
        <div className="event-detail">
          <span className="detail-label">
            מיקום:
          </span>
          <span className="detail-value">
            {event.location}
          </span>
        </div>
        {event.description && (
          <div className="event-description">
            <p>{event.description}</p>
          </div>
        )}
      </div>
      {event.coverImageUrl && (
        <div className="event-cover-image">
          <img
            src={event.coverImageUrl}
            alt={event.title}
          />
        </div>
      )}
    </div>
  );
}
