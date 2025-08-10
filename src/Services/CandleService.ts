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
}

const candleService = new CandleService();
export default candleService;
