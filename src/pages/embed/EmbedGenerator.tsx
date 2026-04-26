import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { allIndustryPages } from "@/lib/industry-pages";
import { stateWaiverLawPages } from "@/lib/state-waiver-laws";

/**
 * Public embeddable waiver generator.
 * Mounted at /embed/generator — designed to be loaded inside a 3rd-party iframe
 * (WordPress plugin, raw <iframe>, etc).
 *
 * Posts {type:'rentalwaivers:resize', height} to the parent window whenever
 * the rendered height changes so embedders can auto-resize the iframe.
 */
export default function EmbedGenerator() {
  const [params] = useSearchParams();
  const initialIndustry = params.get("industry") || "";
  const initialState = params.get("state") || "";
  const utmSource = params.get("utm_source") || "embed";
  const refDomain = params.get("ref_domain") || "";

  const [businessName, setBusinessName] = useState("");
  const [industrySlug, setIndustrySlug] = useState(initialIndustry);
  const [stateSlug, setStateSlug] = useState(initialState);
  const [activity, setActivity] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

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

    // Initial post
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

    // Also notify ready so parent can hide its own loader
    try {
      window.parent.postMessage(
        { type: "rentalwaivers:ready", route: "generator" },
        "*"
      );
    } catch {
      /* ignore */
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("load", send);
    };
  }, [output, loading]);

  const industryName = useMemo(
    () => allIndustryPages.find((i) => i.slug === industrySlug)?.name || "",
    [industrySlug]
  );
  const stateName = useMemo(
    () => stateWaiverLawPages.find((s) => s.slug === stateSlug)?.state || "",
    [stateSlug]
  );

  // Set title + noindex without react-helmet-async
  useEffect(() => {
    document.title = "Free Waiver Generator | RentalWaivers";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex";
  }, []);

  const upgradeUrl = useMemo(() => {
    const u = new URLSearchParams();
    u.set("utm_source", utmSource);
    u.set("utm_medium", "embed-generator");
    if (refDomain) u.set("ref_domain", refDomain);
    if (industrySlug) u.set("industry", industrySlug);
    if (stateSlug) u.set("state", stateSlug);
    return `/login?${u.toString()}`;
  }, [utmSource, refDomain, industrySlug, stateSlug]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName || !industrySlug || !stateSlug || !activity) {
      toast.error("Please fill in every field");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-waiver-draft",
        {
          body: {
            businessName,
            industry: industryName,
            state: stateName,
            activity,
            source: "embed-generator",
            refDomain,
          },
        }
      );
      if (error) throw error;
      const text =
        (data as any)?.waiver ??
        (data as any)?.text ??
        (typeof data === "string" ? data : "");
      if (!text) throw new Error("Empty response");
      setOutput(text);
    } catch (err: any) {
      // Graceful fallback: render a deterministic templated draft so the
      // embed never appears broken on the host's site.
      setOutput(buildFallback({ businessName, industryName, stateName, activity }));
      toast.message("Showing template draft", {
        description: "AI rewrite unavailable — using base template.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <div
        ref={containerRef}
        className="min-h-[400px] bg-background text-foreground p-4 sm:p-6"
      >
        <Card className="border-border shadow-sm max-w-3xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Free Waiver Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate a state-aware liability waiver in seconds.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="biz">Business name</Label>
                  <Input
                    id="biz"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Kayak Rentals"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="act">Activity / equipment</Label>
                  <Input
                    id="act"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="Kayak rentals on coastal waters"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Select value={industrySlug} onValueChange={setIndustrySlug}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {allIndustryPages.map((i) => (
                        <SelectItem key={i.slug} value={i.slug}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Select value={stateSlug} onValueChange={setStateSlug}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {stateWaiverLawPages.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate waiver
                  </>
                )}
              </Button>
            </form>

            {output && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Your draft</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      type="button"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                        </>
                      )}
                    </Button>
                    <Button size="sm" asChild>
                      <a
                        href={upgradeUrl}
                        target="_top"
                        rel="noopener"
                      >
                        Send for signature
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
                <Textarea
                  readOnly
                  value={output}
                  className="min-h-[360px] font-mono text-xs leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  This is a template draft — review with a licensed attorney
                  before use. Not legal advice.
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border text-center">
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function buildFallback({
  businessName,
  industryName,
  stateName,
  activity,
}: {
  businessName: string;
  industryName: string;
  stateName: string;
  activity: string;
}) {
  return `LIABILITY WAIVER AND RELEASE OF CLAIMS

Business: ${businessName}
Activity: ${activity}
Industry: ${industryName}
Governing State: ${stateName}

1. ASSUMPTION OF RISK
I, the undersigned participant, acknowledge that participation in ${activity.toLowerCase()} provided by ${businessName} involves inherent risks of injury, property damage, or death. I voluntarily assume all such risks, both known and unknown.

2. RELEASE OF LIABILITY
In consideration for being permitted to participate, I hereby release, waive, and discharge ${businessName}, its owners, employees, and agents from any and all claims, demands, or causes of action arising out of my participation, to the fullest extent permitted by the laws of the State of ${stateName}.

3. INDEMNIFICATION
I agree to indemnify and hold harmless ${businessName} from any losses, liabilities, damages, or costs incurred as a result of my participation.

4. MEDICAL AUTHORIZATION
I authorize ${businessName} to seek emergency medical treatment on my behalf if needed, at my own expense.

5. GOVERNING LAW
This agreement shall be governed by and construed under the laws of the State of ${stateName}.

By signing below, I acknowledge that I have read this waiver, understand its terms, and sign it voluntarily.

_________________________      _________________________
Participant Signature           Date

_________________________      _________________________
Printed Name                    Emergency Contact

— Generated by RentalWaivers.com — Review with counsel before use.`;
}
