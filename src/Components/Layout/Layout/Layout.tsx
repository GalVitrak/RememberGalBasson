import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Routing from "../Routing/Routing";
import "./Layout.css";
import { useEffect } from "react";
import { refreshAuthState } from "../../../Context/AuthState";
import { useLocation } from "react-router-dom";

function Layout(): React.ReactElement {
  const location = useLocation();

  // Refresh auth state on mount and location changes
  useEffect(() => {
    console.log("Layout: Refreshing auth state on location change or mount");
    refreshAuthState();
  }, [location]);

  return (
      <div className="Layout">
        <div className="Header">
          <Header />
        </div>
        <div className="Main">
          <Routing />
        </div>
        <div className="Footer">
          <Footer />
        </div>
      </div>
  );
}

export default Layout;
