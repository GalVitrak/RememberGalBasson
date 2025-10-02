import { FaTimes } from "react-icons/fa";
import "./AddCandle.css";
import { useForm } from "react-hook-form";
import CandleModel from "../../../Models/CandleModel";
import candleService from "../../../Services/CandleService";
import { useState, useEffect } from "react";
import { CandleImage } from "../CandleImage/CandleImage";
import SEO from "../../SEO/SEO";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../../firebase-config";

interface AddCandleProps {
  onClose: (show: boolean) => void;
}

export function AddCandle({
  onClose,
}: AddCandleProps): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandleModel>();
  const [isSubmitted, setIsSubmitted] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [textLength, setTextLength] = useState(0);
  const [forbiddenWords, setForbiddenWords] =
    useState<string[]>([]);
  const MAX_TEXT_LENGTH = 256;

  // Load forbidden words on component mount
  useEffect(() => {
    const loadForbiddenWords = async () => {
      try {
        const forbiddenWordsRef = collection(
          db,
          "ForbiddenWords"
        );
        const snapshot = await getDocs(
          forbiddenWordsRef
        );
        const words = snapshot.docs.map((doc) =>
          doc.data().word.toLowerCase()
        );
        setForbiddenWords(words);
      } catch (error) {
        // Continue without forbidden words check
      }
    };
    loadForbiddenWords();
  }, []);

  // Check if text contains forbidden words
  const checkForbiddenWords = (
    text: string
  ): string | null => {
    // Add spaces at start and end to help with word boundary matching
    const lowerText = ` ${text.toLowerCase()} `;
    for (const word of forbiddenWords) {
      const lowerWord = word.toLowerCase();
      // Create a regex pattern that matches the word with Hebrew-aware word boundaries
      const pattern = new RegExp(
        `(?:^|\\s)${lowerWord.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}(?:$|\\s)`,
        "i"
      );
      if (pattern.test(lowerText)) {
        return word;
      }
    }
    return null;
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;
    if (text.length <= MAX_TEXT_LENGTH) {
      setTextLength(text.length);
    }
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    // Allow only English, Hebrew, spaces, and common punctuation
    const allowedPattern =
      /^[a-zA-Z\u0590-\u05FF\s\-'\.]*$/;
    if (allowedPattern.test(value)) {
      e.target.value = value;
    } else {
      // Remove invalid characters
      e.target.value = value.replace(
        /[^a-zA-Z\u0590-\u05FF\s\-'\.]/g,
        ""
      );
    }
  };

  const handleMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    // Allow only English, Hebrew, spaces, and common punctuation
    const allowedPattern =
      /^[a-zA-Z\u0590-\u05FF\s\-'\.\,\!\?]*$/;
    if (allowedPattern.test(value)) {
      e.target.value = value;
    } else {
      // Remove invalid characters
      e.target.value = value.replace(
        /[^a-zA-Z\u0590-\u05FF\s\-'\.\,\!\?]/g,
        ""
      );
    }

    handleTextChange(e);
  };

  const sendCandle = async (
    candle: CandleModel
  ) => {
    if (
      isSubmitting ||
      Object.keys(errors).length > 0
    )
      return; // Prevent submission if submitting or has validation errors

    try {
      setIsSubmitting(true);
      await candleService.addCandle(candle);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose(false);
      }, 2000);
    } catch (error: any) {
      // Check if it's a forbidden word error from the backend
      alert("שגיאה בשליחת הנר. אנא נסה שוב.");
      setIsSubmitting(false); // Reset on error
    }
  };

  return (
    <div className="AddCandle">
      <SEO
        title="הדלק נר זיכרון לסמ״ר גל בסון ז״ל | הוסף נר וירטואלי"
        description="הוסף נר זיכרון וירטואלי לזכרו של סמ״ר גל בסון ז״ל. שתף מחשבות, זיכרונות ותפילות לזכר הלוחם ביחידת יהל״ם."
        keywords={[
          // Add Candle Keywords
          "הוסף נר זיכרון",
          "נר וירטואלי גל בסון",
          "הדלק נר זיכרון",
          "זיכרון לחללי צה״ל",
          "הוסף נר זיכרון גל בסון",
          "נר זיכרון יחידת יהלום",
          "נר זיכרון יחידת יהל״ם",

          // Memorial Keywords
          "הוספת נר זיכרון",
          "נר זיכרון וירטואלי",
          "הנצחה וירטואלית",
          "זיכרון לחלל גל בסון",
          "נר זיכרון חולון",

          // English Variations
          "Add Virtual Candle",
          "Memorial Candle",
          "Add candle Gal Bason",
          "Virtual candle memorial",
          "Add memorial candle",
        ]}
        url="https://remembergalbason.com/add-candle"
        canonicalUrl="https://remembergalbason.com/add-candle"
      />

      <div className="addCandle-form">
        <button
          className="close-button"
          onClick={() => onClose(false)}
          aria-label="Close form"
        >
          <FaTimes />
        </button>
        <div className="candle">
          <CandleImage />
        </div>
        {isSubmitted ? (
          <div className="success-message">
            הנר נשלח לאישור, תודה על השיתוף
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(sendCandle)}
          >
            <div className="input-group">
              <input
                className={`input ${
                  errors.writerName ? "error" : ""
                }`}
                type="text"
                {...register("writerName", {
                  required:
                    "שם הכותב הוא שדה חובה",
                  validate: {
                    noForbiddenWords: (value) => {
                      const forbidden =
                        checkForbiddenWords(
                          value
                        );
                      const result =
                        !forbidden ||
                        `המילה "${forbidden}" בשם הכותב אסורה לשימוש`;
                      return result;
                    },
                  },
                })}
                onChange={(e) => {
                  handleNameChange(e);
                  register("writerName").onChange(
                    e
                  );
                }}
                placeholder=" "
                aria-label="Writer name"
              />
              <label className="label">
                שם הכותב
              </label>
              {errors.writerName && (
                <span className="error-message">
                  {errors.writerName.message}
                </span>
              )}
            </div>
            <div className="input-group">
              <textarea
                {...register("text", {
                  required: "טקסט הוא שדה חובה",
                  maxLength: MAX_TEXT_LENGTH,
                  validate: {
                    noForbiddenWords: (value) => {
                      const forbidden =
                        checkForbiddenWords(
                          value
                        );
                      const result =
                        !forbidden ||
                        `המילה "${forbidden}" אסורה לשימוש בהקדשה`;
                      return result;
                    },
                  },
                })}
                onChange={(e) => {
                  handleMessageChange(e);
                  register("text").onChange(e);
                }}
                className={`input ${
                  errors.text ? "error" : ""
                }`}
                placeholder=" "
                aria-label="Message text"
                rows={4}
                maxLength={MAX_TEXT_LENGTH}
              />
              <label className="label">
                הקדשה
              </label>
              {errors.text && (
                <span className="error-message">
                  {errors.text.message}
                </span>
              )}
              <div className="character-counter">
                <span
                  className={
                    textLength >
                    MAX_TEXT_LENGTH * 0.9
                      ? "warning"
                      : ""
                  }
                >
                  {textLength}/{MAX_TEXT_LENGTH}
                </span>
              </div>
            </div>

            {/* Show forbidden word error */}
            {(errors.writerName?.type ===
              "forbidden" ||
              errors.text?.type ===
                "forbidden") && (
              <div className="forbidden-word-error">
                {errors.writerName?.type ===
                "forbidden"
                  ? errors.writerName.message
                  : errors.text?.message}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={
                isSubmitting ||
                Object.keys(errors).length > 0
              }
            >
              {isSubmitting
                ? "שולח..."
                : "הוסף נר"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
