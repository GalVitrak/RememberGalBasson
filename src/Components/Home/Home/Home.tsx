import SEO from "../../SEO/SEO";
import "./Home.css";

function Home(): JSX.Element {
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

  // Structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Remember Gal Bason - אתר הנצחה לזכר גל בסון",
    description:
      "אתר הנצחה לזכרו של סמ״ר גל בסון ז״ל, לוחם ביחידת יהל״ם של חיל ההנדסה הקרבית",
    url: "https://remembergalbasson.com",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://remembergalbasson.com/search?q={search_term_string}",
      "query-input":
        "required name=search_term_string",
    },
  };

  return (
    <div className="Home">
      <SEO
        title="Remember Gal Bason - אתר הנצחה לזכר סמ״ר גל בסון ז״ל | יחידת יהל״ם"
        description="אתר הנצחה לזכרו של סמ״ר גל בסון ז״ל, לוחם ביחידת יהל״ם של חיל ההנדסה הקרבית, אשר נפל במהלך מבצע צוק איתן. הדליק נר זיכרון, צפה בגלריה וקריאה על חייו."
        keywords={keywords}
        structuredData={structuredData}
        image="/src/assets/gal.jpg"
        url="https://remembergalbasson.com"
        canonicalUrl="https://remembergalbasson.com"
      />

      {/* Homepage content will go here */}
    </div>
  );
}

export default Home;
