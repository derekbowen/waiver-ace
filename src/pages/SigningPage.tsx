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
import { SignatureCanvas } from "@/components/SignatureCanvas";

export default function SigningPage() {
  const { token } = useParams();
  const [envelope, setEnvelope] = useState<any>(null);
  const [templateContent, setTemplateContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
      const content = (env.template_versions as any)?.content?.body || "";
      const payload = env.payload as Record<string, any> || {};
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

  const handleSign = async () => {
    if (!fullName.trim() || !initials.trim() || !agreed) {
      toast.error("Please complete all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("envelopes")
        .update({
          status: "completed",
          signer_name: fullName.trim(),
          signed_at: now,
          user_agent: navigator.userAgent,
          content_snapshot: {
            rendered: templateContent,
            template_version_id: envelope.template_version_id,
            snapshot_at: now,
          },
          signature_data: {
            full_name: fullName.trim(),
            initials: initials.trim(),
            signature_image: signatureDataUrl,
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

      // Send confirmation email to signer + notification to admin (fire and forget)
      supabase.functions.invoke("send-completion-email", {
        body: { envelope_id: envelope.id },
      }).catch(() => {}); // Don't block the UI on email failure

      setSigned(true);
      toast.success("Waiver signed successfully!");
    } catch (err: any) {
      toast.error(err.message);
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
          <span className="font-heading text-sm font-bold">Rental Waivers</span>
          <span className="ml-auto text-xs text-muted-foreground">Powered by Rental Waivers</span>
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
                  <Label>Signature</Label>
                  <SignatureCanvas onSignature={setSignatureDataUrl} />
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

            <Button onClick={handleSign} disabled={submitting || !agreed || !fullName || !initials || !signatureDataUrl} className="w-full" size="lg">
              {submitting ? "Signing..." : "Finish & Submit"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By clicking "Finish & Submit", you agree to the terms above and consent to electronic signing.
            </p>

            <p className="text-center text-xs text-muted-foreground/60 mt-4">
              Rental Waivers is a document signing tool, not a law firm, and does not provide legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
