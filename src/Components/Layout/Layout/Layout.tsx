import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Routing from "../Routing/Routing";
import "./Layout.css";

function Layout(): React.ReactElement {
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
