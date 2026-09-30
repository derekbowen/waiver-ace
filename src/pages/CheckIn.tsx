import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, ScanLine } from "lucide-react";

type Result = {
  valid: boolean;
  reason?: string;
  pass_code?: string;
  guest_name?: string;
  covered_names?: string[];
  activity_name?: string;
  valid_until?: string;
  check_in_count?: number;
};

export default function CheckIn() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const verify = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setChecking(true);
    setResult(null);
    const { data, error } = await supabase.rpc("verify_check_in_pass", { p_code: trimmed });
    if (error) {
      setResult({ valid: false, reason: "error" });
    } else {
      const res = data as any;
      setResult({
        ...res,
        covered_names: Array.isArray(res?.covered_names) ? res.covered_names : [],
      });
    }
    setChecking(false);
  };

  useEffect(() => {
    const initial = params.get("code");
    if (initial) verify(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const message = (reason?: string) => {
    if (reason === "expired") return "This pass has expired. Ask the guest to sign a new waiver.";
    if (reason === "unauthorized") return "Please sign in again to check guests in.";
    if (reason === "error") return "Something went wrong. Try again.";
    return "No signed waiver found for this code.";
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Check in a guest</h1>
          <p className="text-muted-foreground text-sm">
            Scan the guest's pass with your phone camera, or type the code below.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="WVR-1234-AB"
                className="font-mono"
                onKeyDown={(e) => e.key === "Enter" && verify(code)}
              />
              <Button onClick={() => verify(code)} disabled={checking || !code.trim()}>
                <ScanLine className="mr-2 h-4 w-4" />
                Check
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className={result.valid ? "border-success" : "border-destructive"}>
            <CardContent className="pt-6">
              {result.valid ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-heading text-xl font-bold">Waiver on file</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-lg">{result.guest_name}</p>
                    {!!result.covered_names?.length && (
                      <p className="text-muted-foreground">
                        Covered ({result.covered_names.length}): {result.covered_names.join(", ")}
                      </p>
                    )}
                    <p className="text-muted-foreground">{result.activity_name}</p>
                    {result.valid_until && (
                      <p className="text-muted-foreground">
                        Valid until {new Date(result.valid_until).toLocaleDateString()}
                      </p>
                    )}
                    <p className="font-mono text-xs text-muted-foreground">{result.pass_code}</p>
                    {(result.check_in_count || 0) > 1 && (
                      <p className="text-xs text-muted-foreground">
                        Checked in {result.check_in_count} times
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-destructive">
                  <XCircle className="mt-0.5 h-6 w-6 shrink-0" />
                  <div>
                    <p className="font-heading text-xl font-bold">Not valid</p>
                    <p className="text-sm text-muted-foreground">{message(result.reason)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
