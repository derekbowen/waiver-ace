import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Globe, Clock, Monitor, Hash } from "lucide-react";
import { format } from "date-fns";

interface AuditTrailCardProps {
  envelope: {
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    signed_at: string | null;
    created_at: string;
    pdf_hash: string | null;
    signature_data: any;
  };
}

export function AuditTrailCard({ envelope }: AuditTrailCardProps) {
  const sigData = (envelope.signature_data as Record<string, any>) || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" /> Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-mono text-xs">{format(new Date(envelope.created_at), "PPpp")}</p>
          </div>
        </div>

        {envelope.signed_at && (
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground">Signed</p>
              <p className="font-mono text-xs">{format(new Date(envelope.signed_at), "PPpp")}</p>
              {sigData.signed_at_utc && (
                <p className="font-mono text-xs text-muted-foreground">UTC: {sigData.signed_at_utc}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-muted-foreground">IP Address</p>
            <p className="font-mono text-xs">{envelope.ip_address || "Not recorded"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Monitor className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-muted-foreground">User Agent</p>
            <p className="font-mono text-xs break-all">
              {(sigData.user_agent || envelope.user_agent || "Not recorded").slice(0, 120)}
            </p>
          </div>
        </div>

        {envelope.pdf_hash && (
          <div className="flex items-start gap-3">
            <Hash className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground">PDF SHA-256</p>
              <p className="font-mono text-xs break-all">{envelope.pdf_hash}</p>
            </div>
          </div>
        )}

        {sigData.agreed_to_electronic_signing && (
          <div className="rounded-lg bg-success/10 border border-success/20 p-3">
            <p className="text-xs font-medium text-success">
              ✓ Signer consented to electronic signing
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
