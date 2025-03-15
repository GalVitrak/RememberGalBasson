import { useState } from "react";
import "./Login.css";

function Login(): React.ReactElement {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login attempt:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="Login">
      <div className="login-container">
        <h2>כניסת מנהל</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              שם משתמש
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="login-button"
          >
            התחבר
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
