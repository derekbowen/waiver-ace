/**
 * Native-app (Capacitor) Google / Apple sign-in.
 *
 * Why this exists: the generated Lovable auth wrapper sends the browser to the
 * RELATIVE path `/~oauth/initiate`. That broker only exists on the live website,
 * so inside the bundled app (origin = the phone's own localhost) it 404s. Google
 * also refuses OAuth inside an embedded WebView.
 *
 * Flow used here, native app only (the website never runs this code):
 *   1. Open the live site's broker in the system browser
 *      (SFSafariViewController on iOS, Chrome Custom Tab on Android).
 *   2. After Google/Apple, the broker returns to `com.rentalwaivers.app://auth-callback`.
 *   3. The OS reopens the app; we read the tokens and call supabase.auth.setSession,
 *      exactly what the generated wrapper does on the web.
 *
 * Only public values are used. No service-role key. No backend/auth settings are
 * changed by this file.
 */
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp } from "@/lib/platform";

/** The live website (hosts the /~oauth broker and the email-link pages). */
export const WEB_ORIGIN = "https://www.rentalwaivers.com";

/** Return link registered for the app. Must be allowed in the live auth redirect settings. */
export const NATIVE_AUTH_CALLBACK = "com.rentalwaivers.app://auth-callback";

const PENDING_KEY = "rw_native_oauth_pending";
const PENDING_MAX_AGE_MS = 15 * 60 * 1000;

type Provider = "google" | "apple";
type Pending = { state: string; next: string | null; ts: number };

/**
 * Origin to use when building links that must work OUTSIDE the app (emails).
 * On the web this is exactly window.location.origin, so web behaviour is unchanged.
 */
export function appOrigin(): string {
  return isNativeApp() ? WEB_ORIGIN : window.location.origin;
}

function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function savePending(p: Pending) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable: sign-in will fail the state check and ask to retry */
  }
}

function takePending(): Pending | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    localStorage.removeItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Pending;
    if (!p?.state || Date.now() - p.ts > PENDING_MAX_AGE_MS) return null;
    return p;
  } catch {
    return null;
  }
}

/** Start Google/Apple sign-in in the system browser. Resolves once the browser is open. */
export async function startNativeOAuth(
  provider: Provider,
  nextPath: string | null,
): Promise<{ error: Error | null }> {
  try {
    const state = randomState();
    savePending({ state, next: nextPath, ts: Date.now() });
    const params = new URLSearchParams({
      provider,
      redirect_uri: NATIVE_AUTH_CALLBACK,
      state,
    });
    await Browser.open({ url: `${WEB_ORIGIN}/~oauth/initiate?${params.toString()}` });
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}

/** Collect params from both ?query and #fragment (the broker may use either). */
function readCallbackParams(url: string): URLSearchParams {
  const out = new URLSearchParams();
  const hashIdx = url.indexOf("#");
  const beforeHash = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
  const hash = hashIdx >= 0 ? url.slice(hashIdx + 1) : "";
  const qIdx = beforeHash.indexOf("?");
  const query = qIdx >= 0 ? beforeHash.slice(qIdx + 1) : "";
  for (const part of [query, hash]) {
    new URLSearchParams(part).forEach((v, k) => {
      if (!out.has(k)) out.set(k, v);
    });
  }
  return out;
}

/** Returns true if the URL was our auth callback (handled, successfully or not). */
export async function handleNativeAuthUrl(url: string | undefined | null): Promise<boolean> {
  if (!url || !url.startsWith(NATIVE_AUTH_CALLBACK)) return false;

  try {
    await Browser.close();
  } catch {
    /* Android Custom Tabs cannot be closed programmatically; the app is already in front */
  }

  const params = readCallbackParams(url);
  const pending = takePending();

  if (!pending || params.get("state") !== pending.state) {
    toast.error("Sign-in could not be verified. Please try again.");
    return true;
  }

  const err = params.get("error");
  if (err) {
    toast.error(params.get("error_description") || "Sign in failed");
    return true;
  }

  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) {
    toast.error("Sign in failed. No session was returned.");
    return true;
  }

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) {
    toast.error(error.message);
    return true;
  }

  // Session is stored; AuthContext picks it up. Go to the dashboard (or the page asked for).
  window.location.replace(pending.next ?? "/dashboard");
  return true;
}

let registered = false;

/** Call once at app start. No-op on the web. */
export function registerNativeAuthListener(): void {
  if (registered || !isNativeApp()) return;
  registered = true;

  CapApp.addListener("appUrlOpen", (event) => {
    void handleNativeAuthUrl(event.url);
  });

  // App was launched cold by the return link (e.g. the OS had closed it).
  CapApp.getLaunchUrl()
    .then((launch) => handleNativeAuthUrl(launch?.url))
    .catch(() => undefined);
}
