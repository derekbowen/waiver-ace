import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plug, CheckCircle, Circle } from "lucide-react";
import { toast } from "sonner";

interface IntegrationConfig {
  id?: string;
  provider: string;
  is_active: boolean;
  settings: Record<string, string>;
}

export default function Integrations() {
  const { profile } = useAuth();
  const [config, setConfig] = useState<IntegrationConfig | null>(null);
  const [provider, setProvider] = useState("sharetribe");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }

    Promise.all([
      supabase
        .from("integration_configs")
        .select("*")
        .eq("org_id", profile.org_id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("templates")
        .select("id, name")
        .eq("org_id", profile.org_id)
        .eq("is_active", true),
    ]).then(([configRes, templatesRes]) => {
      if (configRes.data) {
        const c = configRes.data;
        setConfig(c as IntegrationConfig);
        setProvider(c.provider);
        setClientId((c.settings as Record<string, string>)?.client_id || "");
        setClientSecret((c.settings as Record<string, string>)?.client_secret || "");
        setTemplateId((c.settings as Record<string, string>)?.template_id || "");
      }
      setTemplates(templatesRes.data || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [profile?.org_id]);

  const handleSave = async () => {
    if (!profile?.org_id) return;
    setSaving(true);

    const settings: Record<string, string> = {
      client_id: clientId.trim(),
      client_secret: clientSecret.trim(),
      template_id: templateId,
      base_url: provider === "sharetribe" ? "https://flex-api.sharetribe.com" : "",
    };

    try {
      if (config?.id) {
        const { error } = await supabase
          .from("integration_configs")
          .update({ provider, settings, is_active: true })
          .eq("id", config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("integration_configs")
          .insert({ org_id: profile.org_id, provider, settings, is_active: true });
        if (error) throw error;
      }
      toast.success("Integration saved");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!config?.id) return;
    await supabase
      .from("integration_configs")
      .update({ is_active: false })
      .eq("id", config.id);
    setConfig({ ...config, is_active: false });
    toast.success("Integration disconnected");
  };

  const isConnected = config?.is_active && clientId && clientSecret && templateId;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your marketplace to automate waiver delivery
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Plug className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Marketplace Connection</CardTitle>
                  <CardDescription>
                    When connected, waivers are sent automatically for every new booking
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Not connected</span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharetribe">Sharetribe</SelectItem>
                  <SelectItem value="arcadier">Arcadier</SelectItem>
                  <SelectItem value="custom">Custom / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {provider === "sharetribe" && (
              <>
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Your Sharetribe Integration API client ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in Sharetribe Console &gt; Build &gt; Applications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Your Sharetribe Integration API client secret"
                  />
                </div>
              </>
            )}

            {provider === "arcadier" && (
              <>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Your Arcadier API key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Your Arcadier API secret"
                  />
                </div>
              </>
            )}

            {provider === "custom" && (
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-sm text-muted-foreground">
                  For custom marketplaces, use the RentalWaivers REST API directly.
                  Go to <strong>API Keys</strong> to create a key, then call{" "}
                  <code className="text-xs bg-accent px-1 py-0.5 rounded">POST /envelopes</code>{" "}
                  when a booking is created. See the API docs for details.
                </p>
              </div>
            )}

            {provider !== "custom" && (
              <div className="space-y-2">
                <Label>Waiver Template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template to use" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This template will be used for all auto-generated waivers
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {provider !== "custom" && (
                <Button onClick={handleSave} disabled={saving || !clientId || !clientSecret || !templateId} className="gap-2">
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : isConnected ? "Update" : "Connect"}
                </Button>
              )}
              {isConnected && (
                <Button variant="outline" onClick={handleDisconnect} className="text-destructive">
                  Disconnect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                <span>A customer creates a booking on your marketplace</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                <span>RentalWaivers detects the new transaction and creates a waiver envelope</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                <span>The customer receives an email with a signing link</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                <span>Once signed, a webhook notifies your marketplace to confirm the booking</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          You can always send waivers manually from the Envelopes page, even with an integration connected.
        </p>
      </div>
    </DashboardLayout>
  );
}
