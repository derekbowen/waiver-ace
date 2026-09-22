import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Bot, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

type AgentKey = {
  id: string;
  name: string;
  key_prefix: string;
  access: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
};

const MCP_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mcp-key`;

async function sha256Hex(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function AgentKeys() {
  const { profile } = useAuth();
  const [keys, setKeys] = useState<AgentKey[]>([]);
  const [name, setName] = useState("");
  const [access, setAccess] = useState<"read" | "full">("read");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }
    supabase
      .from("agent_keys")
      .select("id,name,key_prefix,access,is_active,last_used_at,created_at")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setKeys(data ?? []);
        setLoading(false);
      });
  }, [profile?.org_id]);

  const copy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied");
  };

  const createKey = async () => {
    if (!profile?.org_id || !name.trim()) return;
    setCreating(true);
    const raw = `rwa_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("agent_keys")
      .insert({
        org_id: profile.org_id,
        name: name.trim(),
        key_hash: await sha256Hex(raw),
        key_prefix: raw.slice(0, 12),
        access,
        created_by: userData.user?.id,
      })
      .select("id,name,key_prefix,access,is_active,last_used_at,created_at")
      .single();
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setKeys([data, ...keys]);
    setCreatedKey(raw);
    setName("");
    toast.success("Agent key created");
  };

  const toggleActive = async (key: AgentKey) => {
    const { error } = await supabase
      .from("agent_keys")
      .update({ is_active: !key.is_active })
      .eq("id", key.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setKeys(keys.map((k) => (k.id === key.id ? { ...k, is_active: !k.is_active } : k)));
  };

  const changeAccess = async (key: AgentKey, next: "read" | "full") => {
    const { error } = await supabase.from("agent_keys").update({ access: next }).eq("id", key.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setKeys(keys.map((k) => (k.id === key.id ? { ...k, access: next } : k)));
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from("agent_keys").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setKeys(keys.filter((k) => k.id !== id));
    toast.success("Agent key deleted");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-3xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">Agent Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create keys so AI assistants can check waivers and send them for you. Revoke a key anytime.
          </p>
        </div>

        {createdKey && (
          <Card className="mb-6 border-success/50 bg-success/5">
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-2">
                Your new agent key — copy it now, it won't be shown again:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded bg-card border px-3 py-2 text-sm font-mono">
                  {createdKey}
                </code>
                <Button variant="outline" size="icon" onClick={() => copy(createdKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setCreatedKey(null)}>
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Create agent key</CardTitle>
            <CardDescription>Name it after the assistant or tool that will use it.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Name</Label>
              <Input
                id="agent-name"
                placeholder="e.g. Claude assistant"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Access</Label>
              <Select value={access} onValueChange={(v) => setAccess(v as "read" | "full")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read-only</SelectItem>
                  <SelectItem value="full">Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createKey} disabled={!name.trim() || creating} className="gap-2">
              <Plus className="h-4 w-4" /> Create
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Agent keys</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : keys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No agent keys yet</p>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium truncate">{k.name}</p>
                        <Badge variant={k.is_active ? "secondary" : "outline"}>
                          {k.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{k.key_prefix}…</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {k.last_used_at
                          ? `Last used ${new Date(k.last_used_at).toLocaleString()}`
                          : "Never used"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={k.access}
                        onValueChange={(v) => changeAccess(k, v as "read" | "full")}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">Read-only</SelectItem>
                          <SelectItem value="full">Full access</SelectItem>
                        </SelectContent>
                      </Select>
                      <Switch checked={k.is_active} onCheckedChange={() => toggleActive(k)} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteKey(k.id)}
                        className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to connect an assistant</CardTitle>
            <CardDescription>
              Paste this address and your key into the assistant's connection settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-muted px-3 py-2 text-xs font-mono">
                {MCP_URL}
              </code>
              <Button variant="outline" size="icon" onClick={() => copy(MCP_URL)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Send the key as the <span className="font-mono">Authorization: Bearer</span> header.
              Read-only keys can check credits, templates and waiver status. Full access keys can also
              send waivers, which spends credits.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
