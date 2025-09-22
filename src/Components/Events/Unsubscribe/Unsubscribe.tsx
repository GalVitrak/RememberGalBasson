import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import subscriberService from "../../../Services/SubscriberService";
import "./Unsubscribe.css";

export function Unsubscribe(): React.ReactElement {
  console.log(
    "🎭 Rendering Unsubscribe component"
  );

  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [error, setError] = useState<string>("");

  // Log state changes
  const setStatusWithLog = (
    newStatus: typeof status
  ) => {
    console.log(
      `🔄 Status changing from ${status} to ${newStatus}`
    );
    setStatus(newStatus);
  };

  const setErrorWithLog = (newError: string) => {
    console.log(
      `⚠️ Error changing to: ${newError}`
    );
    setError(newError);
  };

  useEffect(() => {
    console.log(
      "🔄 Unsubscribe component mounted"
    );
    console.log(
      "📝 Search params:",
      Object.fromEntries(searchParams)
    );

    const handleUnsubscribe = async () => {
      console.log("🎬 Starting unsubscribe flow");
      try {
        const subscriberId =
          searchParams.get("id");
        console.log(
          "🔑 Subscriber ID:",
          subscriberId
        );

        if (!subscriberId) {
          console.error(
            "❌ No subscriber ID provided"
          );
          setErrorWithLog("קישור לא תקין");
          setStatusWithLog("error");
          return;
        }

        console.log(
          "🚀 Calling unsubscribeSubscriber with ID:",
          subscriberId
        );
        await subscriberService.unsubscribeSubscriber(
          subscriberId
        );
        console.log("✅ Unsubscribe successful");
        setStatusWithLog("success");
      } catch (error: any) {
        console.error("❌ Unsubscribe error:", {
          error,
          message: error?.message,
          customData: error?.customData,
          code: error?.code,
          stack: error?.stack,
          details: error?.details,
          response: error?.response,
        });

        const errorMessage =
          error?.customData?.message ||
          error?.message ||
          "אירעה שגיאה בעת ביטול ההרשמה";

        console.log(
          "⚠️ Setting error message:",
          errorMessage
        );
        setErrorWithLog(errorMessage);
        console.log("🔴 Setting status to error");
        setStatusWithLog("error");
      }
    };

    handleUnsubscribe();
  }, [searchParams]);

  // Log current state before render
  console.log("📊 Current state:", {
    status,
    error,
    searchParams:
      Object.fromEntries(searchParams),
  });

  return (
    <div className="unsubscribe-page">
      <div className="unsubscribe-container">
        {status === "loading" && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>מבטל הרשמה...</p>
          </div>
        )}

        {status === "success" && (
          <div className="success-state">
            <h2>הוסרת בהצלחה מרשימת התפוצה</h2>
            <p>
              לא תקבל/י יותר עדכונים על אירועים
              חדשים.
            </p>
            <a href="/" className="home-link">
              חזרה לדף הבית
            </a>
          </div>
        )}

        {status === "error" && (
          <div className="error-state">
            <h2>שגיאה בביטול ההרשמה</h2>
            <p>{error}</p>
            <a href="/" className="home-link">
              חזרה לדף הבית
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
