import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination } from "@/components/Pagination";
import {
  FileCheck,
  Search,
  Download,
  Printer,
  Loader2,
  Users,
  ExternalLink,
  PenLine,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface SignedWaiver {
  id: string;
  signer_name: string | null;
  signer_email: string;
  status: string;
  booking_id: string | null;
  listing_id: string | null;
  created_at: string;
  signed_at: string | null;
  is_group_waiver: boolean;
  signature_data: any;
  payload: any;
  pdf_storage_key: string | null;
  templates?: { name: string | null } | null;
}

interface GroupSignature {
  id: string;
  signer_name: string;
  signer_email: string | null;
  initials: string | null;
  signature_data: any;
  signed_at: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

export default function SignedWaivers() {
  const { profile } = useAuth();
  const [waivers, setWaivers] = useState<SignedWaiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [selected, setSelected] = useState<SignedWaiver | null>(null);
  const [groupSigs, setGroupSigs] = useState<GroupSignature[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchWaivers = useCallback(async () => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("envelopes")
      .select(
        "id, signer_name, signer_email, status, booking_id, listing_id, created_at, signed_at, is_group_waiver, signature_data, payload, pdf_storage_key"
      )
      .eq("org_id", profile.org_id)
      .in("status", ["signed", "completed"])
      .order("signed_at", { ascending: false, nullsFirst: false });

    if (error) {
      toast.error("Could not load signed waivers");
      setWaivers([]);
    } else {
      setWaivers((data as SignedWaiver[]) || []);
    }
    setLoading(false);
  }, [profile?.org_id]);

  useEffect(() => {
    fetchWaivers();
  }, [fetchWaivers]);

  useEffect(() => {
    if (!profile?.org_id) return;
    const channel = supabase
      .channel("signed-waivers-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "envelopes", filter: `org_id=eq.${profile.org_id}` },
        () => fetchWaivers()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.org_id, fetchWaivers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
    return waivers.filter((w) => {
      const when = w.signed_at ? new Date(w.signed_at) : new Date(w.created_at);
      if (from && when < from) return false;
      if (to && when > to) return false;
      if (!term) return true;
      return (
        w.signer_email.toLowerCase().includes(term) ||
        (w.signer_name || "").toLowerCase().includes(term) ||
        (w.booking_id || "").toLowerCase().includes(term) ||
        (w.listing_id || "").toLowerCase().includes(term)
      );
    });
  }, [waivers, search, fromDate, toDate]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openWaiver = async (w: SignedWaiver) => {
    setSelected(w);
    setGroupSigs([]);
    if (w.is_group_waiver) {
      const { data } = await supabase
        .from("group_signatures")
        .select("id, signer_name, signer_email, initials, signature_data, signed_at")
        .eq("envelope_id", w.id)
        .order("signed_at", { ascending: true });
      setGroupSigs((data as GroupSignature[]) || []);
    }
  };

  const downloadPdf = async (w: SignedWaiver) => {
    setDownloadingId(w.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf", {
        body: { envelope_id: w.id },
      });
      if (error) throw error;
      const blob = data instanceof Blob ? data : new Blob([data as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (w.signer_name || w.signer_email).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      a.download = `signed-waiver-${safeName}-${w.id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err?.message || "Could not download this waiver");
    } finally {
      setDownloadingId(null);
    }
  };

  const printWaiver = (w: SignedWaiver, sigs: GroupSignature[]) => {
    const sig = w.signature_data || {};
    const rows: Array<[string, string]> = [
      ["Signer", w.signer_name || sig.full_name || "—"],
      ["Email", w.signer_email],
      ["Status", w.status],
      ["Signed on", w.signed_at ? format(new Date(w.signed_at), "PPpp") : "—"],
      ["Sent on", format(new Date(w.created_at), "PPpp")],
      ["Booking ID", w.booking_id || "—"],
      ["Listing ID", w.listing_id || "—"],
      ["Rental / effective date", w.payload?.rental_date || "—"],
      ["Minors covered", sig.minor_names || "—"],
      ["Record ID", w.id],
    ];

    const signatureBlock = sig.signature_image
      ? `<img class="sig" src="${escapeHtml(sig.signature_image)}" alt="Signature" />`
      : `<p class="muted">Typed signature: ${escapeHtml(sig.full_name || w.signer_name || "—")}</p>`;

    const groupBlock = sigs.length
      ? `<h2>Additional signers (${sigs.length})</h2>` +
        sigs
          .map(
            (g) => `<div class="group-row">
              <div><strong>${escapeHtml(g.signer_name)}</strong><br/><span class="muted">${escapeHtml(
              g.signer_email || ""
            )} · ${escapeHtml(format(new Date(g.signed_at), "PPpp"))}</span></div>
              ${
                g.signature_data?.signature_image
                  ? `<img class="sig-sm" src="${escapeHtml(g.signature_data.signature_image)}" alt="Signature" />`
                  : `<span class="muted">${escapeHtml(g.initials || "")}</span>`
              }
            </div>`
          )
          .join("")
      : "";

    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>Signed waiver — ${escapeHtml(w.signer_name || w.signer_email)}</title>
      <style>
        body { font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; color:#111; margin:40px; }
        h1 { font-size:20px; margin:0 0 4px; }
        h2 { font-size:15px; margin:28px 0 8px; }
        .muted { color:#666; font-size:12px; }
        table { width:100%; border-collapse:collapse; margin-top:18px; }
        td { padding:7px 0; border-bottom:1px solid #eee; font-size:13px; vertical-align:top; }
        td:first-child { color:#666; width:200px; }
        .sig { max-height:110px; max-width:340px; margin-top:8px; }
        .sig-sm { max-height:48px; max-width:180px; }
        .group-row { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:10px 0; border-bottom:1px solid #eee; font-size:13px; }
        .box { border:1px solid #ddd; border-radius:8px; padding:16px; margin-top:8px; }
      </style></head><body>
      <h1>Signed liability waiver</h1>
      <p class="muted">Record retained by ${escapeHtml(profile?.full_name ? "" : "")}Rental Waivers · printed ${escapeHtml(
      format(new Date(), "PPpp")
    )}</p>
      <table>${rows
        .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(String(v))}</td></tr>`)
        .join("")}</table>
      <h2>Signature</h2>
      <div class="box">${signatureBlock}
        <p class="muted" style="margin-top:10px">${escapeHtml(
          sig.consent_text || "Signer agreed to sign electronically."
        )}</p>
      </div>
      ${groupBlock}
      </body></html>`;

    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      toast.error("Allow pop-ups to print this waiver");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };

  const exportCsv = () => {
    const header = "Signer Name,Email,Status,Signed At,Booking ID,Listing ID,Record ID\n";
    const rows = filtered
      .map((w) =>
        [
          (w.signer_name || "").replace(/"/g, '""'),
          w.signer_email,
          w.status,
          w.signed_at ? format(new Date(w.signed_at), "yyyy-MM-dd HH:mm") : "",
          w.booking_id || "",
          w.listing_id || "",
          w.id,
        ]
          .map((v) => `"${v}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signed-waivers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} signed waivers`);
  };

  const selectedSig = selected?.signature_data || {};

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold">Signed Waivers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every completed waiver with its signature, dates and printable record
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" disabled={filtered.length === 0} onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export list (CSV)
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guest, email or booking ID..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-[160px]"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              className="w-[160px]"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No signed waivers yet</p>
              <Link to="/envelopes/new" className="text-sm text-primary mt-2 hover:underline">
                Send a waiver
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {paginated.map((w) => (
              <Card key={w.id} className="transition-colors hover:bg-accent/40">
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => openWaiver(w)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {w.is_group_waiver ? (
                        <Users className="h-5 w-5 text-primary" />
                      ) : (
                        <PenLine className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{w.signer_name || w.signer_email}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Signed{" "}
                        {w.signed_at ? format(new Date(w.signed_at), "MMM d, yyyy 'at' h:mm a") : "—"}
                        {w.booking_id ? ` · Booking ${w.booking_id}` : ""}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {w.signature_data?.signature_image && (
                      <img
                        src={w.signature_data.signature_image}
                        alt="Signature"
                        className="hidden h-8 max-w-[110px] object-contain sm:block"
                      />
                    )}
                    {w.is_group_waiver && <Badge variant="secondary">Group</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => openWaiver(w)} className="gap-1">
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadPdf(w)}
                      disabled={downloadingId === w.id}
                      className="gap-1"
                    >
                      {downloadingId === w.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => printWaiver(w, [])} className="gap-1">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.signer_name || selected?.signer_email}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="break-all">{selected.signer_email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Signed on</p>
                  <p>{selected.signed_at ? format(new Date(selected.signed_at), "PPpp") : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sent on</p>
                  <p>{format(new Date(selected.created_at), "PPpp")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rental / effective date</p>
                  <p>{selected.payload?.rental_date || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p>{selected.booking_id || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Minors covered</p>
                  <p>{selectedSig.minor_names || "—"}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted-foreground">Signature</p>
                <div className="rounded-lg border bg-muted/30 p-4">
                  {selectedSig.signature_image ? (
                    <img
                      src={selectedSig.signature_image}
                      alt="Signature"
                      className="max-h-28 object-contain"
                    />
                  ) : (
                    <p className="font-medium">{selectedSig.full_name || selected.signer_name || "—"}</p>
                  )}
                  {selectedSig.consent_text && (
                    <p className="mt-3 text-xs text-muted-foreground">{selectedSig.consent_text}</p>
                  )}
                </div>
              </div>

              {groupSigs.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Additional signers ({groupSigs.length})
                  </p>
                  <div className="divide-y rounded-lg border">
                    {groupSigs.map((g) => (
                      <div key={g.id} className="flex items-center justify-between gap-3 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{g.signer_name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {format(new Date(g.signed_at), "PPp")}
                          </p>
                        </div>
                        {g.signature_data?.signature_image ? (
                          <img
                            src={g.signature_data.signature_image}
                            alt="Signature"
                            className="h-8 max-w-[120px] object-contain"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">{g.initials}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => downloadPdf(selected)}
                  disabled={downloadingId === selected.id}
                  className="gap-2"
                >
                  {downloadingId === selected.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => printWaiver(selected, groupSigs)} className="gap-2">
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button variant="ghost" asChild className="gap-2">
                  <Link to={`/envelopes/${selected.id}`}>
                    <ExternalLink className="h-4 w-4" /> Full record
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
