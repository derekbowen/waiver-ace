import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { AuditTrailCard } from "@/components/AuditTrailCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Send, XCircle, ExternalLink, Download, Loader2, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

export default function EnvelopeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [envelope, setEnvelope] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [groupSigs, setGroupSigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const fetchDetail = useCallback(async () => {
    const [envRes, eventsRes] = await Promise.all([
      supabase.from("envelopes").select("*").eq("id", id).single(),
      supabase.from("envelope_events").select("*").eq("envelope_id", id).order("created_at", { ascending: true }),
    ]);
    setEnvelope(envRes.data);
    setEvents(eventsRes.data || []);

    // Fetch group signatures if applicable
    if (envRes.data?.is_group_waiver) {
      const { data: sigs } = await supabase
        .from("group_signatures")
        .select("*")
        .eq("envelope_id", id!)
        .order("signed_at", { ascending: true });
      setGroupSigs(sigs || []);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Realtime: update when this envelope or its events change
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`envelope-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "envelopes", filter: `id=eq.${id}` },
        () => fetchDetail()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "envelope_events", filter: `envelope_id=eq.${id}` },
        () => fetchDetail()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_signatures", filter: `envelope_id=eq.${id}` },
        () => fetchDetail()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, fetchDetail]);

  const copySigningLink = () => {
    if (!envelope) return;
    const url = envelope.is_group_waiver
      ? `${window.location.origin}/waiver/${envelope.group_token}`
      : `${window.location.origin}/sign/${envelope.signing_token}`;
    navigator.clipboard.writeText(url);
    toast.success("Signing link copied");
  };

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf", {
        body: { envelope_id: id },
      });
      if (error) throw error;

      // data is already an ArrayBuffer or Blob
      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `waiver-${id?.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const resendEmail = async () => {
    setResending(true);
    try {
      const { error } = await supabase.functions.invoke("send-signing-email", {
        body: { envelope_id: id },
      });
      if (error) throw error;
      toast.success("Signing email resent");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend email");
    } finally {
      setResending(false);
    }
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
      // Notify signer
      supabase.functions.invoke("send-envelope-notification", {
        body: { envelope_id: id, event_type: "canceled" },
      }).catch((e) => console.error("Cancel notification failed:", e));
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
            {["completed", "signed"].includes(envelope.status) && (
              <>
                <Link to={`/envelopes/${id}/certificate`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-3 w-3" /> Certificate
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={downloadPdf} disabled={pdfLoading} className="gap-2">
                  {pdfLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Download PDF
                </Button>
              </>
            )}
            {["draft", "sent", "viewed"].includes(envelope.status) && (
              <>
                <Button variant="outline" size="sm" onClick={copySigningLink} className="gap-2">
                  <Copy className="h-3 w-3" /> Copy Link
                </Button>
                {!envelope.is_group_waiver && (
                  <Button variant="outline" size="sm" onClick={resendEmail} disabled={resending} className="gap-2">
                    {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Resend Email
                  </Button>
                )}
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

        {envelope.is_group_waiver && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Group Signatures ({groupSigs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupSigs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No one has signed yet. Share the link with your group.</p>
              ) : (
                <div className="space-y-3">
                  {groupSigs.map((sig) => (
                    <div key={sig.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{sig.signer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sig.signer_email || "No email provided"} · Signed {format(new Date(sig.signed_at), "PPpp")}
                        </p>
                      </div>
                      {(sig.signature_data as any)?.signature_image && (
                        <img src={(sig.signature_data as any).signature_image} alt="Signature" className="h-8 max-w-[120px] object-contain" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {["completed", "signed"].includes(envelope.status) && (
          <AuditTrailCard envelope={envelope} />
        )}

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
