import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Tables, Json } from "@/integrations/supabase/types";

type EnvelopeWithVersion = Tables<"envelopes"> & {
  template_versions: Tables<"template_versions"> | null;
};

export default function SigningPage() {
  const { token } = useParams();
  const [envelope, setEnvelope] = useState<EnvelopeWithVersion | null>(null);
  const [templateContent, setTemplateContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");

  useEffect(() => {
    const fetch = async () => {
      // Find envelope by signing token
      const { data: env } = await supabase
        .from("envelopes")
        .select("*, template_versions(*)")
        .eq("signing_token", token)
        .single();

      if (!env) {
        setLoading(false);
        return;
      }

      setEnvelope(env);

      // Get template content and replace variables
      const tv = env.template_versions as Tables<"template_versions"> | null;
      const content = (tv?.content as Record<string, string>)?.body || "";
      const payload = (env.payload as Record<string, Json>) || {};
      let rendered = content;
      Object.entries(payload).forEach(([key, value]) => {
        rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
      });
      // Fill remaining known variables
      rendered = rendered.replace(/\{\{customer_name\}\}/g, env.signer_name || "");
      rendered = rendered.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
      setTemplateContent(rendered);

      // Mark as viewed if not already
      if (env.status === "sent") {
        await supabase.from("envelopes").update({ status: "viewed" }).eq("id", env.id);
        await supabase.from("envelope_events").insert({
          envelope_id: env.id,
          event_type: "envelope.viewed",
          ip_address: null,
          user_agent: navigator.userAgent,
        });
      }

      // Check expiration
      if (env.expires_at && new Date(env.expires_at) < new Date() && !["signed", "completed"].includes(env.status)) {
        await supabase.from("envelopes").update({ status: "expired" }).eq("id", env.id);
        env.status = "expired" as typeof env.status;
        setEnvelope({ ...env });
        setLoading(false);
        return;
      }

      if (env.status === "signed" || env.status === "completed") {
        setSigned(true);
      }

      setLoading(false);
    };
    fetch();
  }, [token]);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setScrolledToEnd(true);
    }
  };

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasPoint(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const getSignatureDataUrl = (): string | null => {
    if (signatureMode === "type") return null;
    return canvasRef.current?.toDataURL("image/png") || null;
  };

  const handleSign = async () => {
    if (!fullName.trim() || !initials.trim() || !agreed) {
      toast.error("Please complete all required fields");
      return;
    }
    if (signatureMode === "draw" && !hasDrawnSignature) {
      toast.error("Please draw your signature");
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const signatureImage = getSignatureDataUrl();
      const { error } = await supabase
        .from("envelopes")
        .update({
          status: "completed",
          signer_name: fullName.trim(),
          signed_at: now,
          user_agent: navigator.userAgent,
          signature_data: {
            full_name: fullName.trim(),
            initials: initials.trim(),
            signature_mode: signatureMode,
            signature_image: signatureImage,
            agreed_to_electronic_signing: true,
            signed_at_utc: now,
            user_agent: navigator.userAgent,
          },
        })
        .eq("signing_token", token);

      if (error) throw error;

      await supabase.from("envelope_events").insert({
        envelope_id: envelope.id,
        event_type: "envelope.completed",
        user_agent: navigator.userAgent,
        metadata: { signer_name: fullName.trim() },
      });

      setSigned(true);
      toast.success("Waiver signed successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signing failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!envelope) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-2">Link Not Found</h1>
          <p className="text-muted-foreground">This signing link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (envelope.status === "canceled") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-2">Waiver Canceled</h1>
          <p className="text-muted-foreground">This waiver has been canceled and can no longer be signed.</p>
        </div>
      </div>
    );
  }

  if (envelope.status === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-2">Waiver Expired</h1>
          <p className="text-muted-foreground">This signing link has expired. Please contact the sender for a new link.</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center animate-fade-in max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">Waiver Signed</h1>
          <p className="text-muted-foreground mb-4">
            Thank you, {envelope.signer_name}. Your signed waiver has been recorded.
            A confirmation will be sent to {envelope.signer_email}.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Envelope ID: {envelope.id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex h-14 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
            <FileText className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-heading text-sm font-bold">WaiverFlow</span>
          <span className="ml-auto text-xs text-muted-foreground">Powered by WaiverFlow</span>
        </div>
      </header>

      <div className="container max-w-2xl py-8 px-4">
        <div className="animate-fade-in">
          <h1 className="font-heading text-xl font-bold mb-1">Liability Waiver</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Please read the waiver below carefully, scroll to the bottom, then complete your signature.
          </p>

          {/* Waiver content */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div
                ref={contentRef}
                onScroll={handleScroll}
                className="max-h-[400px] overflow-y-auto p-6 text-sm leading-relaxed whitespace-pre-wrap"
              >
                {templateContent}
              </div>
              {!scrolledToEnd && (
                <div className="border-t px-6 py-3 text-center text-xs text-muted-foreground bg-accent/50">
                  ↓ Scroll to the end to continue
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signature fields */}
          <div className={`space-y-6 transition-opacity ${scrolledToEnd ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Legal Name *</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Initials *</Label>
                    <Input value={initials} onChange={(e) => setInitials(e.target.value)} placeholder="JD" maxLength={5} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Signature</Label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setSignatureMode("draw")}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${signatureMode === "draw" ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:bg-accent/80"}`}
                      >
                        Draw
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignatureMode("type")}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${signatureMode === "type" ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:bg-accent/80"}`}
                      >
                        Type
                      </button>
                    </div>
                  </div>

                  {signatureMode === "draw" ? (
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        width={560}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full rounded-lg border-2 border-dashed bg-white cursor-crosshair touch-none"
                        style={{ height: "160px" }}
                      />
                      {!hasDrawnSignature && (
                        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground/50 pointer-events-none">
                          Draw your signature here
                        </p>
                      )}
                      {hasDrawnSignature && (
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed bg-accent/30 p-8 text-center">
                      {fullName ? (
                        <p className="text-2xl italic font-serif text-foreground">{fullName}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Your typed name will appear here as your signature</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox id="agree" checked={agreed} onCheckedChange={(c) => setAgreed(c === true)} />
                  <Label htmlFor="agree" className="text-sm cursor-pointer">
                    I agree to sign this document electronically and acknowledge this constitutes a legally binding signature.
                  </Label>
                </div>

                <div className="text-xs text-muted-foreground">
                  Date: {new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSign} disabled={submitting || !agreed || !fullName || !initials || (signatureMode === "draw" && !hasDrawnSignature)} className="w-full" size="lg">
              {submitting ? "Signing..." : "Finish & Submit"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By clicking "Finish & Submit", you agree to the terms above and consent to electronic signing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
