import {
  db,
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
    await addCandle({ candle });
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
}

const candleService = new CandleService();
export default candleService;
