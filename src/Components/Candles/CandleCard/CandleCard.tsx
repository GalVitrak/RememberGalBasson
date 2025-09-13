import CandleModel from "../../../Models/CandleModel";
import "./CandleCard.css";
import { CandleImage } from "../CandleImage/CandleImage";
import candleService from "../../../Services/CandleService";
import { notification } from "antd";

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

  const reportCandle = () => {
    candleService.reportCandle(candle.id);
  };

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
        <div className="report-button">
          <button
            onClick={reportCandle}
            disabled={candle.reported}
            title={
              candle.reported
                ? "נר זה כבר דווח"
                : ""
            }
          >
            {candle.reported
              ? "נר זה כבר דווח"
              : "דווחו על נר"}
          </button>
        </div>
      </div>
    </div>
  );
}
