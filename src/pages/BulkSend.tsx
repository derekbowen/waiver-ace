import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { calculateCreditCost, orgIsBranded } from "@/lib/credit-cost";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Send, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BulkResult {
  email: string;
  success: boolean;
  error?: string;
}

export default function BulkSend() {
  const { profile } = useAuth();
  const { credits, isPaused, isLow, isOverdraft } = useWallet();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [emailsText, setEmailsText] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<BulkResult[] | null>(null);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase
      .from("templates")
      .select("id, name")
      .eq("org_id", profile.org_id)
      .eq("is_active", true)
      .then(({ data }) => setTemplates(data || []));
  }, [profile?.org_id]);

  const parseEmails = () => {
    return emailsText
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes("@"));
  };

  const handleBulkSend = async () => {
    if (!profile?.org_id || !templateId) {
      toast.error("Select a template first");
      return;
    }

    const emails = parseEmails();
    if (emails.length === 0) {
      toast.error("Enter at least one valid email");
      return;
    }

    if (isPaused) {
      toast.error("Credit balance exhausted. Add credits to continue sending.");
      return;
    }

    // Allow sending up to credits + overdraft buffer (10)
    if (emails.length > credits + 10) {
      toast.error(`Not enough credits. You have ${credits} credits (with overdraft buffer). Add more credits.`);
      return;
    }

    setSending(true);
    const bulkResults: BulkResult[] = [];

    // Get current template version and features
    const { data: version } = await supabase
      .from("template_versions")
      .select("id")
      .eq("template_id", templateId)
      .eq("is_current", true)
      .single();

    if (!version) {
      toast.error("No active template version found");
      setSending(false);
      return;
    }

    // Get template features for credit cost
    const { data: tmpl } = await supabase
      .from("templates")
      .select("require_photo, require_video")
      .eq("id", templateId)
      .single();

    // Get org branding
    const { data: org } = await supabase
      .from("organizations")
      .select("logo_url, brand_color, brand_font")
      .eq("id", profile.org_id)
      .single();

    const cost = calculateCreditCost({
      requirePhoto: tmpl?.require_photo,
      requireVideo: tmpl?.require_video,
      isBranded: orgIsBranded(org || {}),
    });

    for (const email of emails) {
      try {
        const { data: envelope, error } = await supabase
          .from("envelopes")
          .insert({
            org_id: profile.org_id,
            template_version_id: version.id,
            signer_email: email,
            status: "sent",
            credits_charged: cost.total,
            expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
            payload: {},
          })
          .select()
          .single();

        if (error) throw error;

        // Deduct variable credit amount
        const { data: creditResult, error: creditErr } = await supabase.rpc("deduct_credit", {
          p_org_id: profile.org_id,
          p_reference_id: envelope.id,
          p_type: "waiver_deduction",
          p_amount: cost.total,
          p_notes: cost.breakdown.map(b => `${b.label}:${b.cost}`).join(" + "),
        });

        if (creditErr || !creditResult?.[0]?.success) {
          // Credit deduction failed — cancel this envelope
          await supabase.from("envelopes").update({ status: "canceled" }).eq("id", envelope.id);
          const msg = creditResult?.[0]?.error_message || "Insufficient credits";
          bulkResults.push({ email, success: false, error: msg });
          break; // Stop sending — no more credits
        }

        await supabase.from("envelope_events").insert({
          envelope_id: envelope.id,
          event_type: "envelope.sent",
          metadata: { source: "bulk" },
        });

        bulkResults.push({ email, success: true });
      } catch (err: any) {
        bulkResults.push({ email, success: false, error: err.message });
      }
    }

    setResults(bulkResults);
    setSending(false);
    const successCount = bulkResults.filter((r) => r.success).length;
    toast.success(`${successCount}/${emails.length} envelopes created`);
  };

  const emailCount = parseEmails().length;

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/envelopes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Bulk Send</h1>
            <p className="text-sm text-muted-foreground mt-1">Send waivers to multiple signers at once</p>
          </div>
        </div>

        {isPaused && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Waiver collection paused</p>
                <p className="text-sm text-muted-foreground">
                  <a href="/pricing" className="text-primary underline">Add credits</a> to resume sending waivers.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Template</CardTitle></CardHeader>
            <CardContent>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                <SelectContent>
                {templates.filter((t) => t.id).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signer Emails</CardTitle>
              <CardDescription>Enter one email per line, or separate with commas</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                placeholder={"signer1@example.com\nsigner2@example.com\nsigner3@example.com"}
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {emailCount} email{emailCount !== 1 ? "s" : ""} detected · {credits} credits remaining
              </p>
            </CardContent>
          </Card>

          {results && (
            <Card>
              <CardHeader><CardTitle className="text-base">Results</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {r.success ? (
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <span className="font-mono">{r.email}</span>
                      {r.error && <span className="text-destructive text-xs">({r.error})</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/envelopes")}>Cancel</Button>
            <Button
              onClick={handleBulkSend}
              disabled={sending || isPaused || emailCount === 0 || !templateId}
              className="gap-2"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending..." : `Send ${emailCount} Waiver${emailCount !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
