import {
  collection,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import CandleModel from "../../../Models/CandleModel";
import "./CandlePage.css";
import { useState, useMemo } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { CandleCard } from "../CandleCard/CandleCard";
import { AddCandle } from "../AddCandle/AddCandle";
import SEO from "../../SEO/SEO";

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
        data.status,
        data.approvedAt,
        data.reported
      );
    });
  }, [candlesSnapshot]);

  return (
    <div className="CandlePage">
      <SEO
        title="הדלק נר זיכרון לזכר סמ״ר גל בסון ז״ל | נרות וירטואליים"
        description="הדלק נר זיכרון וירטואלי לזכרו של סמ״ר גל בסון ז״ל. שתף מחשבות, זיכרונות ותפילות לזכר הלוחם ביחידת יהל״ם של חיל ההנדסה הקרבית."
        keywords={[
          // Candle-specific Keywords
          "נר זיכרון גל בסון",
          "הדלק נר זיכרון",
          "נרות וירטואליים",
          "זיכרון לחללי צה״ל",
          "נר זיכרון יחידת יהלום",
          "נר זיכרון יחידת יהל״ם",
          "הדלק נר זיכרון גל בסון",
          "נר זיכרון וירטואלי גל בסון",

          // Memorial Keywords
          "זיכרון וירטואלי",
          "נר זיכרון חולון",
          "נר זיכרון צה״ל",
          "הנצחה וירטואלית",
          "זיכרון לחלל גל בסון",

          // English Variations
          "Virtual Candle Gal Bason",
          "Memorial Candles",
          "Gal Bason candle",
          "Yahalom unit memorial candle",
          "Virtual memorial candle",
        ]}
        url="https://remembergalbason.com/candles"
        canonicalUrl="https://remembergalbason.com/candles"
      />

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
                תהיה הראשון להדליק נר ולשתף
                זיכרונות
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
