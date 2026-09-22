import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PLACEHOLDERS = [
  { token: "{{signer_name}}", label: "Guest name" },
  { token: "{{org_name}}", label: "Your business name" },
  { token: "{{document}}", label: "Waiver name" },
  { token: "{{date}}", label: "Signed date" },
  { token: "{{booking_id}}", label: "Booking reference" },
];

const SAMPLE: Record<string, string> = {
  signer_name: "Taylor Reed",
  org_name: "Your Business",
  document: "Kayak Rental Waiver",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  booking_id: "BK-10284",
};

function fillSample(text: string) {
  return text.replace(/\{\{(\w+)\}\}/g, (_m, key) => SAMPLE[key] ?? "");
}

export default function CompletionEmailEditor() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.org_id)
      .maybeSingle()
      .then(({ data }) => {
        const org = (data || {}) as Record<string, any>;
        setSubject(org.completion_email_subject || "");
        setMessage(org.completion_email_message || "");
        setButtonLabel(org.completion_email_button_label || "");
        setButtonUrl(org.completion_email_button_url || "");
        setLoading(false);
      });
  }, [profile?.org_id]);

  const insertToken = (token: string) => {
    setMessage((prev) => (prev ? `${prev}${prev.endsWith(" ") ? "" : " "}${token}` : token));
  };

  const handleSave = async () => {
    if (!profile?.org_id) return;
    if (buttonUrl && !/^https?:\/\//i.test(buttonUrl)) {
      toast.error("Button link must start with http:// or https://");
      return;
    }
    if (buttonUrl && !buttonLabel.trim()) {
      toast.error("Add a button label for your link");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("organizations")
      .update({
        completion_email_subject: subject.trim() || null,
        completion_email_message: message.trim() || null,
        completion_email_button_label: buttonLabel.trim() || null,
        completion_email_button_url: buttonUrl.trim() || null,
      } as any)
      .eq("id", profile.org_id);
    setSaving(false);
    if (error) {
      toast.error("Could not save: " + error.message);
      return;
    }
    toast.success("Completion email saved");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2" onClick={() => navigate("/settings")}>
            <ArrowLeft className="h-4 w-4" /> Back to settings
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Completion email</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add your own instructions — door or lock codes, parking, meeting spot — to the email guests get right after they sign.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Your message
            </CardTitle>
            <CardDescription>
              Leave blank to send the standard confirmation. Everything you add appears above the signed PDF link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject line (optional)</Label>
              <Input
                id="subject"
                value={subject}
                disabled={loading}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="You're all set — here's your access info"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                disabled={loading}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder={"Thanks {{signer_name}}! The kayak locker code is 1987.\nLaunch point is the north dock — life jackets are inside the locker."}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {PLACEHOLDERS.map((p) => (
                  <Button key={p.token} type="button" variant="outline" size="sm" onClick={() => insertToken(p.token)}>
                    {p.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Tap a button to drop it in — it gets replaced with the real details when the email goes out.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="btnLabel">Button text (optional)</Label>
                <Input
                  id="btnLabel"
                  value={buttonLabel}
                  disabled={loading}
                  onChange={(e) => setButtonLabel(e.target.value)}
                  placeholder="View check-in instructions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="btnUrl">Button link (optional)</Label>
                <Input
                  id="btnUrl"
                  value={buttonUrl}
                  disabled={loading}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="https://example.com/check-in"
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>How it will look to a guest, using sample details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-card p-5 space-y-3">
              <p className="text-sm font-medium">
                {fillSample(subject) || `✓ Waiver Signed — Your copy from ${SAMPLE.org_name}`}
              </p>
              <p className="text-sm text-muted-foreground">Hi {SAMPLE.signer_name},</p>
              <p className="text-sm">Your waiver has been signed and recorded successfully.</p>
              {message.trim() && (
                <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm whitespace-pre-wrap">
                  {fillSample(message)}
                </div>
              )}
              {buttonLabel.trim() && buttonUrl.trim() && (
                <div className="pt-1">
                  <span className="inline-block rounded-md bg-primary px-4 py-2 text-xs text-primary-foreground">
                    {fillSample(buttonLabel)}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Download Signed Waiver (PDF) · link expires in 7 days</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
