import {
  Link,
  useLocation,
} from "react-router-dom";
import "./Header.css";
import galImage from "../../../assets/gal.jpg";
import { useState } from "react";

function Header(): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="Header">
      <div className="header-text">
        <div className="header-content">
          <div className="image-container">
            <img
              src={galImage}
              alt="גל בסון ז״ל"
              className="memorial-image"
            />
          </div>
          <div className="text-content">
            <h1>לזכרו של סמ"ר גל בסון ז"ל</h1>
            <h2>
              לוחם ביחידת יהל"ם, חיל הנדסה קרבית
            </h2>
            <p className="honor-text">
              "רק מי שנשם אבק דרכים,
              <br className="mobile-break" /> יזכה
              לשאוף אוויר פסגות"
            </p>
          </div>
        </div>
      </div>
      <button
        className="hamburger-menu"
        onClick={toggleMenu}
        aria-label="תפריט"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div
        className={`nav-buttons ${
          isMenuOpen ? "show" : ""
        }`}
      >
        <Link
          to="/"
          className={`nav-button ${
            location.pathname === "/"
              ? "active"
              : ""
          }`}
        >
          דף הבית
        </Link>
        <Link
          to="/events"
          className={`nav-button ${
            location.pathname === "/events"
              ? "active"
              : ""
          }`}
        >
          אירועי הנצחה
        </Link>
        <Link
          to="/candles"
          className={`nav-button ${
            location.pathname === "/candles"
              ? "active"
              : ""
          }`}
        >
          הדלק נר זיכרון 🕯️
        </Link>
      </div>
    </div>
  );
}

export default Header;
