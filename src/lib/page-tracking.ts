import { supabase } from "@/integrations/supabase/client";

// Public marketing/SEO path prefixes worth tracking for conversion attribution.
const TRACKED_PREFIXES = [
  "/p/",
  "/industries",
  "/waiver-templates",
  "/waiver-laws",
  "/waivers/",
  "/blog",
  "/compare",
  "/alternatives/",
  "/cheapest-waiver-software",
  "/rental-waiver-software",
  "/waiver-software",
  "/pricing-info",
  "/contract-scanner-info",
];

const LANDING_KEY = "rw_landing_path";

export function isTrackablePath(path: string): boolean {
  if (path === "/") return true;
  return TRACKED_PREFIXES.some((p) => path === p || path.startsWith(p));
}

/** Remember the first marketing page this visitor ever landed on. */
export function captureLandingPath(path: string) {
  try {
    if (isTrackablePath(path) && !localStorage.getItem(LANDING_KEY)) {
      localStorage.setItem(LANDING_KEY, path);
    }
  } catch {
    /* storage unavailable */
  }
}

export function getLandingPath(): string | null {
  try {
    return localStorage.getItem(LANDING_KEY);
  } catch {
    return null;
  }
}

/** Record a page view (fire-and-forget; never blocks rendering). */
export function trackPageView(path: string) {
  if (!isTrackablePath(path)) return;
  captureLandingPath(path);
  void supabase
    .from("page_views")
    .insert({
      path: path.slice(0, 500),
      referrer: document.referrer ? document.referrer.slice(0, 500) : null,
    })
    .then(() => undefined, () => undefined);
}

/**
 * If this profile has no signup source yet and we know the visitor's first
 * landing page, attribute the signup to it. Runs once per browser.
 */
export async function attributeSignupSource(userId: string, currentSource: string | null | undefined) {
  if (currentSource) return;
  const landing = getLandingPath();
  if (!landing) return;
  try {
    await supabase
      .from("profiles")
      .update({ signup_source_path: landing })
      .eq("user_id", userId)
      .is("signup_source_path", null);
    localStorage.removeItem(LANDING_KEY);
  } catch {
    /* non-fatal */
  }
}
