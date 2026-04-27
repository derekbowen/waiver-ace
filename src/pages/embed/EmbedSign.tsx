import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, MemoryRouter, Routes, Route } from "react-router-dom";
import { AlertTriangle, Ban, Clock, Link2Off, RefreshCw, WifiOff } from "lucide-react";
import SigningPage from "@/pages/SigningPage";
import { supabase } from "@/integrations/supabase/client";

type ErrorKind =
  | "missing_token"
  | "invalid_token"
  | "expired"
  | "canceled"
  | "rate_limited"
  | "email_mismatch"
  | "network"
  | "unknown";

interface ErrorInfo {
  kind: ErrorKind;
  title: string;
  message: string;
  icon: typeof AlertTriangle;
  canRetry: boolean;
}

const ERROR_MAP: Record<ErrorKind, Omit<ErrorInfo, "kind">> = {
  missing_token: {
    title: "No waiver specified",
    message: "This embed is missing a ?token= parameter pointing to a waiver envelope.",
    icon: Link2Off,
    canRetry: false,
  },
  invalid_token: {
    title: "Link not found",
    message: "This signing link is invalid or no longer exists. Please request a new link from the sender.",
    icon: Link2Off,
    canRetry: true,
  },
  expired: {
    title: "Waiver expired",
    message: "This waiver link has expired and can no longer be signed. Please ask the sender for a new link.",
    icon: Clock,
    canRetry: false,
  },
  canceled: {
    title: "Waiver canceled",
    message: "This waiver has been canceled by the sender and can no longer be signed.",
    icon: Ban,
    canRetry: false,
  },
  rate_limited: {
    title: "Too many attempts",
    message: "Too many requests from your network. Please wait a minute and try again.",
    icon: AlertTriangle,
    canRetry: true,
  },
  email_mismatch: {
    title: "Wrong account",
    message: "This waiver is addressed to a different email. Sign out and use the original signing link.",
    icon: AlertTriangle,
    canRetry: false,
  },
  network: {
    title: "Connection problem",
    message: "We couldn't reach our servers. Check your internet connection and try again.",
    icon: WifiOff,
    canRetry: true,
  },
  unknown: {
    title: "Something went wrong",
    message: "We couldn't load this waiver. Please try again in a moment.",
    icon: AlertTriangle,
    canRetry: true,
  },
};

export default function EmbedSign() {
  const [params] = useSearchParams();
  const token = params.get("token") || params.get("envelope") || "";
  const utmSource = params.get("utm_source") || "embed";
  const refDomain = params.get("ref_domain") || "";

  const containerRef = useRef<HTMLDivElement>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(
    token ? null : "missing_token"
  );
  const [checking, setChecking] = useState<boolean>(!!token);
  const [reloadKey, setReloadKey] = useState(0);

  // ---- Set noindex + title ----
  useEffect(() => {
    document.title = "Sign Waiver | RentalWaivers";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex";
  }, []);

  // ---- Pre-flight: classify the envelope state before mounting SigningPage ----
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setChecking(true);
    setErrorKind(null);

    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_envelope_by_token", {
          p_token: token,
          p_user_agent: navigator.userAgent,
        });

        if (cancelled) return;

        if (error) {
          const msg = (error.message || "").toLowerCase();
          if (msg.includes("fetch") || msg.includes("network")) {
            setErrorKind("network");
          } else {
            setErrorKind("unknown");
          }
          setChecking(false);
          return;
        }

        if (!data) {
          setErrorKind("invalid_token");
          setChecking(false);
          return;
        }

        const payload = data as Record<string, unknown>;

        if (payload.error) {
          const code = String(payload.error).toLowerCase();
          if (code.includes("rate")) setErrorKind("rate_limited");
          else if (code.includes("email")) setErrorKind("email_mismatch");
          else setErrorKind("invalid_token");
          setChecking(false);
          return;
        }

        const status = String(payload.status || "").toLowerCase();
        const expiresAt = payload.expires_at ? new Date(String(payload.expires_at)) : null;

        if (status === "canceled") {
          setErrorKind("canceled");
          setChecking(false);
          return;
        }

        if (status === "expired" || (expiresAt && expiresAt.getTime() < Date.now())) {
          setErrorKind("expired");
          setChecking(false);
          return;
        }

        // Healthy — let SigningPage render and handle signed/completed states.
        setErrorKind(null);
        setChecking(false);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        setErrorKind(
          msg.includes("fetch") || msg.includes("network") ? "network" : "unknown"
        );
        setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  // ---- Resize messaging to parent window ----
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;

    const post = (height: number) => {
      try {
        window.parent.postMessage({ type: "rentalwaivers:resize", height }, "*");
      } catch {
        /* ignore */
      }
    };

    const send = () => {
      const h =
        containerRef.current?.scrollHeight ??
        document.documentElement.scrollHeight;
      post(h);
    };

    send();

    const ro = new ResizeObserver(() => send());
    if (containerRef.current) ro.observe(containerRef.current);

    window.addEventListener("load", send);
    const interval = window.setInterval(send, 1500);

    try {
      window.parent.postMessage({ type: "rentalwaivers:ready", route: "sign" }, "*");
    } catch {
      /* ignore */
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("load", send);
      window.clearInterval(interval);
    };
  }, []);

  const handleRetry = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const PoweredBy = () => (
    <a
      href={`https://rentalwaivers.com/?utm_source=${encodeURIComponent(utmSource)}${
        refDomain ? `&ref_domain=${encodeURIComponent(refDomain)}` : ""
      }`}
      target="_top"
      rel="noopener"
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      Powered by <span className="font-semibold">RentalWaivers</span>
    </a>
  );

  // ---- Error screens ----
  if (errorKind) {
    const info = ERROR_MAP[errorKind];
    const Icon = info.icon;
    return (
      <div
        ref={containerRef}
        className="min-h-[300px] flex items-center justify-center bg-background text-foreground p-8"
      >
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">{info.title}</h1>
          <p className="text-sm text-muted-foreground">{info.message}</p>
          {info.canRetry && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reload signing view
            </button>
          )}
          <div className="pt-2">
            <PoweredBy />
          </div>
        </div>
      </div>
    );
  }

  // ---- Loading shimmer during pre-flight ----
  if (checking) {
    return (
      <div
        ref={containerRef}
        className="min-h-[300px] flex items-center justify-center bg-background text-foreground p-8"
      >
        <div className="text-center space-y-3">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading waiver…</p>
        </div>
      </div>
    );
  }

  // ---- Healthy: mount SigningPage in its own router ----
  return (
    <div ref={containerRef} className="bg-background text-foreground">
      <MemoryRouter
        key={reloadKey}
        initialEntries={[`/sign/${encodeURIComponent(token)}`]}
      >
        <Routes>
          <Route path="/sign/:token" element={<SigningPage />} />
        </Routes>
      </MemoryRouter>
      <div className="py-3 text-center border-t border-border">
        <PoweredBy />
      </div>
    </div>
  );
}
