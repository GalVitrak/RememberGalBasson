import { useState } from "react";
import emailService from "../../../Services/EmailService";
import "./TestEmail.css";

export function TestEmail(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] =
    useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    setStatus({ type: null, message: "" });

    try {
      await emailService.sendTestEmail(email);
      setStatus({
        type: "success",
        message:
          "מייל נשלח בהצלחה! אנא בדוק את תיבת הדואר שלך",
      });
      setEmail("");
    } catch (error) {
      console.error(
        "Failed to send test email:",
        error
      );
      setStatus({
        type: "error",
        message:
          "שגיאה בשליחת המייל. אנא נסה שוב.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="test-email">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="הכנס כתובת אימייל לבדיקה"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSending}
          className="admin-button"
        >
          {isSending
            ? "שולח..."
            : "שלח מייל בדיקה"}
        </button>
      </form>
      {status.type && (
        <div
          className={`status-message ${status.type}`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
