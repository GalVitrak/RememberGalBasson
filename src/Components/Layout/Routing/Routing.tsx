import Login from "../../Admin/Login/Login";
import About from "../../Home/About/About";
import { NotFound } from "../NotFound/NotFound";
import "./Routing.css";
import { Routes, Route } from "react-router-dom";
import Admin from "../../Admin/Admin/Admin";
import { authStore } from "../../../Context/AuthState";
import { useEffect, useState } from "react";

function Routing(): React.ReactElement {
  const [isLoggedIn, setIsLoggedIn] = useState(
    authStore.getState().loggedIn
  );

  useEffect(() => {
    const unsubscribe = authStore.subscribe(
      () => {
        setIsLoggedIn(
          authStore.getState().loggedIn
        );
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="Routing">
      <Routes>
        <Route path="/" element={<About />} />
        {isLoggedIn ? (
          <Route
            path="/admin/*"
            element={<Admin />}
          />
        ) : (
          <Route
            path="/admin/*"
            element={<Login />}
          />
        )}
        {/* 404 route - must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default Routing;
