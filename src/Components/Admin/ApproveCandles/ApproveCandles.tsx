import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import "./ApproveCandles.css";
import { useMemo } from "react";
import CandleModel from "../../../Models/CandleModel";
import { db } from "../../../../firebase-config";

export function ApproveCandles(): React.ReactElement {
  const [candles, setCandles] = useState<
    CandleModel[]
  >([]);
  const [isProcessing, setIsProcessing] =
    useState<{ [key: string]: boolean }>({});

  const candlesQuery = useMemo(() => {
    return query(
      collection(db, "candles"),
      where("status", "==", "Pending")
    );
  }, []);

  const approveCandle = async (id: string) => {
    try {
      setIsProcessing((prev) => ({
        ...prev,
        [id]: true,
      }));

      // Get the document reference
      const candleRef = doc(db, "candles", id);

      // Check if document exists
      const candleDoc = await getDoc(candleRef);
      if (!candleDoc.exists()) {
        console.error("Candle not found");
        return;
      }

      // Update the status to Approved
      await updateDoc(candleRef, {
        status: "Approved",
        approvedAt: Timestamp.now(),
      });

      // Update local state
      setCandles((prev) =>
        prev.filter((candle) => candle.id !== id)
      );
    } catch (error) {
      console.error(
        "Error approving candle:",
        error
      );
    } finally {
      setIsProcessing((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const deleteCandle = async (id: string) => {
    try {
      setIsProcessing((prev) => ({
        ...prev,
        [id]: true,
      }));

      // Get the document reference
      const candleRef = doc(db, "candles", id);

      // Delete the document
      await deleteDoc(candleRef);

      // Update local state
      setCandles((prev) =>
        prev.filter((candle) => candle.id !== id)
      );
    } catch (error) {
      console.error(
        "Error deleting candle:",
        error
      );
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
            date: data.date?.toDate
              ? data.date
                  .toDate()
                  .toLocaleDateString("he-IL")
              : "תאריך לא ידוע",
          } as CandleModel;
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
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="ApproveCandles">
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
                    {formatDate(candle.date)}
                  </span>
                </div>

                <p className="candle-text">
                  {candle.text}
                </p>

                <div className="candle-actions">
                  <button
                    className="approve-btn"
                    onClick={() =>
                      approveCandle(candle.id)
                    }
                    disabled={
                      isProcessing[candle.id]
                    }
                  >
                    אשר
                    <span className="btn-icon">
                      ✓
                    </span>
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteCandle(candle.id)
                    }
                    disabled={
                      isProcessing[candle.id]
                    }
                  >
                    מחק
                    <span className="btn-icon">
                      ✕
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
