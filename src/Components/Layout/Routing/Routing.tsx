import Login from "../../Admin/Login/Login";
import About from "../../Home/About/About";
import { NotFound } from "../NotFound/NotFound";
import "./Routing.css";
import { Routes, Route } from "react-router-dom";
import Admin from "../../Admin/Admin/Admin";
import { authStore } from "../../../Context/AuthState";
import { useEffect, useState } from "react";
import { CandlePage } from "../../Candles/CandlePage/CandlePage";
import { ApproveCandles } from "../../Admin/ApproveCandles/ApproveCandles";
import { ForbiddenWords } from "../../Admin/ForbiddenWords/ForbiddenWords";

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
        <Route
          path="/candles"
          element={<CandlePage />}
        />
        {/* 404 route - must be last */}
        <Route path="*" element={<NotFound />} />

        <Route path="/" element={<Admin />} />
        <Route
          path="/admin/approve-candles"
          element={<ApproveCandles />}
        />
        <Route
          path="/admin/add-event"
          element={
            <div>
              Add Event Component (Coming Soon)
            </div>
          }
        />
        <Route
          path="/admin/add-images"
          element={
            <div>
              Add Images Component (Coming Soon)
            </div>
          }
        />
        <Route
          path="/admin/forbidden-words"
          element={<ForbiddenWords />}
        />
      </Routes>
    </div>
  );
}

export default Routing;
