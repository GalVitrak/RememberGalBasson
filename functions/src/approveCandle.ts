import * as functions from "firebase-functions/v1";
import { db } from "./index";
import cyber from "./cyber";
import {
  logCandleActivity,
} from "./logger";

const approveCandle = functions.https.onCall(
  async (data, context) => {
    const { candleId, action, token } = data; // action: "approve" or "reject"

    // Check if user is authenticated using custom token
    if (!token) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    // Verify the token
    try {
      const userData = cyber.verifyToken(token);
      if (!userData) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Invalid token"
        );
      }
    } catch (error) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Invalid token"
      );
    }

    if (!candleId || !action) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "candleId and action are required"
      );
    }

    if (
      action !== "approve" &&
      action !== "reject"
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "action must be 'approve' or 'reject'"
      );
    }

    try {
      if (action === "approve") {
        // Approve the candle
        await db
          .collection("candles")
          .doc(candleId)
          .update({
            status: "Approved",
            approvedAt: new Date(),
          });

        // Log candle approval
        try {
          await logCandleActivity.approved(
            candleId,
            {
              approved: true,
            }
          );
        } catch (logError) {
          // Logging failed, continue
        }

        return {
          success: true,
          message: "Candle approved successfully",
          status: "Approved",
        };
      } else {
        // Delete the candle completely
        const candleDoc = await db
          .collection("candles")
          .doc(candleId)
          .get();
        const candle = candleDoc.data();
        await db
          .collection("candles")
          .doc(candleId)
          .delete();

        // Log candle deletion
        try {
          await logCandleActivity.deleted(
            candleId,
            {
              reason: "rejected by admin",
              text: candle?.text,
              writerName: candle?.writerName,
            }
          );
        } catch (logError) {
          // Logging failed, continue
        }

        return {
          success: true,
          message:
            "Candle rejected and deleted successfully",
          status: "Deleted",
        };
      }
    } catch (error) {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to update candle status"
      );
    }
  }
);

export default approveCandle;
