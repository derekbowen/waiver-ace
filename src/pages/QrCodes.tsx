import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QrCode,
  Printer,
  Download,
  Loader2,
  Plus,
  ExternalLink,
  Power,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const QR_SIGN_CREDIT_COST = 5;

interface QrRow {
  id: string;
  code: string;
  label: string;
  location_note: string | null;
  template_id: string;
  is_active: boolean;
  scan_count: number;
  last_scanned_at: string | null;
  created_at: string;
}

interface TemplateRow {
  id: string;
  name: string;
  is_active: boolean;
}

const signUrl = (code: string) => `${window.location.origin}/waiver/qr/${code}`;

export default function QrCodes() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<QrRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [label, setLabel] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [creating, setCreating] = useState(false);

  const [printing, setPrinting] = useState<QrRow | null>(null);

  const load = useCallback(async () => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }
    const [{ data: qrs }, { data: tpls }] = await Promise.all([
      supabase
        .from("qr_codes")
        .select("id, code, label, location_note, template_id, is_active, scan_count, last_scanned_at, created_at")
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("templates")
        .select("id, name, is_active")
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: false }),
    ]);
    setRows((qrs as QrRow[]) || []);
    setTemplates((tpls as TemplateRow[]) || []);
    setLoading(false);
  }, [profile?.org_id]);

  useEffect(() => {
    load();
  }, [load]);

  const templateName = (id: string) =>
    templates.find((t) => t.id === id)?.name || "Waiver";

  const handleCreate = async () => {
    if (!templateId) {
      toast.error("Choose which waiver this QR code should open");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-qr-code", {
        body: {
          template_id: templateId,
          label: label.trim() || templateName(templateId),
          location_note: locationNote.trim(),
        },
      });
      if (error) {
        // Edge function errors carry the useful message in the response body.
        const msg = (data as any)?.error || error.message;
        throw new Error(msg);
      }
      if ((data as any)?.error) throw new Error((data as any).error);

      toast.success(`QR code created — ${QR_SIGN_CREDIT_COST} credits used`);
      setCreateOpen(false);
      setLabel("");
      setLocationNote("");
      setTemplateId("");
      await load();
      const created = (data as any)?.qr_code;
      if (created) setPrinting({ ...created, is_active: true, scan_count: 0, last_scanned_at: null });
    } catch (err: any) {
      toast.error(err.message || "Could not create the QR code");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (row: QrRow) => {
    const { error } = await supabase
      .from("qr_codes")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(row.is_active ? "QR code turned off" : "QR code turned back on");
    load();
  };

  const downloadPng = (row: QrRow) => {
    const svg = document.getElementById(`qr-svg-${row.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1200, 1200);
        ctx.drawImage(img, 0, 0, 1200, 1200);
      }
      const a = document.createElement("a");
      a.download = `waiver-qr-${row.code}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const printQrSign = () => {
    const printingClass = "printing-qr-sign";
    const cleanup = () => document.body.classList.remove(printingClass);

    document.body.classList.add(printingClass);
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 no-print">
          <div>
            <h1 className="font-heading text-2xl font-bold">QR Codes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Print a sign, stick it on your equipment, guests scan and sign on their phone.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New QR code ({QR_SIGN_CREDIT_COST} credits)
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <QrCode className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-1">No QR codes yet</p>
              <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                Each QR code is unique and permanently linked to one waiver and to your account.
                One-time cost: {QR_SIGN_CREDIT_COST} credits.
              </p>
              <Button variant="outline" className="gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Create your first QR code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {rows.map((row) => (
              <Card key={row.id}>
                <CardContent className="flex gap-4 py-5">
                  <div className="rounded-lg border bg-white p-2 shrink-0">
                    <QRCodeSVG
                      id={`qr-svg-${row.id}`}
                      value={signUrl(row.code)}
                      size={96}
                      level="H"
                      includeMargin
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{row.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {templateName(row.template_id)}
                      {row.location_note ? ` · ${row.location_note}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Code {row.code} · {row.scan_count} scan{row.scan_count === 1 ? "" : "s"}
                      {row.last_scanned_at
                        ? ` · last ${format(new Date(row.last_scanned_at), "MMM d, yyyy")}`
                        : ""}
                    </p>
                    {!row.is_active && (
                      <p className="text-xs text-destructive mt-1">Turned off — scans won't open</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" className="h-8 gap-1.5" onClick={() => setPrinting(row)}>
                        <Printer className="h-3.5 w-3.5" /> Print sign
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5"
                        onClick={() => downloadPng(row)}
                      >
                        <Download className="h-3.5 w-3.5" /> PNG
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5"
                        onClick={() => window.open(signUrl(row.code), "_blank")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Test
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5"
                        onClick={() => toggleActive(row)}
                      >
                        <Power className="h-3.5 w-3.5" /> {row.is_active ? "Turn off" : "Turn on"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New QR code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Waiver</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a waiver" />
                </SelectTrigger>
                <SelectContent>
                  {templates
                    .filter((t) => t.id && t.is_active)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sign name</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Kayak #4"
              />
            </div>
            <div className="space-y-2">
              <Label>Where it's posted (optional)</Label>
              <Input
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="Main dock"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              One-time cost: {QR_SIGN_CREDIT_COST} credits. The code never expires and each waiver
              signed through it costs the usual per-waiver credit.
            </p>
            <Button className="w-full gap-2" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              {creating ? "Creating..." : `Create for ${QR_SIGN_CREDIT_COST} credits`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Printable sign */}
      <Dialog open={!!printing} onOpenChange={(o) => !o && setPrinting(null)}>
        <DialogContent className="sm:max-w-lg print-sheet">
          <DialogHeader className="no-print">
            <DialogTitle>Printable sign</DialogTitle>
          </DialogHeader>
          {printing && (
            <>
              <div
                id="qr-print-area"
                className="rounded-xl border-2 border-black bg-white text-black px-6 py-8 text-center"
              >
                <p className="text-sm font-semibold tracking-widest uppercase">
                  Sign your waiver
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-tight">
                  {printing.label}
                </h2>
                <p className="text-sm mt-1">{templateName(printing.template_id)}</p>

                <div className="my-6 flex justify-center">
                  <QRCodeSVG
                    value={signUrl(printing.code)}
                    size={260}
                    level="H"
                    includeMargin
                  />
                </div>

                <ol className="text-left text-sm mx-auto max-w-xs space-y-1">
                  <li>1. Open the camera on your phone</li>
                  <li>2. Point it at this code and tap the link</li>
                  <li>3. Read and sign — takes under a minute</li>
                </ol>

                <p className="text-xs mt-6 break-all">{signUrl(printing.code)}</p>
                <p className="text-[10px] mt-2 uppercase tracking-wider">
                  Code {printing.code}
                </p>
              </div>
              <div className="flex gap-2 no-print">
                <Button className="flex-1 gap-2" onClick={printQrSign}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => window.open(signUrl(printing.code), "_blank")}
                >
                  <ExternalLink className="h-4 w-4" /> Test the link
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
