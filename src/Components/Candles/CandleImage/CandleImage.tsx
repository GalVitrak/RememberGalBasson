import "./CandleImage.css";

interface CandleImageProps {
  className?: string;
}

export function CandleImage({
  className = "",
}: CandleImageProps): React.ReactElement {
  return (
    <div className={`candle-image ${className}`}>
      <div className="candle-container">
        <div className="flame">
          <div className="inner-flame"></div>
        </div>
        <div className="wick"></div>
        <div className="wax-body"></div>
      </div>
    </div>
  );
}
