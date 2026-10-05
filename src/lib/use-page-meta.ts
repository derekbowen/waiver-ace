import { useEffect } from "react";

const BASE_URL = "https://www.rentalwaivers.com";

/**
 * Sets per-route head tags (title, description, canonical, og:*, twitter:*)
 * for pages that don't use SeoPageLayout. Tags are updated in place so the
 * static index.html values remain the fallback for non-JS crawlers.
 */
export function usePageMeta(metaTitle: string, metaDescription: string, canonicalPath: string) {
  useEffect(() => {
    document.title = metaTitle;

    const setMeta = (key: string, content: string) => {
      let el =
        document.querySelector(`meta[property="${key}"]`) ||
        document.querySelector(`meta[name="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (key.startsWith("og:")) el.setAttribute("property", key);
        else el.setAttribute("name", key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", metaDescription);
    setMeta("og:title", metaTitle);
    setMeta("og:description", metaDescription);
    setMeta("og:url", `${BASE_URL}${canonicalPath}`);
    setMeta("twitter:title", metaTitle);
    setMeta("twitter:description", metaDescription);
    setMeta("twitter:url", `${BASE_URL}${canonicalPath}`);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${BASE_URL}${canonicalPath}`);
  }, [metaTitle, metaDescription, canonicalPath]);
}
