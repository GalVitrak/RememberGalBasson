import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import { useCollection } from "react-firebase-hooks/firestore";
import "./SubscriberManagement.css";
import subscriberService from "../../../Services/SubscriberService";

interface Subscriber {
  id: string;
  name: string;
  email: string;
  subscribed: boolean;
  lastUpdated: string;
}

export function SubscriberManagement(): React.ReactElement {
  const [unsubscribing, setUnsubscribing] =
    useState<string | null>(null);
  const [notification, setNotification] =
    useState<{
      message: string;
      type:
        | "success"
        | "error"
        | "info"
        | "warning";
      visible: boolean;
    } | null>(null);

  const subscribersQuery = useMemo(() => {
    return query(
      collection(db, "subscribers"),
      orderBy("lastUpdated", "desc")
    );
  }, []);

  const [subscribersSnapshot, loading, error] =
    useCollection(subscribersQuery);

  const subscribers = useMemo(() => {
    if (!subscribersSnapshot) return [];
    return subscribersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        subscribed: !data.unsubscribed,
      };
    }) as Subscriber[];
  }, [subscribersSnapshot]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    setNotification({
      message,
      type,
      visible: true,
    });
    setTimeout(() => {
      setNotification({
        message,
        type,
        visible: false,
      });
    }, 3000);
  };

  const handleUnsubscribe = async (
    subscriberId: string,
    email: string
  ) => {
    try {
      setUnsubscribing(subscriberId);

      await subscriberService.unsubscribeSubscriber(
        subscriberId
      );

      showNotification(
        `המנוי ${email} בוטל בהצלחה`,
        "success"
      );
    } catch (error) {
      showNotification(
        "שגיאה בביטול המנוי",
        "error"
      );
    } finally {
      setUnsubscribing(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="subscriber-management">
      <div className="subscriber-header">
        <Link to="/admin" className="back-btn">
          ← חזור לפאנל הניהול
        </Link>
        <h2>ניהול מנויים</h2>
        <button
          className="refresh-btn"
          onClick={() => window.location.reload()}
          disabled={loading}
        >
          {loading ? "טוען..." : "רענן"}
        </button>
      </div>

      {notification && notification.visible && (
        <div
          className={`notification ${notification.type}`}
        >
          {notification.message}
        </div>
      )}

      <div className="subscriber-stats">
        <div className="stat-card">
          <h3>סה"כ מנויים</h3>
          <span className="stat-number">
            {subscribers.length}
          </span>
        </div>
        <div className="stat-card">
          <h3>מנויים פעילים</h3>
          <span className="stat-number">
            {
              subscribers.filter(
                (sub) => sub.subscribed
              ).length
            }
          </span>
        </div>
        <div className="stat-card">
          <h3>מנויים מבוטלים</h3>
          <span className="stat-number">
            {
              subscribers.filter(
                (sub) => !sub.subscribed
              ).length
            }
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען מנויים...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>
            שגיאה בטעינת המנויים: {error.message}
          </p>
        </div>
      ) : (
        <div className="subscribers-table-container">
          <table className="subscribers-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>אימייל</th>
                <th>סטטוס</th>
                <th>תאריך עדכון אחרון</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td>{subscriber.name}</td>
                  <td>{subscriber.email}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        subscriber.subscribed
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {subscriber.subscribed
                        ? "פעיל"
                        : "מבוטל"}
                    </span>
                  </td>
                  <td>
                    {formatDate(
                      subscriber.lastUpdated
                    )}
                  </td>
                  <td>
                    {subscriber.subscribed ? (
                      <button
                        className="unsubscribe-btn"
                        onClick={() =>
                          handleUnsubscribe(
                            subscriber.id,
                            subscriber.email
                          )
                        }
                        disabled={
                          unsubscribing ===
                          subscriber.id
                        }
                      >
                        {unsubscribing ===
                        subscriber.id
                          ? "מבטל..."
                          : "בטל מנוי"}
                      </button>
                    ) : (
                      <span className="already-unsubscribed">
                        מבוטל
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {subscribers.length === 0 && (
            <div className="no-subscribers">
              <p>אין מנויים במערכת</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
