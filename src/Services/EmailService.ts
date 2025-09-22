import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";

class EmailService {
  public async sendTestEmail(
    testEmail: string
  ): Promise<void> {
    try {
      const testMailjet = httpsCallable(
        functions,
        "testMailjet"
      );
      await testMailjet({ testEmail });
    } catch (error: any) {
      console.error("Test email failed:", {
        error,
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;
