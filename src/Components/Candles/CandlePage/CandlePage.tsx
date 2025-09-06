import {
  collection,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import CandleModel from "../../../Models/CandleModel";
import "./CandlePage.css";
import {
  useState,
  useMemo,
} from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { CandleCard } from "../CandleCard/CandleCard";
import { AddCandle } from "../AddCandle/AddCandle";

export function CandlePage(): React.ReactElement {
  const [showAddCandle, setShowAddCandle] =
    useState(false);

  const candlesQuery = useMemo(() => {
    return query(
      collection(db, "candles"),
      where("status", "==", "Approved"),
      orderBy("createdAt", "desc")
    );
  }, []);

  const [candlesSnapshot, loading, error] =
    useCollection(candlesQuery);

  const approvedCandles = useMemo(() => {
    if (!candlesSnapshot) return [];
    return candlesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return new CandleModel(
        doc.id,
        data.writerName,
        data.text,
        data.createdAt,
        data.status
      );
    });
  }, [candlesSnapshot]);

  return (
    <div className="CandlePage">
      <div className="CandlePage__header">
        <h1>הדלק נר זיכרון</h1>
        <p className="subtitle">
          שתף מחשבות וזיכרונות
        </p>
        <div className="candlePage-container">
          <div className="addCandle-container">
            <button
              className="addCandle-button"
              onClick={() =>
                setShowAddCandle(true)
              }
            >
              הדלק נר לזכר גל
            </button>
          </div>
          <div className="candlePage-list">
            {loading ? (
              <div className="loading">
                טוען נרות...
              </div>
            ) : error ? (
              <div className="error">
                לא ניתן לטעון נרות
                {error.message}
              </div>
            ) : approvedCandles.length === 0 ? (
              <div className="empty-state">
                Be the first to light a candle and
                share your memories
              </div>
            ) : (
              approvedCandles.map((candle) => (
                <CandleCard
                  key={candle.id}
                  candle={candle}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showAddCandle && (
        <AddCandle onClose={setShowAddCandle} />
      )}
    </div>
  );
}
