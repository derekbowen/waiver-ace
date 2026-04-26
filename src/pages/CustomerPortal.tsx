import { useEffect, useState } from "react";
import { useNoindex } from "@/hooks/useNoindex";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle, Clock, AlertTriangle, XCircle, Send, Mail, LogOut } from "lucide-react";
import { toast } from "sonner";
import { getRecognizedSigner, forgetSigner } from "@/lib/signer-recognition";

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
  org_name?: string | null;
  template_name?: string | null;
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
  useNoindex();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");
  const tokenParam = searchParams.get("token");

  const recognized = getRecognizedSigner();
  const [email, setEmail] = useState(emailParam || recognized?.email || "");
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [waivers, setWaivers] = useState<WaiverEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Watch auth state — when a signer logs in via magic link, load their waivers.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userEmail = session?.user?.email ?? null;
      setAuthedEmail(userEmail);
      if (userEmail) {
        loadAuthenticatedWaivers();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const userEmail = session?.user?.email ?? null;
      setAuthedEmail(userEmail);
      if (userEmail) loadAuthenticatedWaivers();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Token-verified deep link path (legacy behavior)
  useEffect(() => {
    if (tokenParam && emailParam) {
      verifyAndLoad(emailParam, tokenParam);
    }
  }, [tokenParam, emailParam]);

  async function verifyAndLoad(verifiedEmail: string, token: string) {
    setLoading(true);
    setEmail(verifiedEmail);
    try {
      const { data: tokenCheck, error: tokenError } = await supabase
        .from("envelopes")
        .select("id")
        .eq("signer_email", verifiedEmail)
        .eq("signing_token", token)
        .limit(1);

      if (tokenError) throw tokenError;
      if (!tokenCheck || tokenCheck.length === 0) {
        toast.error("Invalid or expired link. Please use the link from your email.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("envelopes")
        .select("id, status, signer_name, signer_email, booking_id, listing_id, signed_at, created_at, signing_token, payload")
        .eq("signer_email", verifiedEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWaivers(data || []);
      setVerified(true);
    } catch {
      toast.error("Failed to load waivers");
    } finally {
      setLoading(false);
    }
  }

  // Quick lookup (no auth) — preserves existing behavior; no signing tokens revealed.
  async function handleQuickLookup() {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSending(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { count } = await supabase
        .from("envelopes")
        .select("id", { count: "exact", head: true })
        .eq("signer_email", normalizedEmail);

      if (!count || count === 0) {
        toast.error("No waivers found for this email address");
        setSending(false);
        return;
      }

      const { data, error } = await supabase
        .from("envelopes")
        .select("id, status, signer_name, signer_email, booking_id, listing_id, signed_at, created_at, payload")
        .eq("signer_email", normalizedEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWaivers((data || []).map((w: any) => ({ ...w, signing_token: "" })));
      setVerified(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  // Magic-link / OTP sign-in for full history + the ability to continue pending waivers.
  async function handleMagicLink() {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/my-waivers`,
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast.success("Check your email for a sign-in link.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send sign-in link");
    } finally {
      setSending(false);
    }
  }

  async function loadAuthenticatedWaivers() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_signer_waivers_authenticated");
      if (error) throw error;
      const rows = (data || []) as any[];
      setWaivers(
        rows.map((r) => ({
          id: r.envelope_id,
          status: r.status,
          signer_name: r.signer_name,
          signer_email: r.signer_email,
          booking_id: r.booking_id,
          listing_id: r.listing_id,
          signed_at: r.signed_at,
          created_at: r.created_at,
          signing_token: r.signing_token || "",
          payload: r.payload,
          org_name: r.org_name,
          template_name: r.template_name,
        })),
      );
      setVerified(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to load your waivers");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    forgetSigner();
    setAuthedEmail(null);
    setVerified(false);
    setWaivers([]);
    setMagicLinkSent(false);
  }

  const needsAction = waivers.filter((w) => w.status === "sent" || w.status === "viewed").length;
  const allGood = waivers.length > 0 && needsAction === 0 && waivers.some((w) => w.status === "completed" || w.status === "signed");
  const isAuthenticated = !!authedEmail;
  const isTokenVerified = !!(tokenParam && emailParam);
  const canSignFromHere = isAuthenticated || isTokenVerified;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Sign-in screen
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

        <div className="container max-w-md py-16 px-4">
          <div className="text-center mb-6">
            <h1 className="font-heading text-2xl font-bold mb-2">My Waivers</h1>
            <p className="text-muted-foreground text-sm">
              {recognized
                ? `Welcome back, ${recognized.name.split(" ")[0]}.`
                : "Sign in to see and continue any pending waivers."}
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="quick">Quick view</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {magicLinkSent ? (
                    <div className="text-center py-6 space-y-2">
                      <Mail className="h-10 w-10 mx-auto text-primary" />
                      <p className="text-sm">
                        We sent a sign-in link to <strong>{email}</strong>.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Open the link on this device to view all your waivers and continue any pending ones.
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => setMagicLinkSent(false)}>
                        Use a different email
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">
                        We'll email you a one-click link. No password needed.
                      </p>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                      />
                      <Button onClick={handleMagicLink} disabled={sending} className="w-full gap-2">
                        <Mail className="h-4 w-4" />
                        {sending ? "Sending..." : "Email me a sign-in link"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quick">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    See a read-only summary of waivers tied to your email. To continue a pending waiver, sign in instead.
                  </p>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickLookup()}
                  />
                  <Button onClick={handleQuickLookup} disabled={sending} variant="outline" className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    {sending ? "Loading..." : "View waiver status"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
          <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">
            {authedEmail || email}
          </span>
          {isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          )}
        </div>
      </header>

      <div className="container max-w-2xl py-8 px-4">
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
            <p className="text-amber-700 text-sm">
              {canSignFromHere
                ? "Tap Sign Now to continue any pending waiver below."
                : "Sign in to continue these without digging through your email."}
            </p>
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
              const canSign = needsSign && canSignFromHere && !!waiver.signing_token;

              return (
                <Card key={waiver.id} className={needsSign ? "border-amber-300" : ""}>
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {listingTitle || waiver.template_name || `Booking ${waiver.booking_id || waiver.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {waiver.org_name ? `${waiver.org_name} · ` : ""}
                        {waiver.signed_at
                          ? `Signed ${new Date(waiver.signed_at).toLocaleDateString()}`
                          : `Sent ${new Date(waiver.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      {canSign && (
                        <Button
                          size="sm"
                          onClick={() => (window.location.href = `/sign/${waiver.signing_token}`)}
                        >
                          Sign Now
                        </Button>
                      )}
                      {needsSign && !canSign && (
                        <span className="text-xs text-muted-foreground">Sign in to continue</span>
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
