import {
  collection,
  orderBy,
  query,
} from "firebase/firestore";
import "./Events.css";
import { useMemo, useState } from "react";
import { db } from "../../../../firebase-config";
import { useCollection } from "react-firebase-hooks/firestore";
import SEO from "../../SEO/SEO";

import { EventCard } from "../EventCard/EventCard";
import EventModel from "../../../Models/EventModel";
import { AddSubscriber } from "../addSubscriber/addSubscriber";
import Modal from "antd/es/modal/Modal";

export function Events(): React.ReactElement {
  const [
    showAddSubscriber,
    setShowAddSubscriber,
  ] = useState(false);
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
      // Handle date formats
      const eventDate = data.date; // Already in DD/MM/YYYY format
      const createdAtDate =
        data.createdAt?.toDate?.() ||
        new Date(data.createdAt);

      return new EventModel(
        doc.id,
        data.title,
        data.type,
        eventDate, // Pass the DD/MM/YYYY string directly
        data.time || "",
        data.description || "",
        data.location,
        data.locationLink || "",
        data.coverImageId || "",
        data.coverImageUrl || "",
        createdAtDate.toISOString(),
        data.hasGallery || false
      );
    });
  }, [eventsSnapshot]);

  const { upcomingEvents, pastEvents } =
    useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today

      const parseDateString = (
        dateStr: string
      ) => {
        const [day, month, year] = dateStr
          .split("/")
          .map(Number);
        return new Date(year, month - 1, day);
      };

      const upcoming = events
        .filter((event) => {
          const eventDate = parseDateString(
            event.date
          );
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        })
        .sort(
          (a, b) =>
            parseDateString(a.date).getTime() -
            parseDateString(b.date).getTime()
        );

      const past = events
        .filter((event) => {
          const eventDate = parseDateString(
            event.date
          );
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < today;
        })
        .sort(
          (a, b) =>
            parseDateString(b.date).getTime() -
            parseDateString(a.date).getTime()
        );

      return {
        upcomingEvents: upcoming,
        pastEvents: past,
      };
    }, [events]);

  return (
    <div className="Events">
      <SEO
        title="אירועי הנצחה לסמ״ר גל בסון ז״ל | לוח אירועים "
        description="לוח אירועי הנצחה לסמ״ר גל בסון ז״ל. אירועים עתידיים ואירועים שהתקיימו לזכרו של גל, לוחם ביחידת יהל״ם של חיל ההנדסה הקרבית."
        keywords={[
          // Event-specific Keywords
          "אירועי הנצחה גל בסון",
          "לוח אירועים גל בסון",
          "אירועי הנצחה גל בסון",
          "לוח אירועי הנצחה",

          // Memorial Keywords
          "הנצחה גל בסון",
          "זיכרון גל בסון",

          // English Variations
          "Events Gal Bason",
          "Memorial Events",
          "Gal Bason events",
        ]}
        url="https://remembergalbason.com/events"
        canonicalUrl="https://remembergalbason.com/events"
      />

      <div className="Event_Header">
        <h1>אירועי הנצחה לסמ״ר גל בסון ז״ל</h1>
        <p>
          אירועים עתידיים ואירועים שהתקיימו לזכרו
          של גל, לוחם ביחידת יהל״ם של חיל ההנדסה
          הקרבית.
        </p>
        <p>
          הירשם לרשימת תפוצה לקבלת עדכונים על
          אירועי הנצחה
        </p>
        <button
          onClick={() =>
            setShowAddSubscriber(true)
          }
        >
          הירשם
        </button>
      </div>

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

      <Modal
        open={showAddSubscriber}
        onCancel={() =>
          setShowAddSubscriber(false)
        }
        footer={null}
        centered={true}
        width={600}
        height={400}
        style={{ direction: "rtl" }}
        destroyOnHidden={true}
      >
        <AddSubscriber />
      </Modal>
    </div>
  );
}
