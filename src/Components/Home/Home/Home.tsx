import SEO from "../../SEO/SEO";
import {
  getMemorialSiteStructuredData,
  getPersonStructuredData,
} from "../../../Utils/structuredData";
import "./Home.css";

function Home(): React.ReactElement {
  // SEO keywords for homepage
  const keywords = [
    // Primary Hebrew Keywords
    "גל בסון",
    "גל בסון ז״ל",
    "סמ״ר גל בסון",
    "גל בסון חולון",
    "גל בסון זיכרון",

    // Military Unit Keywords
    "יחידת יהל״ם",
    "יחידת יהלום",
    "חיל הנדסה קרבית",
    "נופלי יחידת יהלום",
    "חללי יחידת יהלום",
    "יחידת יהלום חללים",

    // Operation Keywords
    "מבצע צוק איתן",
    "צוק איתן",
    "חללי צוק איתן",
    "נופלי צוק איתן",

    // Memorial Keywords
    "אתר הנצחה",
    "זיכרון לחללי צה״ל",
    "נופלי צה״ל",
    "חללי צה״ל",
    "הנצחה אישית",

    // Location Keywords
    "חולון",
    "חללי חולון",
    "נופלי חולון",
    "בית עלמין צבאי חולון",
    "חולון צה״ל",

    // English Variations
    "Gal Bason",
    "Yahalom Unit",
    "Combat Engineering Corps",
    "Memorial Site",
    "Israeli soldier memorial",
    "Holon fallen soldier",
  ];

  // Enhanced structured data for homepage
  const memorialSiteData =
    getMemorialSiteStructuredData();
  const personData = getPersonStructuredData();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [memorialSiteData, personData],
  };

  return (
    <div className="Home">
      <SEO
        title="Remember Gal Bason - אתר הנצחה לזכר סמ״ר גל בסון ז״ל | יחידת יהל״ם"
        description="אתר הנצחה לזכרו של סמ״ר גל בסון ז״ל, לוחם ביחידת יהל״ם של חיל ההנדסה הקרבית, אשר נפל במהלך מבצע צוק איתן. הדליק נר זיכרון, צפה בגלריה וקריאה על חייו."
        keywords={keywords}
        structuredData={structuredData}
        image="https://remembergalbason.com/src/assets/gal.jpg"
        url="https://remembergalbason.com"
        canonicalUrl="https://remembergalbason.com"
        googleAnalyticsId="G-XXXXXXXXXX" // Replace with your GA4 ID
        googleSearchConsoleId="isvTiXOGp9bA_-_L3R38tq7ITcvCtYOCJwGSYS2MBEg"
      />

      {/* Homepage content will go here */}
    </div>
  );
}

export default Home;
