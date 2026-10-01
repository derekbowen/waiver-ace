import { useEffect, useState } from "react";
import { useNoindex } from "@/hooks/useNoindex";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ClipboardSignature } from "lucide-react";
import { toast } from "sonner";

/**
 * Kiosk page: guests scan a QR code (or use a front-desk tablet) and a waiver
 * is auto-created for signing on the spot. Works without authentication.
 * `?frontdesk=1` = shared tablet mode: big tap target, returns here after signing.
 */
export default function KioskPage() {
  useNoindex();
  const { templateId, code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const frontDesk = searchParams.get("frontdesk") === "1";
  const [templateName, setTemplateName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const identity = code ? { qr_code: code } : { template_id: templateId };

  useEffect(() => {
    if (!templateId && !code) return;
    supabase.functions
      .invoke("waiverflow-api", { body: { action: "kiosk_info", ...identity } })
      .then(({ data, error: err }) => {
        if (err || !data?.template_name) {
          setError(data?.error || "This waiver link isn't available. Please ask the host for a new QR code.");
        } else {
          setTemplateName(data.template_name);
          setOrgName(data.org_name || "");
          setLocationNote(data.location_note || "");
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, code]);

  const handleStart = async () => {
    setCreating(true);
    try {
      const { data, error: err } = await supabase.functions.invoke("waiverflow-api", {
        body: { action: "kiosk_create", ...identity },
      });
      if (err || !data?.signing_token) throw new Error(data?.error || "Failed to create waiver");
      const back = frontDesk ? `?frontdesk=${encodeURIComponent(location.pathname + location.search)}` : "";
      navigate(`/sign/${data.signing_token}${back}`);
    } catch (err: any) {
      toast.error(err.message);
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (frontDesk) {
    return (
      <button
        type="button"
        onClick={handleStart}
        disabled={creating}
        className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-8 text-center select-none"
      >
        {orgName && <p className="text-lg text-muted-foreground mb-3">{orgName}</p>}
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">Welcome!</h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-xl">
          Please sign the <span className="font-semibold text-foreground">{templateName}</span> before you begin.
        </p>
        <span className="inline-flex items-center gap-3 rounded-2xl bg-primary px-12 py-6 text-2xl font-semibold text-primary-foreground shadow-lg">
          {creating ? <Loader2 className="h-7 w-7 animate-spin" /> : <ClipboardSignature className="h-7 w-7" />}
          {creating ? "Preparing..." : "Tap to start"}
        </span>
        {locationNote && <p className="mt-10 text-sm text-muted-foreground">{locationNote}</p>}
      </button>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {orgName && <p className="text-sm text-muted-foreground mb-1">{orgName}</p>}
          <CardTitle className="text-xl">{templateName}</CardTitle>
          {locationNote && <p className="text-xs text-muted-foreground mt-1">{locationNote}</p>}
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            Please tap the button below to read and sign the waiver.
          </p>
          <Button onClick={handleStart} disabled={creating} className="w-full gap-2" size="lg">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardSignature className="h-4 w-4" />}
            {creating ? "Preparing..." : "Start Signing"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By proceeding you agree to sign this waiver electronically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
