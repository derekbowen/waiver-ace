import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { QrCode, Download, Monitor } from "lucide-react";

interface QrCodeDialogProps {
  templates: { id: string; name: string }[];
  orgId: string;
}

export function QrCodeDialog({ templates, orgId }: QrCodeDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [open, setOpen] = useState(false);

  // The QR links to a kiosk URL that creates envelopes on the fly
  const kioskUrl = selectedTemplate
    ? `${window.location.origin}/waiver/kiosk/${selectedTemplate}`
    : "";

  const downloadQr = () => {
    const svg = document.getElementById("kiosk-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 1024, 1024);
      const a = document.createElement("a");
      a.download = "kiosk-qr.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="h-4 w-4" /> Kiosk QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" /> Kiosk Mode QR Code
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter((t) => t.id).map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="rounded-xl border-2 border-border bg-white p-4">
                <QRCodeSVG
                  id="kiosk-qr-svg"
                  value={kioskUrl}
                  size={240}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-[280px]">
                Print this QR code and place it at your check-in desk. Guests scan it to sign the waiver on their phone.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadQr} className="gap-2">
                  <Download className="h-3 w-3" /> Download PNG
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.open(kioskUrl, "_blank")}
                  className="gap-2"
                >
                  <Monitor className="h-3 w-3" /> Preview
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
