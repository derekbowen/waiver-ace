import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { profile, user } = useAuth();
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
        // Use edge function to create org, link profile, and assign admin role
        // (direct inserts are blocked by RLS — no INSERT policy on organizations,
        // and user_roles requires admin role which doesn't exist yet)
        const { data, error } = await supabase.functions.invoke("setup-organization", {
          body: { name: orgName, retention_years: retentionYears },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setHasOrg(true);
        toast.success("Organization created! You are now an admin.");
        window.location.reload();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
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
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="My Marketplace" />
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
        </div>
      </div>
    </DashboardLayout>
  );
}
