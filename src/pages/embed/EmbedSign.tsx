import { useEffect, useRef } from "react";
import { useSearchParams, MemoryRouter, Routes, Route } from "react-router-dom";
import SigningPage from "@/pages/SigningPage";

/**
 * Public embeddable signing page.
 * Mounted at /embed/sign — designed for iframe embedding (WordPress plugin, etc).
 *
 * Accepts the envelope token via:
 *   ?token=abc123       (preferred for query-string embeds)
 *   ?envelope=abc123    (alias)
 *
 * Posts {type:'rentalwaivers:resize', height} to the parent window whenever
 * the rendered height changes so embedders can auto-resize the iframe.
 *
 * Reuses <SigningPage /> as-is by mounting it inside a MemoryRouter so the
 * existing useParams("token") works without affecting the host app's router.
 */
export default function EmbedSign() {
  const [params] = useSearchParams();
  const token = params.get("token") || params.get("envelope") || "";
  const utmSource = params.get("utm_source") || "embed";
  const refDomain = params.get("ref_domain") || "";

  const containerRef = useRef<HTMLDivElement>(null);

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

  // ---- Resize messaging to parent window ----
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;

    const post = (height: number) => {
      try {
        window.parent.postMessage(
          { type: "rentalwaivers:resize", height },
          "*"
        );
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

    // Catch images/fonts loading after first paint
    window.addEventListener("load", send);
    const interval = window.setInterval(send, 1500);

    try {
      window.parent.postMessage(
        { type: "rentalwaivers:ready", route: "sign" },
        "*"
      );
    } catch {
      /* ignore */
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("load", send);
      window.clearInterval(interval);
    };
  }, []);

  if (!token) {
    return (
      <div
        ref={containerRef}
        className="min-h-[300px] flex items-center justify-center bg-background text-foreground p-8"
      >
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold">No waiver specified</h1>
          <p className="text-sm text-muted-foreground">
            This embed is missing a <code>?token=</code> parameter pointing to a
            waiver envelope.
          </p>
          <a
            href={`https://rentalwaivers.com/?utm_source=${encodeURIComponent(
              utmSource
            )}${refDomain ? `&ref_domain=${encodeURIComponent(refDomain)}` : ""}`}
            target="_top"
            rel="noopener"
            className="inline-block text-sm text-primary hover:underline"
          >
            Powered by RentalWaivers
          </a>
        </div>
      </div>
    );
  }

  // Mount SigningPage inside its own MemoryRouter so its useParams("token")
  // resolves correctly without touching the host app's URL.
  return (
    <div ref={containerRef} className="bg-background text-foreground">
      <MemoryRouter initialEntries={[`/sign/${encodeURIComponent(token)}`]}>
        <Routes>
          <Route path="/sign/:token" element={<SigningPage />} />
        </Routes>
      </MemoryRouter>
      <div className="py-3 text-center border-t border-border">
        <a
          href={`https://rentalwaivers.com/?utm_source=${encodeURIComponent(
            utmSource
          )}${refDomain ? `&ref_domain=${encodeURIComponent(refDomain)}` : ""}`}
          target="_top"
          rel="noopener"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Powered by <span className="font-semibold">RentalWaivers</span>
        </a>
      </div>
    </div>
  );
}
