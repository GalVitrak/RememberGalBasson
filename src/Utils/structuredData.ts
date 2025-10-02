// Structured data for the memorial site
export const getMemorialSiteStructuredData =
  () => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "זוכרים את גל בסון ז״ל",
      alternateName:
        "Remember Gal Bason Memorial Site",
      url: "https://remembergalbason.com",
      description:
        "אתר הנצחה לזכר סמ״ר גל בסון ז״ל - מקום לזכרון, התייחדות והנצחה",
      inLanguage: "he",
      publisher: {
        "@type": "Organization",
        name: "Remember Gal Bason Memorial Site",
        url: "https://remembergalbason.com",
      },
      potentialAction: {
        "@type": "SearchAction",
        target:
          "https://remembergalbason.com/search?q={search_term_string}",
        "query-input":
          "required name=search_term_string",
      },
    };
  };

export const getPersonStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "גל בסון",
    alternateName: "Gal Bason",
    description:
      "סמ״ר גל בסון ז״ל - חייל צה״ל שנפל במלחמה",
    url: "https://remembergalbason.com/about",
    sameAs: ["https://remembergalbason.com"],
  };
};

export const getEventStructuredData = (
  event: any
) => {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date,
    url: `https://remembergalbason.com/events/${event.id}`,
    location: {
      "@type": "Place",
      name: event.location || "Israel",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IL",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Remember Gal Bason Memorial Site",
      url: "https://remembergalbason.com",
    },
  };
};

export const getBreadcrumbStructuredData = (
  breadcrumbs: Array<{
    name: string;
    url: string;
  }>
) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map(
      (crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })
    ),
  };
};
