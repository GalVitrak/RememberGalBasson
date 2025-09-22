import * as functions from "firebase-functions/v1";
import { db } from "./index";
import { mailjet } from "./sendEventEmail";

function formatDate(date: Date): string {
  return date.toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jerusalem",
  });
}

const unsubscribeSubscriber =
  functions.https.onCall(
    async (data, context) => {
      const { subscriberId } = data;
      try {
        // Get subscriber document
        const subscriberDoc = await db
          .collection("subscribers")
          .doc(subscriberId)
          .get();

        if (!subscriberDoc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            "Subscriber not found"
          );
        }

        const subscriberData =
          subscriberDoc.data();
        const email = subscriberData?.email;

        if (!email) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Invalid subscriber data"
          );
        }

        // Update Firestore
        await subscriberDoc.ref.update({
          unsubscribed: true,
          lastUpdated: formatDate(new Date()),
        });

        // Update Mailjet - first get the contact
        const mailjetResponse = await mailjet
          .get("contact", { version: "v3" })
          .request({
            Email: email,
          });

        const responseData =
          mailjetResponse.body as any;
        if (responseData?.Data?.length > 0) {
          // Contact exists, update it
          await mailjet
            .put("contact", { version: "v3" })
            .id(responseData.Data[0].ID)
            .request({
              IsExcludedFromCampaigns: true,
            });
        } else {
          // Contact doesn't exist, create it
          await mailjet
            .post("contact", { version: "v3" })
            .request({
              Email: email,
              IsExcludedFromCampaigns: true,
            });
        }
        return {
          success: true,
          message:
            "Subscriber unsubscribed successfully",
        };
      } catch (error: any) {
        console.error(
          "Error unsubscribing subscriber:",
          {
            error,
            message: error?.message,
            code: error?.code,
            response: error?.response?.data,
          }
        );

        // Handle specific Mailjet errors
        if (error?.response?.status === 400) {
          throw new functions.https.HttpsError(
            "already-exists",
            "Contact already unsubscribed"
          );
        }

        throw new functions.https.HttpsError(
          "internal",
          error?.message ||
            "Failed to unsubscribe subscriber"
        );
      }
    }
  );

export default unsubscribeSubscriber;
