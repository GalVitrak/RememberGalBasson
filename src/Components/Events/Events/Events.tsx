import {
  collection,
  orderBy,
  query,
} from "firebase/firestore";
import "./Events.css";
import { useMemo } from "react";
import { db } from "../../../../firebase-config";
import { useCollection } from "react-firebase-hooks/firestore";
import EventModel from "../../../Models/EventModel";
import { EventCard } from "../EventCard/EventCard";

export function Events(): React.ReactElement {
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
      return new EventModel(
        doc.id,
        data.title,
        data.type,
        data.date,
        data.description,
        data.location,
        data.locationLink,
        data.coverImageId,
        data.coverImageUrl,
        data.createdAt
      );
    });
  }, [eventsSnapshot]);

  const { upcomingEvents, pastEvents } =
    useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today

      const upcoming = events
        .filter((event) => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        })
        .sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        );

      const past = events
        .filter((event) => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < today;
        })
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        );

      return {
        upcomingEvents: upcoming,
        pastEvents: past,
      };
    }, [events]);

  return (
    <div className="Events">
      {loading && (
        <div className="loading">
          טוען אירועים...
        </div>
      )}
      {error && (
        <div className="error">
          שגיאה: {error.message}
        </div>
      )}
      {!loading && !error && (
        <>
          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <div className="events-section">
              <h2 className="events-section__title">
                אירועים עתידיים
              </h2>
              <div className="events-container">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPastEvent={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Separator Line */}
          {upcomingEvents.length > 0 &&
            pastEvents.length > 0 && (
              <div className="events-separator"></div>
            )}

          {/* Past Events Section */}
          {pastEvents.length > 0 && (
            <div className="events-section">
              <h2 className="events-section__title">
                אירועי עבר
              </h2>
              <div className="events-container">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPastEvent={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Events Message */}
          {!loading &&
            !error &&
            events.length === 0 && (
              <div className="no-events">
                <p>אין אירועים להצגה כרגע</p>
              </div>
            )}
        </>
      )}
    </div>
  );
}
