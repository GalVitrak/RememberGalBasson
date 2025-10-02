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
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;
