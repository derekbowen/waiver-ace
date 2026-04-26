import { useEffect } from "react";

/**
 * Sets <meta name="robots" content="noindex,nofollow"> on mount and restores
 * "index,follow" on unmount. Use for authenticated, utility, or token-bound
 * pages that must never appear in search results (dashboard, login, signing
 * pages, customer portal, unsubscribe, etc.).
 *
 * Optionally sets a self-referential canonical so any indexed copies dedupe.
 */
export function useNoindex(canonicalPath?: string) {
  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previous = robots?.getAttribute("content") ?? null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex,nofollow");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const prevHref = canonical?.getAttribute("href") ?? null;
    if (canonicalPath) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", `https://www.rentalwaivers.com${canonicalPath}`);
    }

    // Remove hreflang alternates on private pages
    const removed: HTMLLinkElement[] = [];
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => {
      removed.push(el as HTMLLinkElement);
      el.remove();
    });

    return () => {
      if (robots) robots.setAttribute("content", previous ?? "index,follow,max-image-preview:large");
      if (canonical && prevHref !== null) canonical.setAttribute("href", prevHref);
      removed.forEach((el) => document.head.appendChild(el));
    };
  }, [canonicalPath]);
}
