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
import adminService from "../../../Services/AdminService";

interface ForbiddenWordItem {
  id: string;
  word: string;
}

export function ForbiddenWords(): React.ReactElement {
  const [ForbiddenWords, setForbiddenWords] =
    useState<ForbiddenWordItem[]>([]);
  const [deletingWords, setDeletingWords] =
    useState<{ [key: string]: boolean }>({});
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [wordToDelete, setWordToDelete] =
    useState<ForbiddenWordItem | null>(null);

  const [addWordModalOpen, setAddWordModalOpen] =
    useState(false);
  const [refreshTrigger, setRefreshTrigger] =
    useState(0);

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
        wordsSnapshot.docs.map((doc) => ({
          id: doc.id,
          word: doc.data().word,
        }))
      );
    }
  }, [wordsSnapshot]);

  const handleDeleteWord = async (
    wordId: string,
    word: string
  ) => {
    const wordToRemove = ForbiddenWords.find(
      (item) => item.id === wordId
    );
    if (wordToRemove) {
      setWordToDelete(wordToRemove);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!wordToDelete) return;

    try {
      setDeletingWords((prev) => ({
        ...prev,
        [wordToDelete.id]: true,
      }));

      await adminService.deleteForbiddenWord(
        wordToDelete.id
      );

      // Remove from local state
      setForbiddenWords((prev) =>
        prev.filter(
          (item) => item.id !== wordToDelete.id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting forbidden word:",
        error
      );
      alert("שגיאה במחיקת המילה");
    } finally {
      setDeletingWords((prev) => ({
        ...prev,
        [wordToDelete.id]: false,
      }));
      setShowDeleteModal(false);
      setWordToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setWordToDelete(null);
  };

  return (
    <div className="ForbiddenWords">
      {/* Admin page - no SEO needed, prevent indexing */}
      <meta
        name="robots"
        content="noindex, nofollow"
      />

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
            {ForbiddenWords.map(
              (wordItem, index) => (
                <div
                  key={wordItem.id}
                  className="word-card"
                >
                  <div className="word-number">
                    {index + 1}
                  </div>
                  <div className="word-text">
                    {wordItem.word}
                  </div>
                  <button
                    className="delete-word-btn"
                    onClick={() =>
                      handleDeleteWord(
                        wordItem.id,
                        wordItem.word
                      )
                    }
                    disabled={
                      deletingWords[wordItem.id]
                    }
                    title="מחק מילה"
                  >
                    {deletingWords[
                      wordItem.id
                    ] ? (
                      <span className="btn-icon">
                        ⏳
                      </span>
                    ) : (
                      <span className="btn-icon">
                        🗑️
                      </span>
                    )}
                  </button>
                </div>
              )
            )}
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
        destroyOnHidden={true}
      >
        <AddForbiddenWords
          onWordsAdded={() => {
            setRefreshTrigger((prev) => prev + 1);
            setAddWordModalOpen(false);
          }}
        />
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>מחיקת מילה אסורה</h3>
            </div>
            <div className="delete-modal-body">
              <p>
                האם אתה בטוח שברצונך למחוק את
                המילה:
              </p>
              <div className="word-to-delete">
                "{wordToDelete?.word}"
              </div>
              <p className="warning-text">
                ⚠️ מילה זו תימחק מהרשימה ולא תוכל
                לחסום נרות
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="cancel-btn"
                onClick={cancelDelete}
                disabled={
                  deletingWords[
                    wordToDelete?.id || ""
                  ]
                }
              >
                ביטול
              </button>
              <button
                className="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={
                  deletingWords[
                    wordToDelete?.id || ""
                  ]
                }
              >
                {deletingWords[
                  wordToDelete?.id || ""
                ]
                  ? "מוחק..."
                  : "מחק"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
