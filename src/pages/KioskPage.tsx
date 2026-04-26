import { useEffect, useState } from "react";
import { useNoindex } from "@/hooks/useNoindex";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ClipboardSignature } from "lucide-react";
import { toast } from "sonner";

/**
 * Kiosk page: guests scan a QR code, enter their name/email,
 * and a group envelope is auto-created for signing on the spot.
 * Works without authentication — uses the template ID from the URL.
 */
export default function KioskPage() {
  useNoindex();
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // We need to look up the template + org via an edge function since this is a public page
  useEffect(() => {
    if (!templateId) return;
    // Use the public waiverflow-api to get template info
    supabase.functions
      .invoke("waiverflow-api", {
        body: { action: "kiosk_info", template_id: templateId },
      })
      .then(({ data, error: err }) => {
        if (err || !data?.template_name) {
          setError("Template not found or not available for kiosk mode.");
        } else {
          setTemplateName(data.template_name);
          setOrgName(data.org_name || "");
        }
        setLoading(false);
      });
  }, [templateId]);

  const handleStart = async () => {
    setCreating(true);
    try {
      const { data, error: err } = await supabase.functions.invoke("waiverflow-api", {
        body: { action: "kiosk_create", template_id: templateId },
      });

      if (err || !data?.signing_token) {
        throw new Error(data?.error || "Failed to create waiver");
      }

      // Navigate to the signing page
      navigate(`/sign/${data.signing_token}`);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {orgName && (
            <p className="text-sm text-muted-foreground mb-1">{orgName}</p>
          )}
          <CardTitle className="text-xl">{templateName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            Please tap the button below to read and sign the waiver.
          </p>
          <Button
            onClick={handleStart}
            disabled={creating}
            className="w-full gap-2"
            size="lg"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ClipboardSignature className="h-4 w-4" />
            )}
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
