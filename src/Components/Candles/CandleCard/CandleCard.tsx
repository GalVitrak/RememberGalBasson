import CandleModel from "../../../Models/CandleModel";
import "./CandleCard.css";
import { CandleImage } from "../CandleImage/CandleImage";

interface CandleCardProps {
  candle: CandleModel;
}

export function CandleCard({
  candle,
}: CandleCardProps): React.ReactElement {
  const date = new Date(candle.createdAt);
  const formattedDate = date.toLocaleDateString(
    "he-IL",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  return (
    <div className="CandleCard">
      <div className="candle-container">
        <div className="candle-header">
          <div className="candle-header__name">
            {candle.writerName}
          </div>
          <div className="candle-header__date">
            {formattedDate}
          </div>
        </div>
        <div className="candle-body">
          <div className="candle-body__text">
            {candle.text}
          </div>
        </div>
      </div>
      <div className="candleImage">
        <CandleImage />
      </div>
    </div>
  );
}
