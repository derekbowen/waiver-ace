import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Key, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ApiKeys() {
  const { profile } = useAuth();
  const [keys, setKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }
    supabase
      .from("api_keys")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setKeys(data || []); setLoading(false); });
  }, [profile?.org_id]);

  const createKey = async () => {
    if (!profile?.org_id || !newKeyName.trim()) return;
    const rawKey = `wf_${crypto.randomUUID().replace(/-/g, "")}`;
    const prefix = rawKey.slice(0, 10);
    // Simple hash for storage (in production, use proper hashing)
    const hash = btoa(rawKey);

    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        org_id: profile.org_id,
        name: newKeyName.trim(),
        key_hash: hash,
        key_prefix: prefix,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) { toast.error(error.message); return; }
    setKeys([data, ...keys]);
    setCreatedKey(rawKey);
    setNewKeyName("");
    toast.success("API key created");
  };

  const deleteKey = async (id: string) => {
    await supabase.from("api_keys").delete().eq("id", id);
    setKeys(keys.filter((k) => k.id !== id));
    toast.success("API key deleted");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage API keys for programmatic access</p>
        </div>

        {createdKey && (
          <Card className="mb-6 border-success/50 bg-success/5">
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-2">Your new API key (copy it now — it won't be shown again):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-card border px-3 py-2 text-sm font-mono">{createdKey}</code>
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(createdKey); toast.success("Copied"); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setCreatedKey(null)}>Dismiss</Button>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Create API Key</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input placeholder="Key name (e.g. Production)" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
            <Button onClick={createKey} disabled={!newKeyName.trim()} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" /> Create
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {keys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No API keys yet</p>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{k.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{k.key_prefix}...</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteKey(k.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
