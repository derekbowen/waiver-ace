/**
 * Lightweight client-side recognition for returning signers.
 *
 * After a successful signature we drop a long-lived cookie containing the
 * signer's name and email so that the next time they land on a signing page
 * — at any business — we can prefill their details and show a friendly
 * "welcome back" banner. Sign-in to /my-waivers still required to actually
 * see/continue waivers, this is purely a UX hint.
 *
 * Cookie is intentionally NOT httpOnly (set from JS, read from JS), is
 * SameSite=Lax, Secure on https, and contains no sensitive data — just the
 * info the signer themselves typed in.
 */

const COOKIE_NAME = "rw_signer";
const MAX_AGE_DAYS = 365;

export interface SignerProfile {
  name: string;
  email: string;
  initials?: string;
  /** ISO timestamp of last signature */
  lastSignedAt: string;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function writeCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function getRecognizedSigner(): SignerProfile | null {
  const raw = readCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SignerProfile;
    if (!parsed?.email || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function rememberSigner(profile: Omit<SignerProfile, "lastSignedAt">) {
  const payload: SignerProfile = {
    name: profile.name.trim(),
    email: profile.email.trim().toLowerCase(),
    initials: profile.initials?.trim().toUpperCase(),
    lastSignedAt: new Date().toISOString(),
  };
  writeCookie(COOKIE_NAME, JSON.stringify(payload), MAX_AGE_DAYS);
}

export function forgetSigner() {
  deleteCookie(COOKIE_NAME);
}
