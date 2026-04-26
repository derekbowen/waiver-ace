import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  // Disable browser scroll restoration so it doesn't fight with us
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Run after the new route's DOM has painted, so it overrides any
    // focus-induced scroll (e.g. Radix focus management on links/buttons).
    const scroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scroll();
    const raf = requestAnimationFrame(scroll);
    const t = setTimeout(scroll, 0);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
