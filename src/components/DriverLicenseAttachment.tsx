import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileCheck } from "lucide-react";
import { toast } from "sonner";
export function DriverLicenseAttachment({ envelopeId, storageKey }: { envelopeId: string; storageKey?: string }) {
  if (!storageKey) return null;
  const view = async () => {
    const { data, error } = await supabase.functions.invoke("driver-license", { body: { envelope_id: envelopeId, storage_key: storageKey } });
    if (error || !data?.url) { toast.error(data?.error || "Only authorized organization admins can view this license."); return; }
    window.open(data.url, "_blank", "noopener,noreferrer");
  };
  return <Button variant="outline" size="sm" onClick={view} className="gap-2"><FileCheck className="h-4 w-4" /> View driver's license</Button>;
}