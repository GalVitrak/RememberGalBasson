import { Link } from "react-router-dom";
import { CandleImage } from "../../Candles/CandleImage/CandleImage";
import "./NotFound.css";

export function NotFound(): React.ReactElement {
  return (
    <div className="NotFound">
      <div className="not-found-container">
        <div className="candle-container">
          <CandleImage />
        </div>
        <h1>404</h1>
        <h2>העמוד לא נמצא</h2>
        <p>
          אנחנו מצטערים, אך העמוד שחיפשת אינו קיים
        </p>
        <Link to="/" className="home-button">
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
