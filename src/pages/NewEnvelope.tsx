import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { TIERS } from "@/lib/stripe-tiers";

export default function NewEnvelope() {
  const { profile, subscription } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerName, setSignerName] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [listingId, setListingId] = useState("");
  const [hostId, setHostId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase
      .from("templates")
      .select("id, name")
      .eq("org_id", profile.org_id)
      .eq("is_active", true)
      .then(({ data }) => setTemplates(data || []));
  }, [profile?.org_id]);

  const atLimit = subscription.usage >= subscription.waiverLimit && subscription.tier === "free";

  const handleCreate = async () => {
    if (atLimit) {
      toast.error("You've reached your monthly waiver limit. Upgrade your plan to continue.");
      return;
    }

    if (!profile?.org_id || !templateId || !signerEmail) {
      toast.error("Template and signer email are required");
      return;
    }

    setSaving(true);
    try {
      // Get current version
      const { data: version } = await supabase
        .from("template_versions")
        .select("id")
        .eq("template_id", templateId)
        .eq("is_current", true)
        .single();

      if (!version) throw new Error("No active template version found");

      // Default expiration: 7 days from now
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: envelope, error } = await supabase
        .from("envelopes")
        .insert({
          org_id: profile.org_id,
          template_version_id: version.id,
          signer_email: signerEmail.trim(),
          signer_name: signerName.trim() || null,
          booking_id: bookingId.trim() || null,
          listing_id: listingId.trim() || null,
          host_id: hostId.trim() || null,
          customer_id: customerId.trim() || null,
          status: "sent",
          expires_at: expiresAt,
          payload: { booking_id: bookingId, listing_id: listingId, host_id: hostId, customer_id: customerId },
        })
        .select()
        .single();

      if (error) throw error;

      // Log event
      await supabase.from("envelope_events").insert({
        envelope_id: envelope.id,
        event_type: "envelope.sent",
        metadata: { signer_email: signerEmail },
      });

      // Send signing email
      // Get template name for the email subject line
      const selectedTemplate = templates.find((t) => t.id === templateId);
      const signingUrl = `${window.location.origin}/sign/${envelope.signing_token}`;
      await supabase.functions.invoke("send-signing-email", {
        body: {
          to: signerEmail.trim(),
          signerName: signerName.trim() || signerEmail.trim(),
          signingUrl,
          templateName: selectedTemplate?.name || "Waiver Agreement",
        },
      });

      toast.success("Envelope created and signing link emailed!");
      navigate(`/envelopes/${envelope.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create envelope");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/envelopes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">New Envelope</h1>
            <p className="text-sm text-muted-foreground mt-1">Send a waiver for signing</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Usage warning */}
          {atLimit && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Monthly limit reached</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You've used {subscription.usage}/{subscription.waiverLimit} waivers on the {TIERS[subscription.tier].name} plan.{" "}
                    <a href="/pricing" className="text-primary underline">Upgrade your plan</a> to send more.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {!atLimit && subscription.usage > 0 && (
            <p className="text-sm text-muted-foreground">
              {subscription.usage}/{subscription.waiverLimit} waivers used this period ({TIERS[subscription.tier].name} plan)
            </p>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Template</CardTitle></CardHeader>
            <CardContent>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Signer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} placeholder="signer@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="John Doe" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Booking Data</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Booking ID</Label>
                  <Input value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="bk_123" />
                </div>
                <div className="space-y-2">
                  <Label>Listing ID</Label>
                  <Input value={listingId} onChange={(e) => setListingId(e.target.value)} placeholder="lst_456" />
                </div>
                <div className="space-y-2">
                  <Label>Host ID</Label>
                  <Input value={hostId} onChange={(e) => setHostId(e.target.value)} placeholder="host_789" />
                </div>
                <div className="space-y-2">
                  <Label>Customer ID</Label>
                  <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="cust_012" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/envelopes")}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || atLimit} className="gap-2">
              <Send className="h-4 w-4" /> {saving ? "Creating..." : "Create & Send"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
