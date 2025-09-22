import * as functions from "firebase-functions/v1";
import { db } from "./index";
import Mailjet from "node-mailjet";

// Load environment variables
import * as dotenv from "dotenv";
dotenv.config();

// Get environment variables
const MAILJET_API_KEY =
  process.env.MAILJET_API_KEY;
const MAILJET_API_SECRET =
  process.env.MAILJET_API_SECRET;
// Environment check
const IS_DEV =
  process.env.NODE_ENV === "development";

// Base URL for the application
const BASE_URL = IS_DEV
  ? "http://localhost:5173"
  : "https://remembergalbasson.web.app";

if (!MAILJET_API_KEY || !MAILJET_API_SECRET) {
  throw new Error(
    "Mailjet API keys are missing from environment variables"
  );
}

export const mailjet = Mailjet.apiConnect(
  MAILJET_API_KEY,
  MAILJET_API_SECRET
);

// Function triggered when a new event is published
export const onEventPublished =
  functions.firestore
    .document("events/{eventId}")
    .onCreate(async (snap, context) => {
      // Test write to verify trigger is working
      try {
        console.log(
          "🔔 onEventPublished triggered"
        );
        console.log(
          "📝 Event ID:",
          context.params.eventId
        );
        const eventData = snap.data();
        if (!eventData) {
          console.log("❌ No event data found");
          return;
        }
        console.log(
          "📋 Event data:",
          JSON.stringify(eventData, null, 2)
        );

        // Get all active subscribers
        const subscribersSnapshot = await db
          .collection("subscribers")
          .where("unsubscribed", "==", false)
          .get();

        if (subscribersSnapshot.empty) {
          console.log("❌ No subscribers found");
          return;
        }
        console.log(
          "👥 Found subscribers:",
          subscribersSnapshot.docs.length
        );
        console.log(
          "📧 Subscriber emails:",
          subscribersSnapshot.docs.map(
            (doc) => doc.data().email
          )
        );

        // Prepare recipients
        const recipients =
          subscribersSnapshot.docs.map((doc) => ({
            Email: doc.data().email,
            Name: doc.data().name,
            Variables: {
              subscriberId: doc.id,
            },
          }));

        // Log prepared data before sending
        console.log(
          "📧 Preparing to send email with data:",
          {
            recipientCount: recipients.length,
            firstRecipient: recipients[0],
            eventData: {
              title: eventData.title,
              date: eventData.date,
              time: eventData.time,
              location: eventData.location,
              description: eventData.description,
              coverImageUrl:
                eventData.coverImageUrl,
            },
          }
        );

        // // Parse date from DD/MM/YYYY format
        // const [day, month, year] = eventData.date
        //   .split("/")
        //   .map(Number);
        // const eventDateTime = new Date(
        //   year,
        //   month - 1,
        //   day
        // );
        // if (eventData.time) {
        //   const [hours, minutes] = eventData.time
        //     .split(":")
        //     .map(Number);
        //   eventDateTime.setHours(hours, minutes);
        // }

        // Prepare template variables with var: prefix for Mailjet
        const templateVars = {
          subscriber_name:
            recipients[0].Name || "",
          event_title: eventData.title,
          event_date: eventData.date,
          event_time: eventData.time,
          event_location: eventData.location,
          event_description:
            eventData.description,
          event_image: eventData.coverImageUrl,
          event_link: `${BASE_URL}/events/${context.params.eventId}`,
          unsubscribe_url: `${BASE_URL}/unsubscribe?id=${recipients[0].Variables.subscriberId}`,
        };

        // Log template variables for debugging
        console.log(
          "Template Variables:",
          JSON.stringify(templateVars, null, 2)
        );

        // Log the exact payload we're sending to Mailjet
        const mailjetPayload = {
          Messages: [
            {
              From: {
                Email: "galvit25@gmail.com",
                Name: "אתר הנצחה סמ״ר גל בסון ז״ל",
              },
              To: recipients,
              TemplateID: 7330498,
              TemplateLanguage: true,
              Variables: templateVars,
              CustomID: `event_notification_${context.params.eventId}`,
            },
          ],
        };

        console.log("📧 Sending to Mailjet:", {
          templateId: 7330498,
          recipientCount: recipients.length,
          variables: templateVars,
          fullPayload: JSON.stringify(
            mailjetPayload,
            null,
            2
          ),
        });

        // Send emails in batches of 50 recipients (Mailjet's limit)
        try {
          const BATCH_SIZE = 50;
          const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches
          const responses = [];
          const totalBatches = Math.ceil(
            recipients.length / BATCH_SIZE
          );

          // Process batches sequentially with delay
          for (
            let i = 0;
            i < recipients.length;
            i += BATCH_SIZE
          ) {
            const batchNumber =
              Math.floor(i / BATCH_SIZE) + 1;
            const batchRecipients =
              recipients.slice(i, i + BATCH_SIZE);
            const batchPayload = {
              Messages: [
                {
                  ...mailjetPayload.Messages[0],
                  To: batchRecipients,
                },
              ],
            };

            console.log(
              `📧 Sending batch ${batchNumber} of ${totalBatches}`,
              {
                recipientCount:
                  batchRecipients.length,
                firstRecipient:
                  batchRecipients[0].Email,
                lastRecipient:
                  batchRecipients[
                    batchRecipients.length - 1
                  ].Email,
              }
            );

            try {
              // Send batch
              const response = await mailjet
                .post("send", { version: "v3.1" })
                .request(batchPayload);

              responses.push(response);

              console.log(
                `✅ Batch ${batchNumber} sent successfully:`,
                {
                  messageIds: (
                    response.body as any
                  ).Messages?.flatMap((m: any) =>
                    m.To?.map((t: any) => ({
                      email: t.Email,
                      messageId: t.MessageID,
                    }))
                  ),
                }
              );

              // Add delay between batches, except for the last batch
              if (batchNumber < totalBatches) {
                console.log(
                  `⏳ Waiting ${
                    DELAY_BETWEEN_BATCHES / 1000
                  } second before next batch...`
                );
                await new Promise((resolve) =>
                  setTimeout(
                    resolve,
                    DELAY_BETWEEN_BATCHES
                  )
                );
              }
            } catch (batchError: any) {
              console.error(
                `❌ Error sending batch ${batchNumber}:`,
                {
                  error: batchError?.message,
                  status:
                    batchError?.response?.status,
                  errorData:
                    batchError?.response?.data,
                  failedRecipients:
                    batchRecipients.map(
                      (r) => r.Email
                    ),
                }
              );
              throw batchError; // Re-throw to handle in outer catch
            }
          }

          console.log(
            "✅ All batches sent successfully:",
            {
              totalRecipients: recipients.length,
              batchCount: totalBatches,
              messageIds: responses.flatMap(
                (response) =>
                  (
                    response.body as any
                  ).Messages?.flatMap((m: any) =>
                    m.To?.map((t: any) => ({
                      email: t.Email,
                      messageId: t.MessageID,
                    }))
                  )
              ),
              responses: responses.map(
                (response) =>
                  JSON.stringify(
                    response.body,
                    null,
                    2
                  )
              ),
            }
          );
        } catch (mailjetError: any) {
          // Check if it's an array of errors from Promise.all
          if (Array.isArray(mailjetError)) {
            console.error(
              "❌ Multiple batch errors:",
              mailjetError.map(
                (error, index) => ({
                  batchIndex: index,
                  error: error?.message,
                  status: error?.response?.status,
                  statusText:
                    error?.response?.statusText,
                  errorData:
                    error?.response?.data,
                })
              )
            );
          } else {
            console.error("❌ Mailjet Error:", {
              error: mailjetError?.message,
              status:
                mailjetError?.response?.status,
              statusText:
                mailjetError?.response
                  ?.statusText,
              errorData:
                mailjetError?.response?.data,
              sentVariables: templateVars,
              rawError: mailjetError,
            });
          }
          throw mailjetError;
        }

        console.log("✉️ Email request payload:", {
          template: 7330335,
          variables: {
            event_title: eventData.title,
            event_date: eventData.date,
            event_time: eventData.time,
            event_location: eventData.location,
            event_description:
              eventData.description,
            event_image: eventData.coverImageUrl,
            event_link: `${BASE_URL}/events/${context.params.eventId}`,
            unsubscribe_url: `${BASE_URL}/unsubscribe?id=${recipients[0].Variables.subscriberId}`,
          },
        });
      } catch (error) {
        console.error(
          "❌ Error sending notification emails:",
          {
            error:
              error instanceof Error
                ? error.message
                : String(error),
            errorObject: error,
            // Don't reference eventData or recipients here as they might be undefined in catch block
            errorType: error?.constructor?.name,
          }
        );
        // Log more details about the error
        const mailjetError = error as {
          response?: {
            status: number;
            data: any;
          };
        };
        if (mailjetError.response) {
          console.error("Mailjet API Error:", {
            status: mailjetError.response.status,
            data: mailjetError.response.data,
          });
        }
        throw new functions.https.HttpsError(
          "internal",
          "Failed to send notification emails"
        );
      }
    });

// Test function to verify Mailjet setup
export const testMailjet = functions.https.onCall(
  async (data, context) => {
    try {
      const response = await mailjet
        .post("send", { version: "v3.1" })
        .request({
          Messages: [
            {
              From: {
                Email:
                  process.env
                    .MAILJET_SENDER_EMAIL ||
                  "galvit25@gmail.com", // Use your validated email
                Name: "זכרון גל בסון",
              },
              To: [
                {
                  Email: data.testEmail,
                  Name: "Test User",
                },
              ],
              TemplateID: 7330498,
              TemplateLanguage: true,
              Variables: {
                subscriber_name: "Test User",
                event_title: "אירוע בדיקה",
                event_date: "22/09/2025",
                event_time: "12:00",
                event_location: "תל אביב",
                event_description:
                  "זהו אירוע בדיקה",
                event_image:
                  "https://picsum.photos/200/300",
                event_link:
                  "https://remembergalbasson.web.app/events/test",
                unsubscribe_url: `${BASE_URL}/unsubscribe?id=test`,
              },
            },
          ],
        });

      console.log("Email sent successfully:", {
        to: data.testEmail,
        response: response.body,
      });

      return {
        success: true,
        response: response.body,
      };
    } catch (error: any) {
      console.error("Test email failed:", error);
      // Log more details about the error
      if (error?.response) {
        console.error("Mailjet API Error:", {
          status: error.response.status,
          data: error.response.data,
        });
      }
      // Log environment variables (without secrets)
      console.log("Environment check:", {
        hasApiKey: !!process.env.MAILJET_API_KEY,
        hasApiSecret:
          !!process.env.MAILJET_API_SECRET,
      });

      throw new functions.https.HttpsError(
        "internal",
        error.message ||
          "Failed to send test email"
      );
    }
  }
);
