import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Copy, Check, Zap, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Template {
  id: string;
  name: string;
}

export default function MarketplaceIntegration() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [integration, setIntegration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Form state
  const [platform, setPlatform] = useState("sharetribe");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [defaultTemplateId, setDefaultTemplateId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;

    // Load integration + templates in parallel
    Promise.all([
      supabase
        .from("marketplace_integrations")
        .select("*")
        .eq("org_id", profile.org_id)
        .limit(1),
      supabase
        .from("templates")
        .select("id, name")
        .eq("org_id", profile.org_id)
        .eq("is_active", true)
        .order("name"),
    ]).then(([intRes, tmplRes]) => {
      if (intRes.data && intRes.data.length > 0) {
        const int = intRes.data[0];
        setIntegration(int);
        setPlatform(int.platform);
        setClientId(int.client_id || "");
        setClientSecret(int.client_secret || "");
        setApiBaseUrl(int.api_base_url || "");
        setDefaultTemplateId(int.default_template_id || "");
        setIsActive(int.is_active);
      }
      setTemplates(tmplRes.data || []);
      setLoading(false);
    });
  }, [profile?.org_id]);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace-webhook`;
  const webhookSecret = integration?.webhook_secret || "Save to generate";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!profile?.org_id) return;
    setSaving(true);
    try {
      const payload = {
        org_id: profile.org_id,
        platform,
        client_id: clientId.trim() || null,
        client_secret: clientSecret.trim() || null,
        api_base_url: apiBaseUrl.trim() || null,
        default_template_id: defaultTemplateId || null,
        is_active: isActive,
      };

      if (integration) {
        const { error } = await supabase
          .from("marketplace_integrations")
          .update(payload)
          .eq("id", integration.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("marketplace_integrations")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setIntegration(data);
      }
      toast.success("Integration saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Marketplace Integration</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your marketplace to automatically send waivers when bookings are made
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* How it works */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">How it works</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Customer books on your marketplace (ShareTribe, etc.)</li>
                    <li>Your marketplace sends a webhook to the URL below</li>
                    <li>We auto-generate a liability waiver with the customer's info</li>
                    <li>Customer gets an email: "Sign your waiver" — one-click, done</li>
                    <li>Your dashboard shows green when they've signed</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhook URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook Configuration</CardTitle>
              <CardDescription>
                Configure your marketplace to send booking events to this URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => handleCopy(webhookUrl)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input
                    value={webhookSecret}
                    readOnly
                    className="font-mono text-xs"
                    type={integration ? "text" : "password"}
                  />
                  {integration && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(webhookSecret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Include this in the <code className="bg-accent px-1 rounded">x-webhook-secret</code> header of your webhook requests
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Platform settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Settings</CardTitle>
              <CardDescription>Optional: Connect to your marketplace API to pull additional booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sharetribe">ShareTribe</SelectItem>
                    <SelectItem value="other">Other / Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Client ID (optional)</Label>
                <Input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Your ShareTribe Client ID" />
              </div>

              <div className="space-y-2">
                <Label>Client Secret (optional)</Label>
                <Input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} placeholder="Your ShareTribe Client Secret" />
              </div>

              <div className="space-y-2">
                <Label>API Base URL (optional)</Label>
                <Input value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} placeholder="https://flex-api.sharetribe.com/v1" />
              </div>
            </CardContent>
          </Card>

          {/* Waiver template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Default Waiver Template</CardTitle>
              <CardDescription>
                Which template should be used for auto-generated waivers? Leave blank to use our standard liability waiver.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={defaultTemplateId || "__none__"} onValueChange={(v) => setDefaultTemplateId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-generate standard liability waiver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Auto-generate standard liability waiver</SelectItem>
                  {templates.filter((t) => t.id).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Active toggle */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Integration Active</Label>
                  <p className="text-xs text-muted-foreground">Enable or disable webhook processing</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>

          {/* Webhook payload docs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook Payload Format</CardTitle>
              <CardDescription>Send a POST request with this JSON body</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-accent rounded-lg p-4 text-xs font-mono overflow-x-auto">
{`POST ${webhookUrl}
Headers:
  Content-Type: application/json
  x-webhook-secret: ${integration ? webhookSecret.slice(0, 8) + "..." : "<your-secret>"}

Body:
{
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "booking_id": "bk_12345",
  "listing_id": "lst_pool_01",
  "listing_title": "Heated Pool with Slide",
  "booking_date": "2026-03-15",
  "state": "Florida"
}`}
              </pre>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/settings")}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Integration"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
