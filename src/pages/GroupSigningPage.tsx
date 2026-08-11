import { useEffect, useState, useRef, useCallback } from "react";
import { useNoindex } from "@/hooks/useNoindex";
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
import { VideoEmbed } from "@/components/VideoEmbed";

export default function GroupSigningPage() {
  useNoindex();
  const { groupToken } = useParams();
  const [envelope, setEnvelope] = useState<any>(null);
  const [templateContent, setTemplateContent] = useState("");
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [requireVideo, setRequireVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);
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
  const [minors, setMinors] = useState<{ name: string; age: string }[]>([]);
  const [guardianAttested, setGuardianAttested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const addMinor = () => setMinors((m) => [...m, { name: "", age: "" }]);
  const removeMinor = (i: number) => setMinors((m) => m.filter((_, idx) => idx !== i));
  const updateMinor = (i: number, field: "name" | "age", value: string) =>
    setMinors((m) => m.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));


  const loadGroupWaiver = useCallback(async () => {
    if (!groupToken) return null;

    const { data, error } = await supabase.rpc("get_group_waiver_by_token", {
      p_group_token: groupToken,
      p_user_agent: navigator.userAgent,
    });

    if (error || !data) return null;
    return data as any;
  }, [groupToken]);

  const fetchSignatures = useCallback(async () => {
    const env = await loadGroupWaiver();
    setSignatures(Array.isArray(env?.signatures) ? env.signatures : []);
  }, [loadGroupWaiver]);

  useEffect(() => {
    const load = async () => {
      const env = await loadGroupWaiver();

      if (!env) { setLoading(false); return; }

      if (env.error) {
        setEnvelope(env);
        setLoading(false);
        return;
      }

      setEnvelope(env);
      setRequirePhoto(env.require_photo === true);
      setRequireVideo(env.require_video === true);
      setVideoUrl(env.video_url || null);

      const content = env.template_content?.body || "";
      const payload = env.payload as Record<string, any> || {};
      let rendered = content;
      Object.entries(payload).forEach(([key, value]) => {
        rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
      });
      rendered = rendered.replace(/\{\{customer_name\}\}/g, "");
      const effectiveDate = payload.rental_date
        ? new Date(payload.rental_date + "T00:00:00").toLocaleDateString()
        : new Date().toLocaleDateString();
      rendered = rendered.replace(/\{\{date\}\}/g, effectiveDate);
      rendered = rendered.replace(/\{\{rental_date\}\}/g, effectiveDate);
      setTemplateContent(rendered);

      setSignatures(Array.isArray(env.signatures) ? env.signatures : []);

      setLoading(false);
    };
    load();
  }, [loadGroupWaiver]);

  useEffect(() => {
    if (!envelope?.id) return;
    const channel = supabase
      .channel(`group-sigs-${envelope.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_signatures", filter: `envelope_id=eq.${envelope.id}` },
          () => fetchSignatures()
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
    const cleanMinors = minors
      .map((m) => ({ name: m.name.trim(), age: m.age.trim() }))
      .filter((m) => m.name.length > 0);
    if (minors.some((m) => !m.name.trim())) {
      toast.error("Please enter a name for each minor, or remove the empty row");
      return;
    }
    if (cleanMinors.length > 0 && !guardianAttested) {
      toast.error("Please confirm you are the parent or legal guardian of the minors listed");
      return;
    }

    const guardianConsentText =
      "I certify that I am the parent or legal guardian of the minors listed (or am authorized by their parent/legal guardian), and I sign this waiver on their behalf, agreeing that all of its terms apply equally to them.";

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

      const { data: result, error } = await supabase.rpc("sign_group_waiver", {
        p_group_token: groupToken!,
        p_signer_name: fullName.trim(),
        p_signer_email: signerEmail.trim() || null,
        p_initials: initials.trim(),
        p_signature_data: {
          signature_image: signatureDataUrl,
          agreed_to_electronic_signing: true,
          signed_at_utc: now,
          user_agent: navigator.userAgent,
          minors: cleanMinors,
          minor_names: cleanMinors.map((m) => (m.age ? `${m.name} (age ${m.age})` : m.name)).join(", "),
          guardian_attested: cleanMinors.length > 0 ? true : undefined,
          guardian_consent_text: cleanMinors.length > 0 ? guardianConsentText : undefined,
        },

        p_user_agent: navigator.userAgent,
        p_photo_storage_key: photoStorageKey,
      });

      if (error) throw error;
      const res = result as any;
      if (!res?.success) throw new Error(res?.error || "Failed to sign waiver");

      supabase.functions.invoke("send-completion-email", {
        body: {
          envelope_id: envelope.id,
          group_token: groupToken,
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

  if (envelope.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-2xl font-bold mb-2">Can't open this waiver</h1>
          <p className="text-muted-foreground">
            {envelope.message || "This group waiver link is invalid or has expired."}
          </p>
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
          <Button variant="outline" className="mt-4" onClick={() => { setSigned(false); setFullName(""); setInitials(""); setSignerEmail(""); setSignatureDataUrl(null); setPhotoBlob(null); setAgreed(false); setScrolledToEnd(false); setVideoWatched(false); }}>
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
            {"Group Waiver"} — {signatures.length} signed so far
          </span>
        </div>
      </header>

      <div className="container max-w-2xl py-8 px-4">
        <div className="animate-fade-in">
          <h1 className="font-heading text-xl font-bold mb-1">
            Liability Waiver
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
                {templateContent.replace(
                  /\{\{minor_names\}\}/g,
                  minors
                    .filter((m) => m.name.trim())
                    .map((m) => (m.age.trim() ? `${m.name.trim()} (age ${m.age.trim()})` : m.name.trim()))
                    .join(", ")
                )}

              </div>
              {!scrolledToEnd && (
                <div className="border-t px-6 py-3 text-center text-xs text-muted-foreground bg-accent/50">
                  ↓ Scroll to the end to continue
                </div>
              )}
            </CardContent>
          </Card>

          {scrolledToEnd && requireVideo && videoUrl && (
            <VideoEmbed url={videoUrl} onWatched={() => setVideoWatched(true)} />
          )}

          <div className={`space-y-6 transition-opacity ${scrolledToEnd && (!requireVideo || videoWatched) ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
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

                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Label className="text-sm">Minors / dependents (optional)</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add any children under 18 you are signing for as their parent or legal guardian.
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addMinor}>
                      Add minor
                    </Button>
                  </div>

                  {minors.length > 0 && (
                    <div className="space-y-2">
                      {minors.map((m, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input
                            value={m.name}
                            onChange={(e) => updateMinor(i, "name", e.target.value)}
                            placeholder="Child's full name"
                            className="flex-1"
                          />
                          <Input
                            value={m.age}
                            onChange={(e) => updateMinor(i, "age", e.target.value)}
                            placeholder="Age"
                            inputMode="numeric"
                            maxLength={2}
                            className="w-20"
                          />
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeMinor(i)}>
                            Remove
                          </Button>
                        </div>
                      ))}

                      <div className="flex items-start gap-3 pt-1">
                        <Checkbox
                          id="guardian"
                          checked={guardianAttested}
                          onCheckedChange={(c) => setGuardianAttested(c === true)}
                        />
                        <Label htmlFor="guardian" className="text-xs cursor-pointer leading-relaxed">
                          I certify that I am the parent or legal guardian of the minors listed above (or am authorized
                          by their parent/legal guardian), and I sign this waiver on their behalf, agreeing that all of
                          its terms apply equally to them.
                        </Label>
                      </div>
                    </div>
                  )}

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
