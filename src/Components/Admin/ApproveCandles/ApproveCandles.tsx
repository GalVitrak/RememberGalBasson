import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
} from "firebase/firestore";
import "./ApproveCandles.css";
import { useMemo } from "react";
import CandleModel from "../../../Models/CandleModel";
import { db } from "../../../../firebase-config";
import candleService from "../../../Services/CandleService";

export function ApproveCandles(): React.ReactElement {
  const [candles, setCandles] = useState<
    CandleModel[]
  >([]);
  const [isProcessing, setIsProcessing] =
    useState<{ [key: string]: boolean }>({});

  const candlesQuery = useMemo(() => {
    return query(
      collection(db, "candles"),
      where("status", "in", [
        "Pending",
        "Reported",
      ])
    );
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setIsProcessing((prev) => ({
        ...prev,
        [id]: true,
      }));

      await candleService.approveCandle(
        id,
        "approve"
      );

      // Update local state - remove from list
      setCandles((prev) =>
        prev.filter((candle) => candle.id !== id)
      );
    } catch (error) {
      alert("שגיאה באישור הנר");
    } finally {
      setIsProcessing((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsProcessing((prev) => ({
        ...prev,
        [id]: true,
      }));

      await candleService.approveCandle(
        id,
        "reject"
      );

      // Update local state - remove from list
      setCandles((prev) =>
        prev.filter((candle) => candle.id !== id)
      );
    } catch (error) {
      alert("שגיאה בדחיית הנר");
    } finally {
      setIsProcessing((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const [candlesSnapshot, loading, error] =
    useCollection(candlesQuery);

  useEffect(() => {
    if (candlesSnapshot) {
      const candlesData =
        candlesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            date: data.date?.toDate()
              ? data.date
                  .toDate()
                  .toLocaleDateString("he-IL")
              : "תאריך לא ידוע",
          } as unknown as CandleModel;
        });
      setCandles(candlesData);
    }
  }, [candlesSnapshot]);

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
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="ApproveCandles">
      {/* Admin page - no SEO needed, prevent indexing */}
      <meta
        name="robots"
        content="noindex, nofollow"
      />

      <div className="approve-header">
        <h2>אישור נרות זיכרון</h2>
        <Link to="/admin" className="back-button">
          חזרה לפאנל ניהול
        </Link>
      </div>

      {loading && (
        <div className="loading">
          טוען נרות...
        </div>
      )}

      {error && (
        <div className="error">
          שגיאה בטעינת הנרות: {error.message}
        </div>
      )}

      {!loading &&
        !error &&
        candles.length === 0 && (
          <div className="no-candles">
            אין נרות ממתינים לאישור
          </div>
        )}

      {!loading &&
        !error &&
        candles.length > 0 && (
          <div className="candles-container">
            {candles.map((candle) => (
              <div
                key={candle.id}
                className="candle-card"
              >
                <div className="candle-header">
                  <span className="candle-writer">
                    {candle.writerName}
                  </span>
                  <span className="candle-date">
                    {formatDate(candle.createdAt)}
                  </span>
                </div>

                <p className="candle-text">
                  {candle.text}
                </p>

                <div className="candle-actions">
                  <button
                    className="approve-btn"
                    onClick={() =>
                      handleApprove(candle.id)
                    }
                    disabled={
                      isProcessing[candle.id]
                    }
                    title="אישור הנר"
                  >
                    ✓
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() =>
                      handleReject(candle.id)
                    }
                    disabled={
                      isProcessing[candle.id]
                    }
                    title="דחייה ומחיקה"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
