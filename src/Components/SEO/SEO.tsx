import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
}

function SEO({
  title,
  description,
  keywords,
}: SEOProps): null {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    let metaDescription = document.querySelector(
      'meta[name="description"]'
    );
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        description
      );
    } else {
      metaDescription =
        document.createElement("meta");
      metaDescription.setAttribute(
        "name",
        "description"
      );
      metaDescription.setAttribute(
        "content",
        description
      );
      document.head.appendChild(metaDescription);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector(
      'meta[name="keywords"]'
    );
    if (metaKeywords) {
      metaKeywords.setAttribute(
        "content",
        keywords.join(", ")
      );
    } else {
      metaKeywords =
        document.createElement("meta");
      metaKeywords.setAttribute(
        "name",
        "keywords"
      );
      metaKeywords.setAttribute(
        "content",
        keywords.join(", ")
      );
      document.head.appendChild(metaKeywords);
    }
  }, [title, description, keywords]);

  // This component doesn't render anything
  return null;
}

export default SEO;
