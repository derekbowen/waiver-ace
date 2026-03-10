import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, AlertTriangle, Users } from "lucide-react";
import { toast } from "sonner";

export default function NewEnvelope() {
  const { profile } = useAuth();
  const { credits, isPaused, isLow, isOverdraft, status } = useWallet();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [isGroupWaiver, setIsGroupWaiver] = useState(false);
  const [groupLabel, setGroupLabel] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerName, setSignerName] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [listingId, setListingId] = useState("");
  const [hostId, setHostId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("7");
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

  const handleCreate = async () => {
    if (!profile?.org_id || !templateId) {
      toast.error("Template is required");
      return;
    }
    if (!isGroupWaiver && !signerEmail) {
      toast.error("Signer email is required for individual waivers");
      return;
    }

    setSaving(true);
    try {
      const { data: version } = await supabase
        .from("template_versions")
        .select("id")
        .eq("template_id", templateId)
        .eq("is_current", true)
        .single();

      if (!version) throw new Error("No active template version found");

      const { data: envelope, error } = await supabase
        .from("envelopes")
        .insert({
          org_id: profile.org_id,
          template_version_id: version.id,
          signer_email: isGroupWaiver ? (signerEmail.trim() || "group@placeholder.local") : signerEmail.trim(),
          signer_name: isGroupWaiver ? (groupLabel.trim() || "Group Waiver") : (signerName.trim() || null),
          booking_id: bookingId.trim() || null,
          listing_id: listingId.trim() || null,
          host_id: hostId.trim() || null,
          customer_id: customerId.trim() || null,
          status: "sent",
          is_group_waiver: isGroupWaiver,
          group_label: isGroupWaiver ? (groupLabel.trim() || null) : null,
          expires_at: expiresInDays ? new Date(Date.now() + Number(expiresInDays) * 86400000).toISOString() : null,
          payload: { booking_id: bookingId, listing_id: listingId, host_id: hostId, customer_id: customerId },
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("envelope_events").insert({
        envelope_id: envelope.id,
        event_type: "envelope.sent",
        metadata: { is_group: isGroupWaiver, signer_email: signerEmail || null },
      });

      toast.success(isGroupWaiver ? "Group waiver created! Share the link with your group." : "Envelope created! Signing link is ready.");
      navigate(`/envelopes/${envelope.id}`);
    } catch (err: any) {
      toast.error(err.message);
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
          {isPaused && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Waiver collection is paused</p>
                  <p className="text-sm text-muted-foreground">
                    Your credit balance has been exhausted.{" "}
                    <a href="/pricing" className="text-primary underline">Add credits</a> to continue sending waivers.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isPaused && (isLow || isOverdraft) && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{credits} credits remaining</p>
                  <p className="text-sm text-muted-foreground">
                    {isOverdraft ? "You're in overdraft. " : "Running low. "}
                    <a href="/pricing" className="text-primary underline">Add credits</a> to keep sending.
                  </p>
                </div>
              </CardContent>
            </Card>
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
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Waiver Type</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="group-mode" className="text-sm font-medium">Group Waiver</Label>
                  <p className="text-xs text-muted-foreground">
                    One shareable link — everyone in the party signs individually. No emails needed upfront.
                  </p>
                </div>
                <Switch id="group-mode" checked={isGroupWaiver} onCheckedChange={setIsGroupWaiver} />
              </div>

              {isGroupWaiver && (
                <div className="space-y-2">
                  <Label>Group Label</Label>
                  <Input
                    value={groupLabel}
                    onChange={(e) => setGroupLabel(e.target.value)}
                    placeholder="e.g. Smith Family Pool Party"
                  />
                  <p className="text-xs text-muted-foreground">Shown to signers so they know which waiver this is for</p>
                </div>
              )}
            </CardContent>
          </Card>

          {!isGroupWaiver && (
            <Card>
              <CardHeader><CardTitle className="text-base">Signer</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
          )}

          {isGroupWaiver && (
            <Card className="bg-accent/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">How group waivers work</p>
                    <ul className="text-muted-foreground space-y-1 list-disc pl-4">
                      <li>You'll get a single shareable link (e.g. for a text message or booking confirmation)</li>
                      <li>Each person opens the link and signs with their own name and signature</li>
                      <li>No email addresses needed upfront — money keeps flowing at checkout</li>
                      <li>You'll see all signatures on the envelope detail page</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Booking Data</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
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

          <Card>
            <CardHeader><CardTitle className="text-base">Expiration</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Expires in (days)</Label>
                <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="">No expiration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/envelopes")}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || isPaused} className="gap-2">
              <Send className="h-4 w-4" /> {saving ? "Creating..." : isGroupWaiver ? "Create Group Waiver" : "Create & Send"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
