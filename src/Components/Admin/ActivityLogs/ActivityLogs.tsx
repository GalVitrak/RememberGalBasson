import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import "./ActivityLogs.css";
import { db } from "../../../../firebase-config";

interface LogEntry {
  id: string;
  date: any;
  category: string;
  action: string;
  details?: any;
  userId?: string;
}

const CATEGORIES = [
  { value: "all", label: "הכל" },
  { value: "candles", label: "נרות" },
  { value: "subscribers", label: "מנויים" },
  { value: "events", label: "אירועים" },
  { value: "event_types", label: "סוגי אירועים" },
];

export function ActivityLogs(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const logsQuery = useMemo(() => {
    return query(
      collection(db, "activityLogs"),
      orderBy("date", "desc")
    );
  }, []);

  const [logsSnapshot, loading, error] =
    useCollection(logsQuery);

  const logs = useMemo(() => {
    if (!logsSnapshot) return [];
    return logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LogEntry[];
  }, [logsSnapshot]);

  const filteredLogs = useMemo(() => {
    if (selectedCategory === "all") {
      return logs;
    }
    return logs.filter(
      (log) => log.category === selectedCategory
    );
  }, [logs, selectedCategory]);

  const handleCategoryFilter = (
    category: string
  ) => {
    setSelectedCategory(category);
  };

  const formatDate = (timestamp: any) => {
    try {
      let date;
      if (timestamp && timestamp.seconds) {
        // Firestore Timestamp
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp && timestamp.toDate) {
        // Firestore Timestamp method
        date = timestamp.toDate();
      } else if (timestamp) {
        // Regular date
        date = new Date(timestamp);
      } else {
        return "תאריך לא זמין";
      }

      return date.toLocaleDateString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "תאריך לא זמין";
    }
  };

  const getActionLabel = (
    category: string,
    action: string
  ) => {
    const actionLabels: {
      [key: string]: { [key: string]: string };
    } = {
      candles: {
        lit_candle: "הדלקת נר",
        approved_candle: "אישור נר",
        reported_candle: "דיווח על נר",
        deleted_candle: "מחיקת נר",
      },
      subscribers: {
        subscribed: "הרשמה",
        unsubscribed: "ביטול מנוי",
      },
      events: {
        added_event: "הוספת אירוע",
        updated_event: "עדכון אירוע",
        deleted_event: "מחיקת אירוע",
      },
      event_types: {
        added_event_type: "הוספת סוג אירוע",
        updated_event_type: "עדכון סוג אירוע",
        deleted_event_type: "מחיקת סוג אירוע",
      },
      moderation: {
        content_approved: "אישור תוכן",
        content_removed: "הסרת תוכן",
        content_reported: "דיווח על תוכן",
      },
    };

    return (
      actionLabels[category]?.[action] || action
    );
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels: {
      [key: string]: string;
    } = {
      candles: "נרות",
      subscribers: "מנויים",
      events: "אירועים",
      event_types: "סוגי אירועים",
    };

    return categoryLabels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      candles: "#ff7875",
      subscribers: "#52c41a",
      events: "#1890ff",
      event_types: "#722ed1",
      moderation: "#fa8c16",
    };

    return colors[category] || "#666";
  };

  return (
    <div className="activity-logs">
      <div className="logs-header">
        <Link to="/admin" className="back-btn">
          ← חזור לפאנל הניהול
        </Link>
        <h2>לוגי פעילות</h2>
        <button
          className="refresh-btn"
          onClick={() => window.location.reload()}
          disabled={loading}
        >
          {loading ? "טוען..." : "רענן"}
        </button>
      </div>

      <div className="logs-filters">
        <div className="category-filter">
          <label>סינון לפי קטגוריה:</label>
          <select
            value={selectedCategory}
            onChange={(e) =>
              handleCategoryFilter(e.target.value)
            }
            className="filter-select"
          >
            {CATEGORIES.map((category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="logs-stats">
          <span>סה"כ לוגים: {logs.length}</span>
          <span>
            מוצגים: {filteredLogs.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען לוגים...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>
            שגיאה בטעינת הלוגים: {error.message}
          </p>
        </div>
      ) : (
        <div className="logs-container">
          {filteredLogs.length === 0 ? (
            <div className="no-logs">
              <p>אין לוגים להצגה</p>
            </div>
          ) : (
            <div className="logs-list">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="log-entry"
                >
                  <div className="log-header">
                    <div className="log-category">
                      <span
                        className="category-badge"
                        style={{
                          backgroundColor:
                            getCategoryColor(
                              log.category
                            ),
                        }}
                      >
                        {getCategoryLabel(
                          log.category
                        )}
                      </span>
                    </div>
                    <div className="log-date">
                      {formatDate(log.date)}
                    </div>
                  </div>

                  <div className="log-content">
                    <div className="log-action">
                      {getActionLabel(
                        log.category,
                        log.action
                      )}
                    </div>

                    {log.details &&
                      Object.keys(log.details)
                        .length > 0 && (
                        <div className="log-details">
                          <details>
                            <summary>
                              פרטים נוספים
                            </summary>
                            <pre>
                              {JSON.stringify(
                                log.details,
                                null,
                                2
                              )}
                            </pre>
                          </details>
                        </div>
                      )}

                    {log.userId && (
                      <div className="log-user">
                        משתמש: {log.userId}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
