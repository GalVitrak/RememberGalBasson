import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";
import SubscriberModel from "../Models/SubscriberModel";

class SubscriberService {
  public async addSubscriber(
    subscriber: SubscriberModel
  ): Promise<void> {
    try {
      subscriber.lastUpdated =
        new Date().toISOString();
      subscriber.unsubscribed = false;
      const addSubscriber = httpsCallable(
        functions,
        "addSubscriber"
      );
      await addSubscriber({ subscriber });
    } catch (error: any) {
      // If it's a success response (like 304), don't throw
      if (error?.data?.success) {
        return;
      }

      // Pass through the Firebase Functions error message
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "שגיאה בהרשמה לעדכונים. אנא נסה שוב.";

      throw new Error(errorMessage);
    }
  }

  public async unsubscribeSubscriber(
    subscriberId: string
  ): Promise<void> {
    try {
      const unsubscribeSubscriber = httpsCallable(
        functions,
        "unsubscribeSubscriber"
      );
      await unsubscribeSubscriber({
        subscriberId,
      });
    } catch (error: any) {
      // Handle 304 status (already unsubscribed) as success
      if (
        error?.message?.includes("304") ||
        error?.code === "304"
      ) {
        return; // Treat as success
      }

      // Extract error message from Firebase Functions response
      const errorMessage =
        error?.customData?.message || // v9 format
        error?.data?.message || // v8 format
        error?.message ||
        "Failed to unsubscribe";

      throw new Error(errorMessage);
    }
  }

  public async unsubscribeByEmail(
    email: string
  ): Promise<void> {
    try {
      const unsubscribe = httpsCallable(
        functions,
        "handleUnsubscribeLink"
      );
      await unsubscribe({ email });
    } catch (error: any) {
      throw new Error(
        error?.message || "Failed to unsubscribe"
      );
    }
  }
}

const subscriberService = new SubscriberService();
export { subscriberService };
export default subscriberService;
