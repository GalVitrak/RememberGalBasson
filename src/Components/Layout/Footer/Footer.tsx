import { CandleImage } from "../../Candles/CandleImage/CandleImage";
import "./Footer.css";

function Footer(): React.ReactElement {
  return (
    <footer className="Footer memorial-footer">
      <div className="footer-content">
        <p>יהי זכרו ברוך</p>
        <p className="credit-text">
          נבנה בהתנדבות ע"י גל ויטרק
        </p>
      </div>
    </footer>
  );
}

export default Footer;
