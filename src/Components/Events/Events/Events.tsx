import {
  collection,
  orderBy,
  query,
} from "firebase/firestore";
import "./Events.css";
import { useMemo } from "react";
import { db } from "../../../../firebase-config";
import { useCollection } from "react-firebase-hooks/firestore";
import SEO from "../../SEO/SEO";

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
      <SEO
        title="אירועי זיכרון לסמ״ר גל בסון ז״ל | לוח אירועים "
        description="לוח אירועי זיכרון לסמ״ר גל בסון ז״ל. אירועים עתידיים ואירועים שהתקיימו לזכרו של גל, לוחם ביחידת יהל״ם של חיל ההנדסה הקרבית."
        keywords={[
          // Event-specific Keywords
          "אירועי זיכרון גל בסון",
          "לוח אירועים גל בסון",
          "אירועים יחידת יהל״ם",
          "אירועים יחידת יהלום",
          "אירועי זיכרון צה״ל",
          "אירועי הנצחה גל בסון",
          "לוח אירועי זיכרון",
          "אירועי זיכרון חולון",

          // Memorial Keywords
          "הנצחה גל בסון",
          "זיכרון גל בסון",
          "אירועי זיכרון יחידת יהלום",
          "אירועי זיכרון יחידת יהל״ם",

          // English Variations
          "Events Gal Bason",
          "Memorial Events",
          "Gal Bason events",
          "Yahalom unit events",
        ]}
        url="https://remembergalbasson.com/events"
        canonicalUrl="https://remembergalbasson.com/events"
      />

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
