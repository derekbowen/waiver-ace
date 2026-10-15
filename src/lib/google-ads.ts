// Google Ads conversion tracking with a regional consent banner.
// Visitors in consent regions (EEA, UK, Switzerland, Canada/Quebec) are not
// tracked until they accept; everyone else is tracked without a banner.
import { isNativeApp } from "@/lib/platform";

declare global {
  interface Window { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void }
}

export const GOOGLE_ADS_ID = "AW-18514940249";
const SIGNUP_SEND_TO = "AW-18514940249/sDARCNjI8p0dENmizvxE";

export const STORAGE_KEY = "cookie_consent";
export const CONSENT_RECORD_KEY = "cookie_consent_record";
export const CONSENT_NOTICE_VERSION = "2026-10-15-v1";
export const CONSENT_CHANGED_EVENT = "rw-consent-changed";
export const OPEN_SETTINGS_EVENT = "rw-open-cookie-settings";

const CONSENT_COUNTRIES = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH','CA'];
let consentRegion: Promise<boolean> | undefined;
let cachedCountry: string | null = null;

export function isConsentRequiredRegion(): Promise<boolean> {
  return consentRegion ??= lookupConsentRegion();
}

async function lookupConsentRegion(): Promise<boolean> {
  try {
    const res = await fetch("/cdn-cgi/trace", { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return true;
    const country = (await res.text()).match(/^loc=([A-Z0-9]{2})$/m)?.[1];
    cachedCountry = country ?? null;
    if (!country || country === "XX" || country === "T1") return true;
    return CONSENT_COUNTRIES.includes(country);
  } catch {
    return true;
  }
}

function readChoice(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export async function hasAdConsent(): Promise<boolean> {
  return readChoice() === "granted";
}

export async function canTrackAds(): Promise<boolean> {
  if (isNativeApp()) return false;
  const choice = readChoice();
  if (choice !== null) return choice === "granted";
  const required = await isConsentRequiredRegion();
  const latest = readChoice();
  return latest !== null ? latest === "granted" : !required;
}

export function updateConsent(decision: "granted" | "denied") {
  if (decision === "denied") window.gtag?.("set", "user_data", null);
  window.gtag?.("consent", "update", {
    ad_storage: decision,
    ad_user_data: decision,
    ad_personalization: decision,
  });
}

/** Persist the visitor's choice with evidence of what they were shown. */
export function saveConsentChoice(decision: "granted" | "denied") {
  try {
    const prev = localStorage.getItem(CONSENT_RECORD_KEY);
    const history = prev ? (JSON.parse(prev).history ?? []) : [];
    const record = {
      decision,
      decided_at: new Date().toISOString(),
      notice_version: CONSENT_NOTICE_VERSION,
      purposes: ["advertising measurement"],
      recipients: ["Google Ads"],
      country: cachedCountry,
      history: [...history, { decision, at: new Date().toISOString(), notice_version: CONSENT_NOTICE_VERSION }].slice(-20),
    };
    localStorage.setItem(CONSENT_RECORD_KEY, JSON.stringify(record));
    localStorage.setItem(STORAGE_KEY, decision);
  } catch { /* storage unavailable */ }
  updateConsent(decision);
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  if (decision === "granted") void loadGoogleAds();
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

export async function loadGoogleAds() {
  const allowed = await canTrackAds();
  if (!allowed) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  updateConsent("granted");
  if (document.querySelector("script[data-google-ads]")) return;
  window.gtag("set", "developer_id.dZjgwMW", true);
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  script.async = true;
  script.dataset.googleAds = "";
  document.head.appendChild(script);
}

/**
 * Report a new account once. Called after the profile loads; only counts
 * accounts created in the last 30 minutes so returning users never count.
 */
export async function reportSignupConversion(userId: string, userCreatedAt: string | undefined) {
  if (!userCreatedAt) return;
  if (Date.now() - new Date(userCreatedAt).getTime() > 30 * 60 * 1000) return;
  const flag = `rw_ads_signup_${userId}`;
  try { if (localStorage.getItem(flag)) return; } catch { return; }
  await loadGoogleAds();
  if (!(await canTrackAds())) return;
  try { localStorage.setItem(flag, "1"); } catch { /* ignore */ }
  window.gtag?.("event", "conversion", { send_to: SIGNUP_SEND_TO, value: 1.0, currency: "USD" });
}
