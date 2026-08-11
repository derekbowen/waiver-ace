import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Video, Eye, Code2 } from "lucide-react";

const SAMPLE_VALUES: Record<string, string> = {
  customer_name: "Jordan Miller",
  booking_id: "BK-48213",
  listing_id: "LST-1092",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  time: "2:00 PM",
  host_name: "Your Business",
  address_redacted: "123 Main St, Miami, FL",
  rules: "No diving, no glass containers, children must be supervised at all times.",
  state: "Florida",
  rental_date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  minor_names: "Emma Miller (age 8), Liam Miller (age 5)",
};

export function fillSampleValues(content: string): string {
  let out = content || "";
  Object.entries(SAMPLE_VALUES).forEach(([key, value]) => {
    out = out.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), value);
  });
  // Anything left over that we don't have sample data for
  return out.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_m, name) => `[${String(name).replace(/_/g, " ")}]`);
}

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name?: string;
  content: string;
  requirePhoto?: boolean;
  requireVideo?: boolean;
  videoUrl?: string;
}

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  name,
  content,
  requirePhoto,
  requireVideo,
  videoUrl,
}: TemplatePreviewDialogProps) {
  const [showRaw, setShowRaw] = useState(false);
  const rendered = useMemo(() => fillSampleValues(content), [content]);
  const hasMinors = /\{\{\s*minor_names\s*\}\}/.test(content || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{name?.trim() || "Waiver Preview"}</DialogTitle>
          <DialogDescription>
            Exactly how signers will see this waiver. Placeholders are shown filled with sample data.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {requirePhoto && (
              <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
                <Camera className="h-3 w-3" /> Selfie required
              </span>
            )}
            {requireVideo && (
              <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
                <Video className="h-3 w-3" /> Safety video required{videoUrl ? "" : " (no URL set)"}
              </span>
            )}
            {hasMinors && (
              <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
                Minors section detected
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => setShowRaw((v) => !v)}>
            {showRaw ? <Eye className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
            {showRaw ? "Sample data" : "Raw placeholders"}
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="max-h-[55vh] overflow-y-auto p-6 text-sm leading-relaxed whitespace-pre-wrap">
              {showRaw ? content || "No waiver content yet." : rendered || "No waiver content yet."}
            </div>
          </CardContent>
        </Card>

        {!hasMinors && (
          <p className="text-xs text-muted-foreground">
            Tip: add <code className="font-mono">{"{{minor_names}}"}</code> to list children signed for by their guardian.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
