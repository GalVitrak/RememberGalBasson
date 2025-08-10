import { useState } from "react";
import "./AddForbiddenWords.css";

interface ForbiddenWord {
  id: string;
  word: string;
}

export function AddForbiddenWords(): React.ReactElement {
  const [words, setWords] = useState<
    ForbiddenWord[]
  >([{ id: "1", word: "" }]);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");

  const addWordField = () => {
    const newWord: ForbiddenWord = {
      id: Date.now().toString(),
      word: "",
    };
    setWords([...words, newWord]);
  };

  const removeWordField = (id: string) => {
    if (words.length > 1) {
      setWords(
        words.filter((word) => word.id !== id)
      );
    }
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
      // TODO: Implement API call to save forbidden words
      console.log(
        "Saving forbidden words:",
        validWords.map((w) => w.word)
      );

      // Simulate API call
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setSuccessMessage(
        `${validWords.length} מילים נוספו בהצלחה!`
      );

      // Reset form
      setWords([
        { id: Date.now().toString(), word: "" },
      ]);

      // Clear success message after 3 seconds
      setTimeout(
        () => setSuccessMessage(""),
        3000
      );
    } catch (error) {
      console.error(
        "Error saving forbidden words:",
        error
      );
      alert("שגיאה בשמירת המילים");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="AddForbiddenWords">
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
                <span className="btn-icon">
                  ✕
                </span>
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
    </div>
  );
}
