import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useNoindex } from "@/hooks/useNoindex";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Smartphone, Download } from "lucide-react";
import { toast } from "sonner";

type Pass = {
  pass_code: string;
  guest_name: string;
  covered_names: string[];
  activity_name: string;
  org_name: string;
  valid_until: string | null;
  checked_in_at: string | null;
};

export default function CheckInPass() {
  useNoindex();
  const { code } = useParams();
  const [pass, setPass] = useState<Pass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!code) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc("get_check_in_pass", { p_code: code });
      const res = data as any;
      if (error || !res || res.error) {
        setPass(null);
      } else {
        setPass({ ...res, covered_names: Array.isArray(res.covered_names) ? res.covered_names : [] });
      }
      setLoading(false);
    };
    load();
  }, [code]);

  const verifyUrl = `${window.location.origin}/check-in?code=${encodeURIComponent(code || "")}`;

  const downloadPass = () => {
    const svg = document.getElementById("pass-qr-svg");
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 640, 720);
      ctx.drawImage(img, 40, 40, 560, 560);
      if (pass?.pass_code) {
        ctx.fillStyle = "#000000";
        ctx.font = "bold 48px monospace";
        ctx.textAlign = "center";
        ctx.fillText(pass.pass_code, 320, 672);
      }
      const link = document.createElement("a");
      link.download = `check-in-pass-${pass?.pass_code || "code"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Pass code saved to your photos");
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(serialized)));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm">
          <h1 className="font-heading text-2xl font-bold mb-2">Pass not found</h1>
          <p className="text-muted-foreground">
            This check-in pass link is not valid. Ask the business to resend your waiver confirmation.
          </p>
        </div>
      </div>
    );
  }

  const covered = pass.covered_names.filter(Boolean);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div
          id="pass-card"
          className="rounded-3xl bg-foreground p-6 text-background shadow-lg"
        >
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-heading text-lg font-bold truncate">
              {pass.org_name || "Check-in pass"}
            </span>
          </div>

          <p className="text-[11px] uppercase tracking-widest opacity-60">Activity</p>
          <p className="font-heading text-xl font-bold mb-4 break-words">{pass.activity_name}</p>

          {covered.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-widest opacity-60">
                Covered · {covered.length}
              </p>
              <p className="font-heading text-lg font-semibold mb-4 break-words">
                {covered.join(", ")}
              </p>
            </>
          )}

          {pass.valid_until && (
            <>
              <p className="text-[11px] uppercase tracking-widest opacity-60">Valid until</p>
              <p className="font-heading text-lg font-bold mb-5">
                {new Date(pass.valid_until).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </>
          )}

          <div className="rounded-2xl bg-background p-4 text-center">
            <QRCodeSVG id="pass-qr-svg" value={verifyUrl} size={200} level="M" includeMargin={false} className="mx-auto" />
            <p className="mt-3 font-mono text-sm tracking-widest text-foreground">{pass.pass_code}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-sm">Keep this on your phone</p>
              <p className="text-sm text-muted-foreground">
                On iPhone tap Share then "Add to Home Screen". On Android tap the menu then "Add to
                Home screen". Your pass opens instantly, no signing in.
              </p>
            </div>
          </div>
          <Button asChild className="w-full">
            <a
              href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/apple-wallet-pass?code=${encodeURIComponent(pass.pass_code)}`}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Add to Apple Wallet
            </a>
          </Button>
          <Button variant="outline" className="w-full" onClick={downloadPass}>
            <Download className="mr-2 h-4 w-4" />
            Save pass code as a photo
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Show this at check-in. Staff scan the code to confirm your signed waiver.
          {covered.length > 1 && " One pass covers everyone listed, minors included."}
        </p>
      </div>
    </div>
  );
}
