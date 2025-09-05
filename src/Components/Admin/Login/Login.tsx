import { useState } from "react";
import "./Login.css";
import adminService from "../../../Services/AdminService";
import CredentialsModel from "../../../Models/CredentialsModel";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authStore } from "../../../Context/AuthState";

function Login(): React.ReactElement {
  const { register, handleSubmit } =
    useForm<CredentialsModel>();
  const [isSubmitted, setIsSubmitted] =
    useState(false);
  const [error, setError] = useState<
    string | null
  >(null);
  const navigate = useNavigate();

  async function send(
    credentials: CredentialsModel
  ) {
    setIsSubmitted(true);
    setError(null);

    try {
      await adminService.login(credentials);

      // Check if login was successful
      const isLoggedIn =
        authStore.getState().loggedIn;

      if (isLoggedIn) {
        // Navigate to admin page instead of reloading
        navigate("/admin");
      } else {
        setError(
          "התחברות נכשלה. אנא בדוק את פרטי ההתחברות שלך."
        );
      }
    } catch (error) {
      setError(
        "שגיאה בהתחברות. אנא נסה שוב מאוחר יותר."
      );
    } finally {
      setIsSubmitted(false);
    }
  }

  return (
    <div className="Login">
      {/* Admin page - no SEO needed, prevent indexing */}
      <meta
        name="robots"
        content="noindex, nofollow"
      />

      <div className="login-container">
        <h2>כניסת מנהל</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(send)}>
          <div className="form-group">
            <label htmlFor="username">
              שם משתמש
            </label>
            <input
              type="text"
              id="username"
              {...register("username")}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            disabled={isSubmitted}
            type="submit"
            className="login-button"
          >
            {isSubmitted ? "מתחבר..." : "התחבר"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
