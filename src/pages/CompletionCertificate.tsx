import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Printer, Shield, CheckCircle, Clock, Fingerprint, FileText, Globe, Monitor } from "lucide-react";
import { format } from "date-fns";

export default function CompletionCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [envelope, setEnvelope] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [org, setOrg] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [envRes, eventsRes] = await Promise.all([
        supabase.from("envelopes").select("*, template_versions(template_id, version, content)").eq("id", id).single(),
        supabase.from("envelope_events").select("*").eq("envelope_id", id).order("created_at", { ascending: true }),
      ]);

      if (!envRes.data) { setLoading(false); return; }
      setEnvelope(envRes.data);
      setEvents(eventsRes.data || []);

      // Fetch org and template name
      const [orgRes, templateRes] = await Promise.all([
        supabase.from("organizations").select("name").eq("id", envRes.data.org_id).single(),
        envRes.data.template_versions?.template_id
          ? supabase.from("templates").select("name").eq("id", envRes.data.template_versions.template_id).single()
          : Promise.resolve({ data: null }),
      ]);
      setOrg(orgRes.data);
      setTemplate(templateRes.data);
      setLoading(false);
    };
    load();
  }, [id]);

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

  const sig = (envelope.signature_data as Record<string, any>) || {};
  const snapshot = (envelope.content_snapshot as Record<string, any>) || {};
  const isCompleted = ["completed", "signed"].includes(envelope.status);

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/envelopes/${id}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold">Certificate of Completion</h1>
              <p className="text-sm text-muted-foreground mt-1">Legal evidence bundle for envelope {id?.slice(0, 8)}...</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.print()} className="gap-2 print:hidden">
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        {!isCompleted && (
          <Card className="mb-6 border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <p className="text-sm">This envelope has not been signed yet. The certificate will be complete once the signer submits their signature.</p>
            </CardContent>
          </Card>
        )}

        {/* Header block */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {isCompleted ? "Document Successfully Executed" : "Document Pending Execution"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {org?.name || "Organization"} · {template?.name || "Waiver Agreement"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="text-muted-foreground font-medium mb-1">Envelope ID</p>
                <p className="font-mono text-xs break-all">{envelope.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Status</p>
                <p className="font-medium capitalize">{envelope.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Created</p>
                <p>{format(new Date(envelope.created_at), "PPpp")}</p>
              </div>
              {envelope.signed_at && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Signed</p>
                  <p>{format(new Date(envelope.signed_at), "PPpp")}</p>
                </div>
              )}
              {envelope.expires_at && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Expires</p>
                  <p>{format(new Date(envelope.expires_at), "PPpp")}</p>
                </div>
              )}
              {envelope.template_versions?.version && (
                <div>
                  <p className="text-muted-foreground font-medium mb-1">Template Version</p>
                  <p>v{envelope.template_versions.version}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Signer identity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Fingerprint className="h-4 w-4" /> Signer Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="text-muted-foreground font-medium mb-1">Full Legal Name</p>
                <p className="font-medium">{sig.full_name || envelope.signer_name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Initials</p>
                <p className="font-medium">{sig.initials || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Email Address</p>
                <p>{envelope.signer_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Electronic Consent</p>
                <p className="flex items-center gap-1">
                  {sig.agreed_to_electronic_signing ? (
                    <><CheckCircle className="h-4 w-4 text-success" /> Consented to e-sign</>
                  ) : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">IP Address</p>
                <p className="font-mono">{envelope.ip_address || "Not captured"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Signing Timestamp (UTC)</p>
                <p className="font-mono text-xs">{sig.signed_at_utc || envelope.signed_at || "—"}</p>
              </div>
            </div>

            {/* Drawn signature */}
            {sig.signature_image && (
              <div className="mt-6">
                <p className="text-muted-foreground font-medium text-sm mb-2">Captured Signature</p>
                <div className="rounded-lg border bg-white p-4 inline-block">
                  <img src={sig.signature_image} alt="Signature" className="h-20" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device & environment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-4 w-4" /> Device & Environment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground font-medium mb-1">User Agent</p>
              <p className="font-mono text-xs break-all">{sig.user_agent || envelope.user_agent || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-1">Signing Token</p>
              <p className="font-mono text-xs break-all">{envelope.signing_token}</p>
            </div>
          </CardContent>
        </Card>

        {/* Document integrity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Document Integrity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {envelope.pdf_hash ? (
              <div>
                <p className="text-muted-foreground font-medium mb-1">PDF SHA-256 Hash</p>
                <p className="font-mono text-xs break-all">{envelope.pdf_hash}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">PDF not yet generated. Download the PDF from the envelope detail page to generate the hash.</p>
            )}
            {envelope.pdf_storage_key && (
              <div>
                <p className="text-muted-foreground font-medium mb-1">Storage Location</p>
                <p className="font-mono text-xs">{envelope.pdf_storage_key}</p>
              </div>
            )}
            {snapshot.snapshot_at && (
              <div>
                <p className="text-muted-foreground font-medium mb-1">Content Snapshot Captured</p>
                <p className="font-mono text-xs">{snapshot.snapshot_at}</p>
              </div>
            )}
            {snapshot.template_version_id && (
              <div>
                <p className="text-muted-foreground font-medium mb-1">Snapshot Template Version ID</p>
                <p className="font-mono text-xs break-all">{snapshot.template_version_id}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit trail */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Complete Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events recorded</p>
            ) : (
              <div className="space-y-0">
                {events.map((ev, i) => (
                  <div key={ev.id} className="flex items-start gap-4 py-3 border-b last:border-0">
                    <div className="flex flex-col items-center pt-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium">{ev.event_type}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                          {format(new Date(ev.created_at), "yyyy-MM-dd HH:mm:ss")} UTC
                        </p>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        {ev.ip_address && <span>IP: {ev.ip_address}</span>}
                        {ev.user_agent && <span className="truncate max-w-[300px]">UA: {ev.user_agent}</span>}
                        {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                          <span>Meta: {JSON.stringify(ev.metadata)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ESIGN Act compliance notice */}
        <Card className="mb-6 border-muted">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> Legal Compliance Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              This document was executed electronically in compliance with the United States Electronic
              Signatures in Global and National Commerce Act (ESIGN Act, 15 U.S.C. {"\u00A7"} 7001 et seq.)
              and the Uniform Electronic Transactions Act (UETA).
            </p>
            <p>
              The signer provided explicit consent to conduct this transaction electronically. The signer's
              identity was authenticated via email delivery to <strong>{envelope.signer_email}</strong>, and
              their intent to sign was confirmed through affirmative action (drawing a signature,
              typing their full legal name and initials, and checking an electronic consent checkbox).
            </p>
            <p>
              A complete audit trail of all events — including document creation, delivery, viewing, and
              signing — has been maintained with UTC timestamps
              {envelope.ip_address ? ", IP addresses" : ""}, and user agent strings. The signed document
              content was captured at the moment of signing and can be independently verified against
              the stored content snapshot.
            </p>
            {envelope.pdf_hash && (
              <p>
                The generated PDF has been hashed using SHA-256 for integrity verification. Any
                modification to the document after signing can be detected by comparing against
                the hash: <code className="text-xs">{envelope.pdf_hash.slice(0, 16)}...</code>
              </p>
            )}
            <p className="text-xs mt-4 pt-3 border-t">
              Certificate generated {format(new Date(), "PPpp")} · Powered by Rental Waivers (rentalwaivers.com)
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
