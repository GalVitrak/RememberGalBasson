import Login from "../../Admin/Login/Login";
import About from "../../Home/About/About";
import "./Routing.css";
import { Routes, Route } from "react-router-dom";

function Routing(): React.ReactElement {
  return (
    <div className="Routing">
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/admin" element={<Login />} />
      </Routes>
    </div>
  );
}

export default Routing;
