import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import subscriberService from "../../../Services/SubscriberService";
import "./Unsubscribe.css";

export function Unsubscribe(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleUnsubscribe = async () => {
      try {
        const subscriberId =
          searchParams.get("id");

        if (!subscriberId) {
          setError("קישור לא תקין");
          setStatus("error");
          return;
        }

        await subscriberService.unsubscribeSubscriber(
          subscriberId
        );
        setStatus("success");
      } catch (error: any) {
        const errorMessage =
          error?.customData?.message ||
          error?.message ||
          "אירעה שגיאה בעת ביטול ההרשמה";

        setError(errorMessage);
        setStatus("error");
      }
    };

    handleUnsubscribe();
  }, [searchParams]);

  return (
    <div className="unsubscribe-container">
      <div className="unsubscribe-content">
        {status === "loading" && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>מבטל מנוי...</p>
          </div>
        )}

        {status === "success" && (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2>המנוי בוטל בהצלחה</h2>
            <p>
              ביטלת בהצלחה את המנוי לעדכונים. לא
              תקבל עוד הודעות מאיתנו.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="error-state">
            <div className="error-icon">✗</div>
            <h2>שגיאה בביטול המנוי</h2>
            <p>{error}</p>
            <p>
              אם הבעיה נמשכת, אנא צור איתנו קשר
              ישירות.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
