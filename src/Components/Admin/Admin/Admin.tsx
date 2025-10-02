import {
  useNavigate,
  Link,
} from "react-router-dom";
import adminService from "../../../Services/AdminService";
import "./Admin.css";
import { useEffect } from "react";
import { refreshAuthState } from "../../../Context/AuthState";
import { TestEmail } from "../TestEmail/TestEmail";

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
            to="/admin/event-management"
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

        <div className="admin-section">
          <h3>ניהול מנויים</h3>
          <p>
            צפייה ברשימת המנויים וביטול מנויים
            ידני
          </p>
          <Link
            to="/admin/subscriber-management"
            className="admin-button"
          >
            נהל מנויים
          </Link>
        </div>

        <div className="admin-section">
          <h3>לוגי פעילות</h3>
          <p>צפייה בלוגי הפעילות של המערכת</p>
          <Link
            to="/admin/activity-logs"
            className="admin-button"
          >
            צפה בלוגים
          </Link>
        </div>

        <div className="admin-section">
          <h3>בדיקת מערכת המיילים</h3>
          <p>שליחת מייל בדיקה למערכת התפוצה</p>
          <TestEmail />
        </div>
      </div>
    </div>
  );
}

// Dashboard component with navigation buttons

export default Admin;
