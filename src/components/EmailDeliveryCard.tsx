import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { format } from "date-fns";

const EMAIL_EVENTS = ["email_sent", "email_retry", "email_failed"];

interface EmailDeliveryCardProps {
  events: any[];
  signerEmail?: string | null;
  resending: boolean;
  onResend: () => void;
  canResend: boolean;
}

export function EmailDeliveryCard({ events, signerEmail, resending, onResend, canResend }: EmailDeliveryCardProps) {
  const emailEvents = (events || [])
    .filter((e) => EMAIL_EVENTS.includes(e.event_type))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const latest = emailEvents[0];
  const failed = latest?.event_type === "email_failed";
  const retries = emailEvents.filter((e) => e.event_type === "email_retry").length;

  return (
    <Card className={failed ? "border-destructive/50" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Email delivery</CardTitle>
        {canResend && (
          <Button size="sm" variant={failed ? "default" : "outline"} onClick={onResend} disabled={resending} className="gap-2">
            {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : failed ? <RotateCcw className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
            {failed ? "Retry send" : "Resend email"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {failed ? (
            <>
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Delivery failed{signerEmail ? ` to ${signerEmail}` : ""}</span>
            </>
          ) : latest?.event_type === "email_sent" ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Delivered{signerEmail ? ` to ${signerEmail}` : ""}</span>
            </>
          ) : (
            <span className="text-muted-foreground">No delivery attempts recorded yet.</span>
          )}
        </div>

        {failed && latest?.metadata?.error && (
          <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive break-words">
            {String(latest.metadata.error)}
          </p>
        )}

        {retries > 0 && (
          <Badge variant="secondary" className="text-xs">
            {retries} automatic {retries === 1 ? "retry" : "retries"}
          </Badge>
        )}

        {emailEvents.length > 0 && (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {emailEvents.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3">
                <span>
                  {e.event_type === "email_sent" && "Sent"}
                  {e.event_type === "email_retry" && `Retry attempt ${e.metadata?.attempt ?? ""}`}
                  {e.event_type === "email_failed" && "Failed"}
                </span>
                <span className="font-mono">{format(new Date(e.created_at), "MMM d, HH:mm:ss")}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
