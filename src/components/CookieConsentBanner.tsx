import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  STORAGE_KEY,
  OPEN_SETTINGS_EVENT,
  isConsentRequiredRegion,
  loadGoogleAds,
  saveConsentChoice,
  updateConsent,
} from "@/lib/google-ads";
import { isNativeApp } from "@/lib/platform";

export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isNativeApp()) return;
    let stored: string | null = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch { /* ignore */ }
    if (stored) {
      void loadGoogleAds();
    } else {
      void isConsentRequiredRegion().then((required) => {
        if (required) setOpen(true);
        else void loadGoogleAds();
      });
    }
    const onOpen = () => setOpen(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "granted" || e.newValue === "denied")) {
        updateConsent(e.newValue);
        if (e.newValue === "granted") void loadGoogleAds();
      }
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!open) return null;

  const choose = (d: "granted" | "denied") => {
    saveConsentChoice(d);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground sm:flex-1">
          We'd like to use advertising cookies so Google Ads can measure signups from our ads. You can change this
          anytime under "Cookie settings" in the footer. See our{" "}
          <Link to="/privacy" className="underline">privacy policy</Link>.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="min-h-[44px] flex-1 sm:flex-none" onClick={() => choose("denied")}>
            Reject
          </Button>
          <Button className="min-h-[44px] flex-1 sm:flex-none" onClick={() => choose("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
