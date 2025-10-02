import {
  functions,
} from "../../firebase-config";
import CandleModel from "../Models/CandleModel";
import { httpsCallable } from "firebase/functions";

class CandleService {
  public async addCandle(
    candle: CandleModel
  ): Promise<void> {
    candle.status = "Pending";
    candle.createdAt = new Date().toISOString();
    const addCandle = httpsCallable(
      functions,
      "addCandle"
    );
    try {
      await addCandle({ candle });
    } catch (error: any) {
      // Throw the error message from the backend
      throw new Error(
        error?.message || "Failed to add candle"
      );
    }
  }

  public async reportCandle(
    candleId: string
  ): Promise<void> {
    const reportCandle = httpsCallable(
      functions,
      "reportCandle"
    );
    await reportCandle({ candleId });
  }

  public async approveCandle(
    candleId: string,
    action: "approve" | "reject"
  ): Promise<any> {
    const approveCandle = httpsCallable(
      functions,
      "approveCandle"
    );

    // Get the token from localStorage
    const token = localStorage.getItem(
      "RememberToken"
    );
    if (!token) {
      throw new Error("User not authenticated");
    }

    const result = await approveCandle({
      candleId,
      action,
      token,
    });

    return result.data;
  }
}

const candleService = new CandleService();
export default candleService;
