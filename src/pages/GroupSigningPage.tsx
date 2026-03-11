import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { SignatureCanvas } from "@/components/SignatureCanvas";
import { PhotoCapture } from "@/components/PhotoCapture";

export default function GroupSigningPage() {
  const { groupToken } = useParams();
  const [envelope, setEnvelope] = useState<any>(null);
  const [templateContent, setTemplateContent] = useState("");
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchSignatures = useCallback(async (envelopeId: string) => {
    const { data } = await supabase
      .from("group_signatures")
      .select("id, signer_name, signed_at")
      .eq("envelope_id", envelopeId)
      .order("signed_at", { ascending: true });
    setSignatures(data || []);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: env } = await supabase
        .from("envelopes")
        .select("*, template_versions(*)")
        .eq("group_token", groupToken)
        .eq("is_group_waiver", true)
        .single();

      if (!env) { setLoading(false); return; }

      setEnvelope(env);

      // Fetch require_photo from the template
      if ((env.template_versions as any)?.template_id) {
        const { data: tmpl } = await supabase
          .from("templates")
          .select("require_photo")
          .eq("id", (env.template_versions as any).template_id)
          .single();
        setRequirePhoto(tmpl?.require_photo === true);
      }

      const content = (env.template_versions as any)?.content?.body || "";
      const payload = env.payload as Record<string, any> || {};
      let rendered = content;
      Object.entries(payload).forEach(([key, value]) => {
        rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
      });
      rendered = rendered.replace(/\{\{customer_name\}\}/g, "");
      rendered = rendered.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
      setTemplateContent(rendered);

      await fetchSignatures(env.id);

      if (env.status === "canceled") {
        // handled in render
      } else if (env.status === "sent") {
        await supabase.from("envelopes").update({ status: "viewed" }).eq("id", env.id);
        await supabase.from("envelope_events").insert({
          envelope_id: env.id,
          event_type: "envelope.viewed",
          user_agent: navigator.userAgent,
        });
      }

      setLoading(false);
    };
    load();
  }, [groupToken, fetchSignatures]);

  useEffect(() => {
    if (!envelope?.id) return;
    const channel = supabase
      .channel(`group-sigs-${envelope.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_signatures", filter: `envelope_id=eq.${envelope.id}` },
        () => fetchSignatures(envelope.id)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [envelope?.id, fetchSignatures]);

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
    if (requirePhoto && !photoBlob) {
      toast.error("Please take a photo before signing");
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();

      // Upload photo if captured
      let photoStorageKey: string | null = null;
      if (photoBlob && envelope?.id) {
        const path = `${envelope.id}/${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from("signer-photos")
          .upload(path, photoBlob, { contentType: "image/jpeg" });
        if (uploadErr) throw uploadErr;
        photoStorageKey = path;
      }

      const { error } = await supabase.from("group_signatures").insert({
        envelope_id: envelope.id,
        signer_name: fullName.trim(),
        signer_email: signerEmail.trim() || null,
        initials: initials.trim(),
        signature_data: {
          signature_image: signatureDataUrl,
          agreed_to_electronic_signing: true,
          signed_at_utc: now,
          user_agent: navigator.userAgent,
        },
        signed_at: now,
        user_agent: navigator.userAgent,
        photo_storage_key: photoStorageKey,
      });

      if (error) throw error;

      await supabase.from("envelope_events").insert({
        envelope_id: envelope.id,
        event_type: "group.member_signed",
        user_agent: navigator.userAgent,
        metadata: { signer_name: fullName.trim(), signer_email: signerEmail.trim() || null },
      });

      supabase.functions.invoke("send-completion-email", {
        body: {
          envelope_id: envelope.id,
          group_signer_name: fullName.trim(),
          group_signer_email: signerEmail.trim() || null,
        },
      }).catch(() => {});

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
            Thank you, {fullName}. Your signed waiver has been recorded.
          </p>
          {signatures.length > 0 && (
            <div className="text-left mt-6 rounded-lg border p-4">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" /> {signatures.length + 1} {signatures.length + 1 === 1 ? "person has" : "people have"} signed
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {signatures.map((s) => (
                  <li key={s.id}>{s.signer_name}</li>
                ))}
                <li>{fullName} (you)</li>
              </ul>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-6">
            Others in your group can use this same link to sign.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => { setSigned(false); setFullName(""); setInitials(""); setSignerEmail(""); setSignatureDataUrl(null); setPhotoBlob(null); setAgreed(false); setScrolledToEnd(false); }}>
            Next Person — Sign Another
          </Button>
        </div>
      </div>
    );
  }

  const canSubmit = agreed && fullName && initials && signatureDataUrl && (!requirePhoto || !!photoBlob);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex h-14 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
            <FileText className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-heading text-sm font-bold">Rental Waivers</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {envelope.group_label || "Group Waiver"} — {signatures.length} signed so far
          </span>
        </div>
      </header>

      <div className="container max-w-2xl py-8 px-4">
        <div className="animate-fade-in">
          <h1 className="font-heading text-xl font-bold mb-1">
            {envelope.group_label || "Liability Waiver"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Each person in your group needs to sign individually. Read the waiver, scroll to the bottom, then complete your signature.
          </p>

          {signatures.length > 0 && (
            <Card className="mb-4 bg-accent/50">
              <CardContent className="py-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {signatures.length} {signatures.length === 1 ? "person has" : "people have"} already signed:{" "}
                  {signatures.map((s) => s.signer_name).join(", ")}
                </span>
              </CardContent>
            </Card>
          )}

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
                  <Label>Email (optional)</Label>
                  <Input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} placeholder="john@example.com" />
                  <p className="text-xs text-muted-foreground">For your records — we'll send you a copy if provided</p>
                </div>

                <div className="space-y-2">
                  <Label>Signature</Label>
                  <SignatureCanvas onSignature={setSignatureDataUrl} />
                </div>

                <div className="space-y-2">
                  <Label>Photo {requirePhoto ? "*" : "(optional)"}</Label>
                  <PhotoCapture onPhoto={setPhotoBlob} required={requirePhoto} />
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

            <Button onClick={handleSign} disabled={submitting || !canSubmit} className="w-full" size="lg">
              {submitting ? "Signing..." : "Sign Waiver"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By clicking "Sign Waiver", you agree to the terms above and consent to electronic signing. Rental Waivers is not a law firm. This is not legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
