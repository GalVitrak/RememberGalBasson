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
import { EventManagement } from "../../Admin/EventManagement/EventManagement";
import { ManageEventTypes } from "../../Admin/ManageEventTypes/ManageEventTypes";
import { Events } from "../../Events/Events/Events";
import { Gallery } from "../../Events/Gallery/Gallery";
import { Unsubscribe } from "../../Events/Unsubscribe/Unsubscribe";

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
        <Route
          path="/events"
          element={<Events />}
        />
        <Route
          path="/events/:eventId"
          element={<Gallery />}
        />
        <Route
          path="/gallery"
          element={<Gallery />}
        />
        <Route
          path="/admin/approve-candles"
          element={<ApproveCandles />}
        />
        <Route
          path="/admin/event-managment"
          element={<EventManagement />}
        />
        <Route
          path="/admin/manage-event-types"
          element={<ManageEventTypes />}
        />
        <Route
          path="/admin/forbidden-words"
          element={<ForbiddenWords />}
        />
        <Route
          path="/unsubscribe"
          element={<Unsubscribe />}
        />
        {/* 404 route - must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default Routing;
