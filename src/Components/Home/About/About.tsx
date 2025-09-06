import SEO from "../../SEO/SEO";
import "./About.css";

function About(): React.ReactElement {
  // Comprehensive SEO keywords for maximum exposure
  const keywords = [
    // Primary Hebrew Keywords - גל בסון
    "גל בסון",
    "גל בסון ז״ל",
    "סמ״ר גל בסון",
    "גל בסון חולון",
    "גל בסון זיכרון",
    "גל בסון אתר הנצחה",

    // Military Unit Keywords - יחידת יהל״ם
    "יחידת יהל״ם",
    "יחידת יהלום",
    "יחידת יהל״ם צה״ל",
    "יחידת יהל״ם הנדסה קרבית",
    "חיל הנדסה קרבית",
    "הנדסה קרבית",
    "חיל ההנדסה",
    "נופלי יחידת יהלום",
    "חללי יחידת יהלום",
    "יחידת יהלום חללים",
    "יחידת יהלום נופלים",
    "יחידת יהלום זיכרון",
    "יחידת יהלום הנצחה",

    // Operation Keywords - מבצע צוק איתן
    "מבצע צוק איתן",
    "צוק איתן",
    "חללי צוק איתן",
    "נופלי צוק איתן",
    "מבצע צוק איתן 2014",
    "צוק איתן חללים",
    "צוק איתן נופלים",
    "צוק איתן זיכרון",

    // Memorial Keywords - אתר הנצחה
    "אתר הנצחה",
    "זיכרון לחללי צה״ל",
    "נופלי צה״ל",
    "חללי צה״ל",
    "הנצחת חללי צה״ל",
    "אתר זיכרון",
    "הנצחה אישית",
    "זיכרון לחייל",
    "זיכרון לחלל",
    "הנצחת נופלים",

    // Location Keywords - חולון
    "חולון",
    "חללי חולון",
    "נופלי חולון",
    "גל בסון חולון",
    "בית עלמין צבאי חולון",
    "חולון צה״ל",
    "חללי מרכז",
    "נופלי מרכז",
    "גוש דן חללים",
    "גוש דן נופלים",

    // Team Keywords - צוות מוגלי
    "צוות מוגלי",
    "מוגלי",
    "יחידת מוגלי",
    "מוגלי יהלום",
    "מוגלי הנדסה",

    // Family & Personal Keywords
    "משפחת בסון",
    "הורים של גל בסון",
    "אח של גל בסון",
    "אחות של גל בסון",
    "חברים של גל בסון",
    "גל בסון משפחה",

    // School & Education Keywords
    "בית ספר בן צבי חולון",
    "חטיבת זלמן ארן",
    "תיכון עירוני קריית שרת",
    "כדורסל חולון",
    "תלמיד חולון",
    "גל בסון בית ספר",
    "גל בסון חינוך",

    // Military Service Keywords
    "גיוס 2012",
    "הכשרה יהל״ם",
    "לוחם הנדסה",
    "צוות מוגלי",
    "פעילות מבצעית",
    "גל בסון צה״ל",
    "גל בסון שירות",

    // Date & Anniversary Keywords
    "25.7.2014",
    "כ״ח בתמוז תשע״ד",
    "חללי יולי 2014",
    "נופלי 2014",
    "יום השנה לגל בסון",
    "גל בסון תאריך",
    "גל בסון יום השנה",

    // Memorial & Commemoration Keywords
    "הנצחה אישית",
    "נר זיכרון וירטואלי",
    "גלריה זיכרון",
    "אירועי זיכרון",
    "זיכרון לחייל",
    "הדלק נר זיכרון",
    "נר זיכרון גל בסון",
    "זיכרון וירטואלי",

    // English Variations for International Exposure
    "Gal Bason",
    "Gal Basson",
    "Yahalom Unit",
    "Combat Engineering Corps",
    "Operation Protective Edge",
    "Israel Defense Forces",
    "Holon",
    "Memorial Site",
    "Fallen Soldier",
    "Israeli soldier memorial",
    "Holon fallen soldier",
    "Yahalom unit memorial",
    "Gaza operation fallen",
    "Israeli engineering corps",
    "Gal Bason memorial",
    "Gal Bason tribute",
  ];

  // Structured Data for Rich Snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "סמ״ר גל בסון",
    alternateName: ["Gal Bason", "Gal Basson"],
    birthDate: "1993-12-22",
    deathDate: "2014-07-25",
    description:
      "לוחם ביחידת יהל״ם של חיל ההנדסה הקרבית, נפל במהלך מבצע צוק איתן",
    nationality: "Israeli",
    birthPlace: {
      "@type": "Place",
      name: "חולון, ישראל",
    },
    alumniOf: {
      "@type": "Organization",
      name: "יחידת יהל״ם, חיל ההנדסה הקרבית",
    },
    hasOccupation: {
      "@type": "Occupation",
      name: "לוחם הנדסה קרבית",
    },
    url: "https://remembergalbasson.com",
    image:
      "https://remembergalbasson.com/src/assets/gal.jpg",
    sameAs: [
      "https://remembergalbasson.com/about",
    ],
  };

  return (
    <div className="About">
      <SEO
        title="סמ״ר גל בסון ז״ל | לוחם יחידת יהל״ם שנפל במבצע צוק איתן | אתר הנצחה"
        description="אתר הנצחה לזכרו של סמ״ר גל בסון ז״ל, לוחם ביחידת יהל״ם של חיל ההנדסה הקרבית, אשר נפל במהלך מבצע צוק איתן. גל היה בן חולון, לוחם מסור וחבר אמיתי."
        keywords={keywords}
        structuredData={structuredData}
        image="/src/assets/gal.jpg"
        url="https://remembergalbasson.com/about"
        canonicalUrl="https://remembergalbasson.com/about"
      />

      <section className="hero-section">
        <h1>לזכרו של סמ״ר גל בסון ז״ל</h1>
        <h2>
          לוחם ביחידת יהל״ם, חיל הנדסה קרבית
        </h2>
        <p className="dates">
          ח׳ בטבת ה׳תשנ״ד - כ״ח בתמוז תשע״ד
        </p>
        <p className="dates">
          22.12.1993 - 25.7.2014
        </p>
      </section>

      <section className="memorial-section">
        <h3>על גל</h3>
        <p>
          סמ"ר גל בסון ז״ל, לוחם ביחידת יהל״ם של
          חיל ההנדסה הקרבית, נפל במהלך מבצע צוק
          איתן בעת פעילות מבצעית ברצועת עזה. גל
          היה חלק מצוות מוגלי, והיה ידוע בקרב
          חבריו כלוחם מסור, חבר אמיתי ואדם בעל לב
          רחב.
        </p>
        <p>
          גל נולד וגדל בחולון, בן להורים אוהבים,
          ילד 'סנדוויץ', בן אמצעי לאחיו הגדול
          וללינוי אחותו הקטנה. למד והתחנך בעיר
          מגוריו חולון, בבית הספר היסודי "בן צבי"
          ובחטיבת הביניים "זלמן ארן". את לימודיו
          התיכוניים סיים במגמת כדורסל בתיכון
          העירוני קמפוס "קריית שרת".
        </p>
        <p>
          מילדותו בלט גל בכישוריו החברתיים, באהבתו
          העזה לספורט ובנחישותו להצליח בכל אתגר
          שניצב בפניו. חבריו מספרים על נער שתמיד
          חייך, תמיד עזר לאחרים, ותמיד היה מוכן
          להושיט יד לכל מי שנזקק.
        </p>
      </section>

      <section className="memorial-section">
        <h3>שירותו הצבאי</h3>
        <p>
          גל התגייס לצה"ל בנובמבר 2012 ליחידת
          יהל"ם (יחידת הנדסה למשימות מיוחדות) של
          חיל ההנדסה הקרבית. הוא עבר הכשרה מפרכת
          והצטיין כלוחם. במהלך שירותו הצבאי השתתף
          במספר פעילויות מבצעיות והיה חלק מצוות
          מוגלי.
        </p>
        <p>
          ביום שישי, כ״ח בתמוז תשע״ד (25.7.2014),
          במהלך מבצע "צוק איתן", נפל גל בקרב
          ברצועת עזה. הוא היה בן 20 במותו. גל הובא
          למנוחות בבית העלמין הצבאי בחולון, והותיר
          אחריו הורים, אח ואחות.
        </p>
      </section>

      <section className="memorial-section">
        <h3>מורשת</h3>
        <p>
          אתר זה הוקם כדי להנציח את זכרו של גל, את
          פועלו ואת ערכיו. כאן תוכלו למצוא תמונות,
          סיפורים, ולהדליק נר זיכרון וירטואלי
          לזכרו. משפחתו וחבריו של גל ממשיכים לשמר
          את זכרו דרך פעילויות הנצחה שונות ודרך
          סיפור חייו הקצרים אך המשמעותיים.
        </p>
        <blockquote className="memorial-quote">
          "רק מי שנשם אבק דרכים,
          <br className="mobile-break" /> יזכה
          לשאוף אוויר פסגות"
        </blockquote>
      </section>
    </div>
  );
}

export default About;
