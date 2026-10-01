import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tablet, Play } from "lucide-react";

interface T { id: string; name: string }

export default function FrontDesk() {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }
    supabase.from("templates").select("id, name").eq("org_id", profile.org_id).eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setTemplates((data as T[]) || []); setLoading(false); });
  }, [profile?.org_id]);

  const launch = (id: string) => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    window.location.href = `/waiver/kiosk/${id}?frontdesk=1`;
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-3xl">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold">Front Desk Mode</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Turn an iPad or tablet into a waiver station. Guests tap, sign, and hand it back — it resets for the next guest automatically.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Tablet className="h-4 w-4" /> Setup tips</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>1. Open this page on the tablet and pick a waiver below.</p>
            <p>2. On iPad, turn on Guided Access (Settings → Accessibility) so guests can't leave the screen.</p>
            <p>3. Each signed waiver costs 1 credit, lands in Signed Waivers, and the guest gets an email copy.</p>
            <p>4. Guests' details are never remembered between signers.</p>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create an active waiver template first.</p>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <Card key={t.id}>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
                  <p className="font-medium truncate">{t.name}</p>
                  <Button onClick={() => launch(t.id)} className="gap-2">
                    <Play className="h-4 w-4" /> Start on this device
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
