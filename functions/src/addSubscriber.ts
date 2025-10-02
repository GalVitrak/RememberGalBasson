import * as functions from "firebase-functions/v1";
import { db } from "./index";
import { mailjet } from "./sendEventEmail";
import { logSubscriberActivity } from "./logger";

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

const addSubscriber = functions.https.onCall(
  async (data, context) => {
    const { subscriber } = data;

    // Set lastUpdated with formatted date
    subscriber.lastUpdated = formatDate(
      new Date()
    );

    try {
      const snapshot = await db
        .collection("subscribers")
        .where("email", "==", subscriber.email)
        .get();
      if (snapshot.empty) {
        // Add to Firestore
        const subscriberRef = await db
          .collection("subscribers")
          .add(subscriber);

        // Send welcome email using Mailjet template
        try {
          const BASE_URL =
            "https://remembergalbason.com";
          const unsubscribeUrl = `${BASE_URL}/unsubscribe?id=${subscriberRef.id}`;

          await mailjet
            .post("send", { version: "v3.1" })
            .request({
              Messages: [
                {
                  From: {
                    Email:
                      "noreply@remembergalbason.com",
                    Name: "אתר הנצחה לזכר גל בסון ז״ל",
                  },
                  To: [
                    {
                      Email: subscriber.email,
                      Name: subscriber.name,
                    },
                  ],
                  TemplateID: 7361495,
                  TemplateLanguage: true,
                  Variables: {
                    subscriber_name:
                      subscriber.name,
                    unsubscribe_url:
                      unsubscribeUrl,
                  },
                },
              ],
            });

          console.log(
            "Welcome email sent successfully to:",
            subscriber.email
          );
        } catch (emailError: any) {
          console.error(
            "Failed to send welcome email:",
            {
              error: emailError,
              message: emailError?.message,
              status:
                emailError?.response?.status,
              data: emailError?.response?.data,
            }
          );
          // Don't throw error here - subscription should still succeed even if email fails
        }

        // Try to add to Mailjet
        try {
          await mailjet
            .post("contact", { version: "v3" })
            .request({
              Email: subscriber.email,
              Name: subscriber.name,
              IsExcludedFromCampaigns: false,
            });

          // Get contact ID and handle list subscription
          const contactResponse = await mailjet
            .get("contact", { version: "v3" })
            .request({
              Email: subscriber.email,
            });

          const contactData =
            contactResponse.body as any;
          if (contactData?.Data?.length > 0) {
            const contactId =
              contactData.Data[0].ID;

            // Check if already in list
            const listResponse = await mailjet
              .get("listrecipient", {
                version: "v3",
              })
              .request({
                ContactID: contactId,
                ListID: 10504842,
              });

            const listData =
              listResponse.body as any;
            if (listData?.Data?.length === 0) {
              // Not in list, add them
              await mailjet
                .post("listrecipient", {
                  version: "v3",
                })
                .request({
                  ContactID: contactId,
                  ListID: 10504842,
                  IsUnsubscribed: false,
                });
            } else {
              // Already in list, update subscription status
              const listRecipientId =
                listData.Data[0].ID;
              await mailjet
                .put("listrecipient", {
                  version: "v3",
                })
                .id(listRecipientId)
                .request({
                  IsUnsubscribed: false,
                });
            }
          }
        } catch (mailjetError: any) {
          console.error("Mailjet Error:", {
            error: mailjetError,
            message: mailjetError?.message,
            status:
              mailjetError?.response?.status,
            data: mailjetError?.response?.data,
          });

          // Handle 304 Not Modified as success
          if (
            mailjetError?.response?.status === 304
          ) {
            console.log(
              "Contact already in desired state"
            );
            return;
          }

          // If contact already exists in Mailjet, update it
          if (
            (mailjetError.statusCode === 400 ||
              mailjetError?.response?.status ===
                400) &&
            (mailjetError.ErrorMessage?.includes(
              "already exists"
            ) ||
              mailjetError?.response?.data?.ErrorMessage?.includes(
                "already exists"
              ))
          ) {
            await mailjet
              .put("contact", { version: "v3" })
              .id(subscriber.email)
              .request({
                Name: subscriber.name,
                IsExcludedFromCampaigns: false,
              });

            // Handle list subscription for existing contact
            const contactResponse = await mailjet
              .get("contact", { version: "v3" })
              .request({
                Email: subscriber.email,
              });

            const contactData =
              contactResponse.body as any;
            if (contactData?.Data?.length > 0) {
              const contactId =
                contactData.Data[0].ID;

              // Check if already in list
              const listResponse = await mailjet
                .get("listrecipient", {
                  version: "v3",
                })
                .request({
                  ContactID: contactId,
                  ListID: 10504842,
                });

              const listData =
                listResponse.body as any;
              if (listData?.Data?.length === 0) {
                // Not in list, add them
                await mailjet
                  .post("listrecipient", {
                    version: "v3",
                  })
                  .request({
                    ContactID: contactId,
                    ListID: 10504842,
                    IsUnsubscribed: false,
                  });
              } else {
                // Already in list, update subscription status
                const listRecipientId =
                  listData.Data[0].ID;
                await mailjet
                  .put("listrecipient", {
                    version: "v3",
                  })
                  .id(listRecipientId)
                  .request({
                    IsUnsubscribed: false,
                  });
              }
            }
          } else {
            throw mailjetError;
          }
        }
        // Log the subscription
        await logSubscriberActivity.subscribed(
          subscriberRef.id,
          subscriber.email,
          subscriber.name,
          { subscribed: true }
        );

        return {
          success: true,
          message:
            "Subscriber added successfully",
        };
      } else {
        const existingSubscriber =
          snapshot.docs[0].data();
        if (existingSubscriber.unsubscribed) {
          // If they were previously unsubscribed, reactivate their subscription
          // Reactivate in Firestore
          await db
            .collection("subscribers")
            .doc(snapshot.docs[0].id)
            .update({
              unsubscribed: false,
              lastUpdated: formatDate(new Date()),
              name: subscriber.name, // Update name in case it changed
            });

          // Send welcome email for reactivated subscriber
          try {
            const BASE_URL =
              "https://remembergalbason.com";
            const unsubscribeUrl = `${BASE_URL}/unsubscribe?id=${snapshot.docs[0].id}`;

            await mailjet
              .post("send", { version: "v3.1" })
              .request({
                Messages: [
                  {
                    From: {
                      Email:
                        "noreply@remembergalbason.com",
                      Name: "אתר הנצחה לזכר גל בסון ז״ל",
                    },
                    To: [
                      {
                        Email: subscriber.email,
                        Name: subscriber.name,
                      },
                    ],
                    TemplateID: 7361495,
                    TemplateLanguage: true,
                    Variables: {
                      subscriber_name:
                        subscriber.name,
                      unsubscribe_url:
                        unsubscribeUrl,
                    },
                  },
                ],
              });

            console.log(
              "Welcome email sent successfully to reactivated subscriber:",
              subscriber.email
            );
          } catch (emailError: any) {
            console.error(
              "Failed to send welcome email to reactivated subscriber:",
              {
                error: emailError,
                message: emailError?.message,
                status:
                  emailError?.response?.status,
                data: emailError?.response?.data,
              }
            );
            // Don't throw error here - subscription should still succeed even if email fails
          }

          // Reactivate in Mailjet
          await mailjet
            .put("contact", { version: "v3" })
            .id(subscriber.email)
            .request({
              Name: subscriber.name,
              IsExcludedFromCampaigns: false,
            });

          // Get contact ID and handle list subscription
          const contactResponse = await mailjet
            .get("contact", { version: "v3" })
            .request({
              Email: subscriber.email,
            });

          const contactData =
            contactResponse.body as any;
          if (contactData?.Data?.length > 0) {
            const contactId =
              contactData.Data[0].ID;

            // Check if already in list
            const listResponse = await mailjet
              .get("listrecipient", {
                version: "v3",
              })
              .request({
                ContactID: contactId,
                ListID: 10504842,
              });

            const listData =
              listResponse.body as any;
            if (listData?.Data?.length === 0) {
              // Not in list, add them
              await mailjet
                .post("listrecipient", {
                  version: "v3",
                })
                .request({
                  ContactID: contactId,
                  ListID: 10504842,
                  IsUnsubscribed: false,
                });
            } else {
              // Already in list, update subscription status
              const listRecipientId =
                listData.Data[0].ID;
              await mailjet
                .put("listrecipient", {
                  version: "v3",
                })
                .id(listRecipientId)
                .request({
                  IsUnsubscribed: false,
                });
            }
          }
          // Log the reactivation
          await logSubscriberActivity.subscribed(
            snapshot.docs[0].id,
            subscriber.email,
            subscriber.name,
            {
              reactivated: true,
            }
          );

          return {
            success: true,
            message:
              "Subscription reactivated successfully",
          };
        } else {
          // They are already subscribed
          throw new functions.https.HttpsError(
            "already-exists",
            "כתובת האימייל הזו כבר רשומה לקבלת עדכונים"
          );
        }
      }
    } catch (error: any) {
      console.error("Error adding subscriber:", {
        error,
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        stack: error?.stack,
      });

      // If it's already a HttpsError (like our "already-exists" error), rethrow it
      if (
        error instanceof
        functions.https.HttpsError
      ) {
        throw error;
      }

      // Handle Mailjet specific errors
      if (error?.response?.status === 304) {
        return {
          success: true,
          message:
            "Subscription updated successfully",
        };
      }

      // Otherwise, wrap it in a new HttpsError with more details
      throw new functions.https.HttpsError(
        "internal",
        error?.response?.data?.ErrorMessage ||
          error?.message ||
          "שגיאה בהרשמה לעדכונים. אנא נסה שוב."
      );
    }
  }
);

export default addSubscriber;
