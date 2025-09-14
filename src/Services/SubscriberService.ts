import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";
import SubscriberModel from "../Models/SubscriberModel";

class SubscriberService {
  public async addSubscriber(
    subscriber: SubscriberModel
  ): Promise<void> {
    try {
      const addSubscriber = httpsCallable(
        functions,
        "addSubscriber"
      );
      await addSubscriber({ subscriber });
    } catch (error) {
      throw error;
    }
  }

  public async deleteSubscriber(
    subscriberId: string
  ): Promise<void> {
    try {
      const deleteSubscriber = httpsCallable(
        functions,
        "deleteSubscriber"
      );
      await deleteSubscriber({ subscriberId });
    } catch (error) {
      throw error;
    }
  }
}

const subscriberService = new SubscriberService();
export { subscriberService };
export default subscriberService;

