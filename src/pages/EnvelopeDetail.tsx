import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Send, XCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function EnvelopeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [envelope, setEnvelope] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [envRes, eventsRes] = await Promise.all([
        supabase.from("envelopes").select("*").eq("id", id).single(),
        supabase.from("envelope_events").select("*").eq("envelope_id", id).order("created_at", { ascending: true }),
      ]);
      setEnvelope(envRes.data);
      setEvents(eventsRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const copySigningLink = () => {
    if (!envelope) return;
    const url = `${window.location.origin}/sign/${envelope.signing_token}`;
    navigator.clipboard.writeText(url);
    toast.success("Signing link copied");
  };

  const cancelEnvelope = async () => {
    const { error } = await supabase
      .from("envelopes")
      .update({ status: "canceled" })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Envelope canceled");
      setEnvelope({ ...envelope, status: "canceled" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!envelope) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Envelope not found</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/envelopes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold">Envelope</h1>
              <StatusBadge status={envelope.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{envelope.id}</p>
          </div>
          <div className="flex gap-2">
            {["draft", "sent", "viewed"].includes(envelope.status) && (
              <>
                <Button variant="outline" size="sm" onClick={copySigningLink} className="gap-2">
                  <Copy className="h-3 w-3" /> Copy Link
                </Button>
                <Button variant="outline" size="sm" onClick={cancelEnvelope} className="gap-2 text-destructive">
                  <XCircle className="h-3 w-3" /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Signer Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{envelope.signer_name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{envelope.signer_email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IP Address</span><span className="font-mono">{envelope.ip_address || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Signed at</span><span>{envelope.signed_at ? format(new Date(envelope.signed_at), "PPpp") : "—"}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Booking Data</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-mono">{envelope.booking_id || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Listing ID</span><span className="font-mono">{envelope.listing_id || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Host ID</span><span className="font-mono">{envelope.host_id || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customer ID</span><span className="font-mono">{envelope.customer_id || "—"}</span></div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">Event Timeline</CardTitle></CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet</p>
            ) : (
              <div className="space-y-4">
                {events.map((ev, i) => (
                  <div key={ev.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      {i < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{ev.event_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ev.created_at), "PPpp")}
                        {ev.ip_address && ` · ${ev.ip_address}`}
                      </p>
                    </div>
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
