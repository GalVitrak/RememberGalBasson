import React, { useEffect } from "react";

// Google Analytics 4 configuration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface SEOProps {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  url?: string;
  structuredData?: any;
  canonicalUrl?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleId?: string;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  structuredData,
  canonicalUrl,
  googleAnalyticsId,
  googleSearchConsoleId,
}: SEOProps): React.ReactElement | null {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    updateMetaTag(
      "name",
      "description",
      description
    );

    // Update meta keywords
    updateMetaTag(
      "name",
      "keywords",
      keywords.join(", ")
    );

    // Update Open Graph tags
    updateMetaTag("property", "og:title", title);
    updateMetaTag(
      "property",
      "og:description",
      description
    );
    updateMetaTag(
      "property",
      "og:type",
      "website"
    );
    updateMetaTag(
      "property",
      "og:locale",
      "he_IL"
    );
    if (image)
      updateMetaTag(
        "property",
        "og:image",
        image
      );
    if (url)
      updateMetaTag("property", "og:url", url);

    // Update Twitter Card tags
    updateMetaTag(
      "name",
      "twitter:card",
      "summary_large_image"
    );
    updateMetaTag("name", "twitter:title", title);
    updateMetaTag(
      "name",
      "twitter:description",
      description
    );
    if (image)
      updateMetaTag(
        "name",
        "twitter:image",
        image
      );

    // Update additional SEO tags
    updateMetaTag(
      "name",
      "robots",
      "index, follow"
    );
    updateMetaTag(
      "name",
      "language",
      "Hebrew, English"
    );
    updateMetaTag(
      "name",
      "author",
      "Remember Gal Bason Memorial Site"
    );
    updateMetaTag(
      "name",
      "viewport",
      "width=device-width, initial-scale=1"
    );

    // Update canonical URL if provided
    if (canonicalUrl) {
      updateCanonicalUrl(canonicalUrl);
    }

    // Add structured data if provided
    if (structuredData) {
      addStructuredData(structuredData);
    }

    // Set HTML language and direction
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";

    // Initialize Google Analytics 4
    if (googleAnalyticsId) {
      initializeGoogleAnalytics(
        googleAnalyticsId
      );
    }

    // Add Google Search Console verification
    if (googleSearchConsoleId) {
      addGoogleSearchConsoleVerification(
        googleSearchConsoleId
      );
    }
  }, [
    title,
    description,
    keywords,
    image,
    url,
    structuredData,
    canonicalUrl,
    googleAnalyticsId,
    googleSearchConsoleId,
  ]);

  // Helper function to update or create meta tags
  const updateMetaTag = (
    attribute: string,
    value: string,
    content: string
  ) => {
    let metaTag = document.querySelector(
      `meta[${attribute}="${value}"]`
    );
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute(attribute, value);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute("content", content);
  };

  // Helper function to update canonical URL
  const updateCanonicalUrl = (url: string) => {
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  };

  // Helper function to add structured data
  const addStructuredData = (data: any) => {
    // Remove existing structured data
    const existingScripts =
      document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
    existingScripts.forEach((script) =>
      script.remove()
    );

    // Add new structured data
    const script =
      document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  };

  // Initialize Google Analytics 4
  const initializeGoogleAnalytics = (
    gaId: string
  ) => {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Define gtag function
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }

    window.gtag = gtag;

    // Load Google Analytics script
    const script =
      document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Configure Google Analytics
    gtag("js", new Date());
    gtag("config", gaId, {
      page_title: title,
      page_location: url || window.location.href,
      custom_map: {
        custom_parameter_1: "memorial_site",
      },
    });
  };

  // Add Google Search Console verification
  const addGoogleSearchConsoleVerification = (
    verificationId: string
  ) => {
    updateMetaTag(
      "name",
      "google-site-verification",
      verificationId
    );
  };

  // This component doesn't render anything visible
  return null;
}
