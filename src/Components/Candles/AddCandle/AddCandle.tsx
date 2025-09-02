import { FaTimes } from "react-icons/fa";
import "./AddCandle.css";
import { useForm } from "react-hook-form";
import CandleModel from "../../../Models/CandleModel";
import candleService from "../../../Services/CandleService";
import { useState } from "react";
import { CandleImage } from "../CandleImage/CandleImage";

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
  const MAX_TEXT_LENGTH = 256;

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;
    if (text.length <= MAX_TEXT_LENGTH) {
      setTextLength(text.length);
    }
  };

  const sendCandle = async (
    candle: CandleModel
  ) => {
    if (isSubmitting) return; // Prevent double submission

    try {
      setIsSubmitting(true);
      await candleService.addCandle(candle);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Error sending candle:",
        error
      );
      setIsSubmitting(false); // Reset on error
    }
  };

  return (
    <div className="AddCandle">
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
                })}
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
                  onChange: handleTextChange,
                })}
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
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
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
