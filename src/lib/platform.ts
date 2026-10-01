import { Capacitor } from "@capacitor/core";

/** True when running inside the native iOS app shell (not mobile Safari). */
export function isNativeIOS(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
  } catch {
    return false;
  }
}

/** True when running inside any native app shell (iOS or Android). */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Platform string sent to the backend on signup: "ios", "android" or "web". */
export function getSignupPlatform(): "ios" | "android" | "web" {
  try {
    if (!Capacitor.isNativePlatform()) return "web";
    const p = Capacitor.getPlatform();
    return p === "ios" ? "ios" : p === "android" ? "android" : "web";
  } catch {
    return "web";
  }
}

/** Free credits granted at signup, by platform. */
export const WEB_SIGNUP_CREDITS = 100;
export const IOS_SIGNUP_CREDITS = 10;
