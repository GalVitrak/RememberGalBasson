import * as functions from "firebase-functions/v1";
import { db } from "./index";
import * as dotenv from "dotenv";

dotenv.config();

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_GROUP_ID =
  process.env.TELEGRAM_GROUP_ID;

// Function to send message to Telegram group with buttons
async function sendMessage(
  message: string,
  candleId: string
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_GROUP_ID) {
    throw new Error(
      "Telegram bot token or group ID not configured"
    );
  }

  if (!message || message.trim() === "") {
    throw new Error(
      "Message text cannot be empty"
    );
  }

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "✅ אישור",
          callback_data: `approve_${candleId}`,
        },
        {
          text: "🗑️ מחיקה",
          callback_data: `delete_${candleId}`,
        },
      ],
    ],
  };

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_GROUP_ID,
        text: message,
        reply_markup: inlineKeyboard,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(
      `Telegram API error: ${response.status} - ${errorData}`
    );
  }

  const result = await response.json();
  console.log(
    "Message sent successfully:",
    result
  );
}

// Function to handle callback queries (button presses)
export const telegramWebhook =
  functions.https.onRequest(
    async (request, response) => {
      // Set CORS headers
      response.set(
        "Access-Control-Allow-Origin",
        "*"
      );
      response.set(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
      );
      response.set(
        "Access-Control-Allow-Headers",
        "Content-Type"
      );

      if (request.method === "OPTIONS") {
        response.status(200).send("");
        return;
      }

      if (request.method === "GET") {
        response
          .status(200)
          .send("Telegram webhook is active");
        return;
      }

      if (request.method !== "POST") {
        response
          .status(405)
          .send("Method not allowed");
        return;
      }

      try {
        const { callback_query } = request.body;

        if (callback_query) {
          const { data, message, from } =
            callback_query;
          const candleId = data.split("_")[1];
          const action = data.split("_")[0];

          console.log(
            `Button pressed: ${action} for candle ${candleId} by ${from.first_name}`
          );

          // Answer the callback query to remove loading state
          await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                callback_query_id:
                  callback_query.id,
              }),
            }
          );

          // Handle approve/delete logic
          let resultText = "";
          try {
            // Get current candle status to determine appropriate action
            const candleDoc = await db
              .collection("candles")
              .doc(candleId)
              .get();

            if (!candleDoc.exists) {
              resultText = "❌ נר לא נמצא";
            } else {
              const candleData = candleDoc.data();
              const currentStatus =
                candleData?.status;

              if (action === "approve") {
                // Approve the candle
                await db
                  .collection("candles")
                  .doc(candleId)
                  .update({
                    status: "Approved",
                    approvedAt: new Date(),
                  });

                if (
                  currentStatus === "Reported"
                ) {
                  resultText =
                    "✅ נר מדווח אושר!";
                } else {
                  resultText = "✅ נר אושר!";
                }
                console.log(
                  `Candle ${candleId} approved via Telegram`
                );
              } else if (action === "delete") {
                // Delete the candle completely
                await db
                  .collection("candles")
                  .doc(candleId)
                  .delete();

                if (
                  currentStatus === "Reported"
                ) {
                  resultText =
                    "🗑️ נר מדווח נמחק!";
                } else {
                  resultText = "🗑️ נר נמחק!";
                }
                console.log(
                  `Candle ${candleId} deleted via Telegram`
                );
              }
            }
          } catch (dbError) {
            console.error(
              "Database error:",
              dbError
            );
            resultText = "❌ שגיאה בעדכון הנר";
          }

          // Edit the message to show result and remove buttons
          const originalText = message.text;
          const newText = `${originalText}\n\n${resultText}`;

          await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                chat_id: message.chat.id,
                message_id: message.message_id,
                text: newText,
                reply_markup: {
                  inline_keyboard: [],
                }, // Remove buttons
              }),
            }
          );
        }

        response.status(200).send("OK");
      } catch (error) {
        console.error(
          "Error handling callback:",
          error
        );
        response
          .status(500)
          .send("Failed to process callback");
      }
    }
  );

export default sendMessage;
