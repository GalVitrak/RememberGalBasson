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
    refreshAuthState();
  }, []);

  const handleLogout = async () => {
    try {
      await adminService.logout();
      navigate("/");
    } catch (error) {
      // Handle logout error silently
    }
  };

  return (
    <div className="Admin">
      {/* Admin page - no SEO needed, prevent indexing */}
      <meta
        name="robots"
        content="noindex, nofollow"
      />

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
            נהל אירועים
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
          <h3>ניהול מילים אסורות</h3>
          <p>הוספת מילים אסורות למסנן הנרות</p>
          <Link
            to="/admin/forbidden-words"
            className="admin-button"
          >
            נהל מילים אסורות
          </Link>
        </div>
      </div>
    </div>
  );
}

// Dashboard component with navigation buttons

export default Admin;
