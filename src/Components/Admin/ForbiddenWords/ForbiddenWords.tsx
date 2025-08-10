import { useEffect, useState } from "react";
import "./ForbiddenWords.css";
import { Modal } from "antd";
import {
  collection,
  query,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";
import { useCollection } from "react-firebase-hooks/firestore";
import { AddForbiddenWords } from "../AddForbiddenWords/AddForbiddenWords";
import { Link } from "react-router-dom";

export function ForbiddenWords(): React.ReactElement {
  const [ForbiddenWords, setForbiddenWords] =
    useState<string[]>([]);

  const [addWordModalOpen, setAddWordModalOpen] =
    useState(false);

  const ForbiddenWordsRef = collection(
    db,
    "ForbiddenWords"
  );

  const wordsQuery = query(ForbiddenWordsRef);

  const [
    wordsSnapshot,
    wordsLoading,
    wordsError,
  ] = useCollection(wordsQuery);

  useEffect(() => {
    if (wordsSnapshot) {
      setForbiddenWords(
        wordsSnapshot.docs.map(
          (doc) => doc.data().word
        )
      );
    }
  }, [wordsSnapshot]);

  return (
    <div className="ForbiddenWords">
      <div className="approve-header">
        <h2>מילים אסורות</h2>
        <Link to="/admin" className="back-button">
          חזרה לפאנל ניהול
        </Link>
      </div>

      <div className="words-description">
        <p>הוספת מילים אסורות למסנן הנרות</p>
        <p>
          נר שידליקו עם מילה מהרשימה מטה יידחה
          אוטומטית
        </p>
      </div>

      <div className="add-word-section">
        <button
          onClick={() =>
            setAddWordModalOpen(true)
          }
          className="add-word-button"
        >
          + הוסף מילה אסורה
        </button>
      </div>

      <div className="words-content">
        <h3>רשימת מילים אסורות</h3>

        {wordsLoading ? (
          <div className="loading">
            טוען מילים אסורות...
          </div>
        ) : ForbiddenWords.length === 0 ? (
          <div className="no-words">
            אין מילים אסורות
          </div>
        ) : (
          <div className="words-grid">
            {ForbiddenWords.map((word, index) => (
              <div
                key={word}
                className="word-card"
              >
                <div className="word-number">
                  {index + 1}
                </div>
                <div className="word-text">
                  {word}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={addWordModalOpen}
        closable={true}
        onCancel={() =>
          setAddWordModalOpen(false)
        }
        footer={null}
        centered={true}
        width={800}
        height={500}
        style={{ direction: "rtl" }}
        destroyOnClose={true}
      >
        <AddForbiddenWords />
      </Modal>
    </div>
  );
}
