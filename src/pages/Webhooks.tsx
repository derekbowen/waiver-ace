import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Webhook } from "lucide-react";
import { toast } from "sonner";

const eventTypes = [
  "envelope.sent",
  "envelope.viewed",
  "envelope.signed",
  "envelope.completed",
  "envelope.expired",
];

export default function Webhooks() {
  const { profile } = useAuth();
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(eventTypes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }
    supabase
      .from("webhook_endpoints")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => { if (!error) setEndpoints(data || []); setLoading(false); });
  }, [profile?.org_id]);

  const createEndpoint = async () => {
    if (!profile?.org_id || !url.trim()) return;
    const secret = `whsec_${crypto.randomUUID().replace(/-/g, "")}`;
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    const secretHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const { data, error } = await supabase
      .from("webhook_endpoints")
      .insert({
        org_id: profile.org_id,
        url: url.trim(),
        secret: secretHash,
        events: selectedEvents,
      })
      .select()
      .single();

    if (error) { toast.error(error.message); return; }
    setEndpoints([data, ...endpoints]);
    setUrl("");
    toast.success(`Webhook created. Secret: ${secret} (save it now — it won't be shown again)`);
  };

  const deleteEndpoint = async (id: string) => {
    const { error } = await supabase.from("webhook_endpoints").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEndpoints(endpoints.filter((e) => e.id !== id));
    toast.success("Webhook deleted");
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure webhook endpoints for real-time notifications</p>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Add Endpoint</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-app.com/webhooks/rentalwaivers" />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2">
                {eventTypes.map((ev) => (
                  <div key={ev} className="flex items-center gap-2">
                    <Checkbox id={ev} checked={selectedEvents.includes(ev)} onCheckedChange={() => toggleEvent(ev)} />
                    <Label htmlFor={ev} className="text-sm font-mono cursor-pointer">{ev}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={createEndpoint} disabled={!url.trim()} className="gap-2">
              <Plus className="h-4 w-4" /> Add Webhook
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Active Endpoints</CardTitle></CardHeader>
          <CardContent>
            {endpoints.length === 0 ? (
              <p className="text-sm text-muted-foreground">No webhook endpoints</p>
            ) : (
              <div className="space-y-3">
                {endpoints.map((ep) => (
                  <div key={ep.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-mono">{ep.url}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Events: {(ep.events as string[])?.join(", ")}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteEndpoint(ep.id)} className="text-destructive">
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
