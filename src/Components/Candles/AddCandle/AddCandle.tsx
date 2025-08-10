import { FaTimes } from "react-icons/fa";
import "./AddCandle.css";
import { FaC } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import CandleModel from "../../../Models/CandleModel";
import candleService from "../../../Services/CandleService";
import { useState } from "react";

interface AddCandleProps {
  onClose: (show: boolean) => void;
}

export function AddCandle({
  onClose,
}: AddCandleProps): React.ReactElement {
  const { register, handleSubmit } =
    useForm<CandleModel>();
  const [isSubmitted, setIsSubmitted] =
    useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

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
          <div className="flame">
            <div className="inner-flame"></div>
          </div>
          <div className="wax"></div>
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
                className="input"
                type="text"
                {...register("writerName")}
                placeholder=" "
                aria-label="Writer name"
              />
              <label className="label">
                שם הכותב
              </label>
            </div>
            <div className="input-group">
              <textarea
                {...register("text")}
                className="input"
                placeholder=" "
                aria-label="Message text"
                rows={4}
              />
              <label className="label">
                טקסט
              </label>
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
