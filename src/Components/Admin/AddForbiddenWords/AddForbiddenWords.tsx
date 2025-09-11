import { useState } from "react";
import "./AddForbiddenWords.css";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../../firebase-config";

interface ForbiddenWord {
  id: string;
  word: string;
}

interface AddForbiddenWordsProps {
  onWordsAdded?: () => void;
}

export function AddForbiddenWords({
  onWordsAdded,
}: AddForbiddenWordsProps): React.ReactElement {
  const [words, setWords] = useState<
    ForbiddenWord[]
  >([{ id: "1", word: "" }]);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [wordToDelete, setWordToDelete] =
    useState<ForbiddenWord | null>(null);

  const addWordField = () => {
    const newWord: ForbiddenWord = {
      id: Date.now().toString(),
      word: "",
    };
    setWords([...words, newWord]);
  };

  const removeWordField = (id: string) => {
    if (words.length > 1) {
      const wordToRemove = words.find(
        (word) => word.id === id
      );
      if (wordToRemove) {
        setWordToDelete(wordToRemove);
        setShowDeleteModal(true);
      }
    }
  };

  const confirmDelete = () => {
    if (wordToDelete) {
      setWords(
        words.filter(
          (word) => word.id !== wordToDelete.id
        )
      );
    }
    setShowDeleteModal(false);
    setWordToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setWordToDelete(null);
  };

  const updateWord = (
    id: string,
    value: string
  ) => {
    setWords(
      words.map((word) =>
        word.id === id
          ? { ...word, word: value }
          : word
      )
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const validWords = words.filter(
      (word) => word.word.trim() !== ""
    );

    if (validWords.length === 0) {
      alert("אנא הוסף לפחות מילה אחת");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the backend function to add forbidden words
      const addForbiddenWords = httpsCallable(
        functions,
        "addForbiddenWords"
      );

      const wordsToAdd = validWords.map(
        (word) => word.word
      );

      const result = await addForbiddenWords({
        words: wordsToAdd,
      });

      console.log(
        "Words added successfully:",
        result.data
      );

      setSuccessMessage(
        `${validWords.length} מילים נוספו בהצלחה!`
      );

      // Reset form
      setWords([
        { id: Date.now().toString(), word: "" },
      ]);

      // Notify parent component to refresh the list
      if (onWordsAdded) {
        onWordsAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(
        () => setSuccessMessage(""),
        3000
      );
    } catch (error) {
      console.error(
        "Error adding forbidden words:",
        error
      );
      alert("שגיאה בשמירת המילים");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="AddForbiddenWords">
      {/* Admin page - no SEO needed, prevent indexing */}
      <meta
        name="robots"
        content="noindex, nofollow"
      />

      <div className="approve-header">
        <h2>הוספת מילים אסורות</h2>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="words-section">
        <h3>רשימת מילים</h3>

        <div className="words-list">
          {words.map((word, index) => (
            <div
              key={word.id}
              className="word-item"
            >
              <div className="word-number">
                {index + 1}
              </div>
              <input
                type="text"
                value={word.word}
                onChange={(e) =>
                  updateWord(
                    word.id,
                    e.target.value
                  )
                }
                placeholder="הכנס מילה אסורה"
                className="word-input"
                required
              />
              <button
                type="button"
                onClick={() =>
                  removeWordField(word.id)
                }
                className="delete-btn"
                disabled={words.length === 1}
                title="מחק מילה"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={addWordField}
            className="add-word-btn"
          >
            + הוסף מילה נוספת
          </button>
        </div>
      </div>

      <div className="submit-section">
        <button
          onClick={handleSubmit}
          className="submit-button"
          disabled={
            isSubmitting ||
            words.filter(
              (w) => w.word.trim() !== ""
            ).length === 0
          }
        >
          {isSubmitting
            ? "שומר..."
            : "שמור מילים"}
        </button>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>מחיקת מילה</h3>
            </div>
            <div className="delete-modal-body">
              <p>
                האם אתה בטוח שברצונך למחוק את
                המילה:
              </p>
              <div className="word-to-delete">
                "{wordToDelete?.word}"
              </div>
            </div>
            <div className="delete-modal-actions">
              <button
                className="cancel-btn"
                onClick={cancelDelete}
              >
                ביטול
              </button>
              <button
                className="confirm-delete-btn"
                onClick={confirmDelete}
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
