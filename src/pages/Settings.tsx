import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Globe, ExternalLink, Loader2, CreditCard, Zap, Coins } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/i18n";

export default function Settings() {
  const { profile, user, wallet } = useAuth();
  const { locale } = useI18n();
  const [orgName, setOrgName] = useState("");
  const [retentionYears, setRetentionYears] = useState(7);
  const [saving, setSaving] = useState(false);
  const [hasOrg, setHasOrg] = useState(false);

  useEffect(() => {
    if (!profile?.org_id) return;
    supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.org_id)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrgName(data.name);
          setRetentionYears(data.retention_years);
          setHasOrg(true);
        }
      });
  }, [profile?.org_id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (hasOrg && profile?.org_id) {
        const { error } = await supabase
          .from("organizations")
          .update({ name: orgName, retention_years: retentionYears })
          .eq("id", profile.org_id);
        if (error) throw error;
        toast.success("Settings saved");
      } else {
        // Use Edge Function to bypass RLS for org setup
        const { data, error } = await supabase.functions.invoke("setup-org", {
          body: { name: orgName, retention_years: retentionYears },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setHasOrg(true);
        toast.success("Organization created! You are now an admin.");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your organization</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization</CardTitle>
              <CardDescription>{hasOrg ? "Update your organization details" : "Create your organization to get started"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Pool Rentals" />
              </div>
              <div className="space-y-2">
                <Label>PDF Retention (years)</Label>
                <Input type="number" min={1} max={99} value={retentionYears} onChange={(e) => setRetentionYears(Number(e.target.value))} />
              </div>
              <Button onClick={handleSave} disabled={saving || !orgName.trim()} className="gap-2">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : hasOrg ? "Save Changes" : "Create Organization"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Language</CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={locale}
                  onValueChange={(v) => {
                    if ((window as any).__setLocale) (window as any).__setLocale(v);
                  }}
                >
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Espanol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {hasOrg && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Marketplace Integration
                </CardTitle>
                <CardDescription>
                  Automatically send waivers when customers book on ShareTribe or other marketplaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/settings/marketplace"}>
                  <ExternalLink className="h-4 w-4" />
                  Configure Integration
                </Button>
              </CardContent>
            </Card>
          )}

          {hasOrg && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  Credits
                </CardTitle>
                <CardDescription>
                  {wallet.credits} credits remaining
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/pricing"}>
                  <CreditCard className="h-4 w-4" />
                  Buy Credits
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
