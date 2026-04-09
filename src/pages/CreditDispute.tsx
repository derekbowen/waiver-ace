import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

const REASONS = [
  { value: "wrong_charge", label: "Charged for something I didn't use" },
  { value: "duplicate", label: "Duplicate charge" },
  { value: "failed_waiver", label: "Waiver failed / didn't complete" },
  { value: "test_usage", label: "Was just testing the platform" },
  { value: "other", label: "Other" },
];

export default function CreditDispute() {
  const { user, refreshWallet } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [credits, setCredits] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; credits_granted?: number; remaining?: number } | null>(null);

  // Fetch past disputes to show remaining
  const { data: pastDisputes } = useQuery({
    queryKey: ["credit-disputes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("credit_disputes" as any)
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });

  const disputesUsed = pastDisputes?.length ?? 0;
  const limitReached = disputesUsed >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || limitReached) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-credit-dispute", {
        body: {
          reason,
          details,
          credits_requested: parseInt(credits) || 10,
        },
      });

      if (error || data?.error) {
        toast.error(data?.error || "Failed to submit dispute");
        if (data?.limit_reached) {
          setResult({ success: false });
        }
      } else {
        setResult({
          success: true,
          credits_granted: data.credits_granted,
          remaining: data.remaining_disputes,
        });
        toast.success(`${data.credits_granted} credits have been refunded!`);
        refreshWallet();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credit Dispute</h1>
          <p className="text-muted-foreground">
            Request an automatic credit reimbursement (up to 50 credits, max 2 times).
          </p>
        </div>

        {/* Status banner */}
        {limitReached && !result && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm">
                You've used both automatic reimbursements. Please contact{" "}
                <a href="mailto:hello@rentalwaivers.com" className="underline font-medium">
                  hello@rentalwaivers.com
                </a>{" "}
                for further assistance.
              </p>
            </CardContent>
          </Card>
        )}

        {result?.success ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10">
              <CheckCircle2 className="h-12 w-12 text-[hsl(var(--success))]" />
              <h2 className="text-xl font-semibold">Reimbursement Approved</h2>
              <p className="text-muted-foreground text-center">
                <span className="font-bold text-foreground">{result.credits_granted} credits</span> have been added to your account.
                {result.remaining !== undefined && result.remaining > 0 && (
                  <> You have {result.remaining} automatic reimbursement{result.remaining === 1 ? "" : "s"} remaining.</>
                )}
                {result.remaining === 0 && (
                  <> This was your last automatic reimbursement.</>
                )}
              </p>
              <Button onClick={() => navigate("/pricing")} variant="outline">
                Back to Pricing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit a Credit Dispute</CardTitle>
              <CardDescription>
                Tell us what happened and we'll automatically refund your credits.
                {!limitReached && (
                  <span className="block mt-1 text-xs">
                    {2 - disputesUsed} of 2 automatic reimbursements remaining.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select value={reason} onValueChange={setReason} required>
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Details (optional)</Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Tell us more about what happened..."
                    maxLength={1000}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credits">Credits to reimburse (max 50)</Label>
                  <Input
                    id="credits"
                    type="number"
                    min={1}
                    max={50}
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Maximum 50 credits per reimbursement
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={!reason || submitting || limitReached}
                  className="w-full"
                >
                  {submitting ? "Processing..." : "Submit & Get Credits Back"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Past disputes */}
        {pastDisputes && pastDisputes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Past Reimbursements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastDisputes.map((d: any) => (
                  <div key={d.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{REASONS.find((r) => r.value === d.reason)?.label || d.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-[hsl(var(--success))]">
                      +{d.credits_granted} credits
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
