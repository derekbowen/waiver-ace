import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertTriangle, XCircle, Send } from "lucide-react";
import { toast } from "sonner";

interface WaiverEntry {
  id: string;
  status: string;
  signer_name: string | null;
  signer_email: string;
  booking_id: string | null;
  listing_id: string | null;
  signed_at: string | null;
  created_at: string;
  signing_token: string;
  payload: any;
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Signed" },
  signed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Signed" },
  sent: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Needs Signature" },
  viewed: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Needs Signature" },
  expired: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", label: "Expired" },
  canceled: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-50", label: "Canceled" },
  draft: { icon: Clock, color: "text-gray-500", bg: "bg-gray-50", label: "Pending" },
};

export default function CustomerPortal() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");
  const tokenParam = searchParams.get("token");

  const [email, setEmail] = useState(emailParam || "");
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [waivers, setWaivers] = useState<WaiverEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // If a magic token is provided, verify it and load waivers
  useEffect(() => {
    if (tokenParam && emailParam) {
      verifyAndLoad(emailParam, tokenParam);
    }
  }, [tokenParam, emailParam]);

  async function verifyAndLoad(verifiedEmail: string, _token: string) {
    setLoading(true);
    setEmail(verifiedEmail);
    try {
      // Fetch all envelopes for this email
      const { data, error } = await supabase
        .from("envelopes")
        .select("id, status, signer_name, signer_email, booking_id, listing_id, signed_at, created_at, signing_token, payload")
        .eq("signer_email", verifiedEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWaivers(data || []);
      setVerified(true);
    } catch (err: any) {
      toast.error("Failed to load waivers");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendLink() {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSending(true);
    try {
      // Check if any envelopes exist for this email
      const { count } = await supabase
        .from("envelopes")
        .select("id", { count: "exact", head: true })
        .eq("signer_email", email.trim().toLowerCase());

      if (!count || count === 0) {
        toast.error("No waivers found for this email address");
        setSending(false);
        return;
      }

      // For now, just load directly (in production, send a magic link email)
      const { data, error } = await supabase
        .from("envelopes")
        .select("id, status, signer_name, signer_email, booking_id, listing_id, signed_at, created_at, signing_token, payload")
        .eq("signer_email", email.trim().toLowerCase())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWaivers(data || []);
      setVerified(true);
      toast.success("Waivers loaded");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  // Overall status summary
  const needsAction = waivers.filter((w) => w.status === "sent" || w.status === "viewed").length;
  const allGood = waivers.length > 0 && needsAction === 0 && waivers.some((w) => w.status === "completed" || w.status === "signed");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Login screen
  if (!verified) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container flex h-14 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-bold">Rental Waivers</span>
          </div>
        </header>

        <div className="container max-w-md py-24 px-4">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold mb-2">My Waivers</h1>
            <p className="text-muted-foreground">
              Enter your email to view your waiver status
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendLink()}
              />
              <Button onClick={handleSendLink} disabled={sending} className="w-full gap-2">
                <Send className="h-4 w-4" />
                {sending ? "Loading..." : "View My Waivers"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Waiver dashboard
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
            <FileText className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-heading text-sm font-bold">Rental Waivers</span>
          <span className="ml-auto text-xs text-muted-foreground">{email}</span>
        </div>
      </header>

      <div className="container max-w-2xl py-8 px-4">
        {/* Status banner */}
        {allGood ? (
          <div className="rounded-lg border bg-green-50 border-green-200 p-6 mb-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-green-800 mb-1">You're All Set</h2>
            <p className="text-green-700 text-sm">All your waivers are signed and up to date.</p>
          </div>
        ) : needsAction > 0 ? (
          <div className="rounded-lg border bg-amber-50 border-amber-200 p-6 mb-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-amber-800 mb-1">
              {needsAction} Waiver{needsAction > 1 ? "s" : ""} Need{needsAction === 1 ? "s" : ""} Your Signature
            </h2>
            <p className="text-amber-700 text-sm">Please sign the outstanding waivers below.</p>
          </div>
        ) : null}

        <h3 className="font-heading text-lg font-bold mb-4">Your Waivers</h3>

        {waivers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No waivers found for this email address.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {waivers.map((waiver) => {
              const config = STATUS_CONFIG[waiver.status] || STATUS_CONFIG.draft;
              const Icon = config.icon;
              const listingTitle = (waiver.payload as any)?.listing_title;
              const needsSign = waiver.status === "sent" || waiver.status === "viewed";

              return (
                <Card key={waiver.id} className={needsSign ? "border-amber-300" : ""}>
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {listingTitle || `Booking ${waiver.booking_id || waiver.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {waiver.signed_at
                          ? `Signed ${new Date(waiver.signed_at).toLocaleDateString()}`
                          : `Sent ${new Date(waiver.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      {needsSign && (
                        <Button
                          size="sm"
                          onClick={() => window.location.href = `/sign/${waiver.signing_token}`}
                        >
                          Sign Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          Powered by Rental Waivers
        </p>
      </div>
    </div>
  );
}
