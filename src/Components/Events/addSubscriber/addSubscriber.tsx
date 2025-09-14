import SubscriberModel from "../../../Models/SubscriberModel";
import "./addSubscriber.css";
import { useForm } from "react-hook-form";
import subscriberService from "../../../Services/SubscriberService";
import { useState } from "react";

export function AddSubscriber(): React.ReactElement {
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [showSuccess, setShowSuccess] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubscriberModel>();

  async function send(
    subscriber: SubscriberModel
  ) {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await subscriberService.addSubscriber(
        subscriber
      );
      setShowSuccess(true);
      reset();
      setTimeout(
        () => setShowSuccess(false),
        3000
      );
    } catch (error) {
      console.error(error);
      alert(
        "שגיאה בהרשמה לעדכונים. אנא נסה שוב."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="addSubscriber">
      <h3>הרשמה לעדכונים</h3>
      <p className="subscribe-description">
        הירשמו לקבלת עדכונים על אירועי זיכרון
        חדשים
      </p>

      <form
        onSubmit={handleSubmit(send)}
        className="subscribe-form"
      >
        <div className="form-group">
          <input
            type="text"
            placeholder="שם מלא"
            className={errors.name ? "error" : ""}
            {...register("name", {
              required: "שם הוא שדה חובה",
              minLength: {
                value: 2,
                message:
                  "שם חייב להכיל לפחות 2 תווים",
              },
            })}
          />
          {errors.name && (
            <span className="error-message">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <input
            type="email"
            placeholder="כתובת אימייל"
            className={
              errors.email ? "error" : ""
            }
            {...register("email", {
              required: "אימייל הוא שדה חובה",
              pattern: {
                value:
                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "כתובת אימייל לא תקינה",
              },
            })}
          />
          {errors.email && (
            <span className="error-message">
              {errors.email.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "נרשם..."
            : "הרשמה לעדכונים"}
        </button>

        {showSuccess && (
          <div className="success-message">
            נרשמת בהצלחה! תקבל/י עדכונים על
            אירועים חדשים
          </div>
        )}
      </form>
    </div>
  );
}
