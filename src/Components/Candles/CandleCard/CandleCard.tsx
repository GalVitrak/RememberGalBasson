import CandleModel from "../../../Models/CandleModel";
import "./CandleCard.css";

interface CandleCardProps {
  candle: CandleModel;
}

export function CandleCard({
  candle,
}: CandleCardProps): React.ReactElement {
  return (
    <div className="CandleCard">
      <div className="candle-container">
        <div className="candle-image">
          {/* Candle SVG or image can go here */}
          <div className="candle">
            <div className="flame">
              <div className="inner-flame"></div>
            </div>
            <div className="wax"></div>
          </div>
        </div>{" "}
        <div className="candleText">
          <div className="candleText__name">
            {candle.writerName}
          </div>
          <div className="candleText__text">
            {candle.text}
          </div>
        </div>
        <div className="candleDate">
          {candle.date}
        </div>
      </div>
    </div>
  );
}
