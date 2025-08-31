import {
  useNavigate,
  Routes,
  Route,
  Link,
  Outlet,
} from "react-router-dom";
import adminService from "../../../Services/AdminService";
import "./Admin.css";
import { ApproveCandles } from "../ApproveCandles/ApproveCandles";
import { useEffect } from "react";
import { refreshAuthState } from "../../../Context/AuthState";

function Admin(): React.ReactElement {
  const navigate = useNavigate();

  // Ensure auth state is refreshed when Admin component mounts
  useEffect(() => {
    console.log(
      "Admin component mounted, refreshing auth state"
    );
    refreshAuthState();
  }, []);

  const handleLogout = async () => {
    try {
      console.log("Logout button clicked");
      await adminService.logout();
      navigate("/");
    } catch (error) {
      console.error(
        "Error during logout:",
        error
      );
    }
  };

  return (
    <div className="Admin">
      <div className="admin-header">
        <h2 className="admin-title">
          פאנל ניהול
        </h2>
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          התנתק
        </button>
      </div>
      <div className="admin-sections">
        <div className="admin-section">
          <h3>ניהול אירועים</h3>
          <p>הוספת אירועים חדשים ללוח השנה</p>
          <Link
            to="/admin/event-managment"
            className="admin-button"
          >
            הוסף אירוע
          </Link>
        </div>
        <div className="admin-section">
          <h3>ניהול מילים אסורות</h3>
          <p>הוספת מילים אסורות למסנן הנרות</p>
          <Link
            to="/admin/forbidden-words"
            className="admin-button"
          >
            נהל מילים אסורות
          </Link>
        </div>

        <div className="admin-section">
          <h3>ניהול נרות</h3>
          <p>אישור נרות זיכרון חדשים</p>
          <Link
            to="/admin/approve-candles"
            className="admin-button"
          >
            אשר נרות
          </Link>
        </div>

        <div className="admin-section">
          <h3>ניהול גלריה</h3>
          <p>העלאת תמונות חדשות לגלריה</p>
          <Link
            to="/admin/add-images"
            className="admin-button"
          >
            הוסף תמונות
          </Link>
        </div>
      </div>
    </div>
  );
}

// Dashboard component with navigation buttons

export default Admin;
