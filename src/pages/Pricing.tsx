import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Coins, AlertTriangle, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { CREDIT_PACKAGES, getCreditStatus, type PackageId } from "@/lib/credit-packages";
import { CreditTransactionHistory } from "@/components/CreditTransactionHistory";

export default function Pricing() {
  const { user, wallet, refreshWallet, profile } = useAuth();
  const navigate = useNavigate();
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  const handleCheckout = async (packageId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoadingPkg(packageId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { packageId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoadingPkg(null);
    }
  };

  const handleAutoRechargeToggle = async (enabled: boolean) => {
    if (!profile?.org_id) return;
    try {
      const { error } = await supabase
        .from("wallets")
        .update({ auto_recharge_enabled: enabled })
        .eq("org_id", profile.org_id);
      if (error) throw error;
      await refreshWallet();
      toast.success(enabled ? "Auto-recharge enabled" : "Auto-recharge disabled");
    } catch (err: any) {
      toast.error(err.message || "Failed to update auto-recharge");
    }
  };

  const handleAutoRechargeSettings = async (field: string, value: any) => {
    if (!profile?.org_id) return;
    try {
      const { error } = await supabase
        .from("wallets")
        .update({ [field]: value })
        .eq("org_id", profile.org_id);
      if (error) throw error;
      await refreshWallet();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const status = wallet.status;

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold">Simple Waiver Credits</h1>
          <p className="text-muted-foreground mt-2">
            No monthly subscription. Only pay for the waivers you actually use.
          </p>
        </div>

        {/* Current balance */}
        {user && !wallet.loading && (
          <Card className={`mb-8 ${
            status === "paused" ? "border-destructive/50 bg-destructive/5" :
            status === "overdraft" ? "border-warning/50 bg-warning/5" :
            status === "low" ? "border-warning/50 bg-warning/5" :
            "border-primary/20 bg-primary/5"
          }`}>
            <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Coins className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-heading font-bold">{wallet.credits} credits</p>
                  <p className="text-sm text-muted-foreground">
                    {status === "healthy" && "You're all set."}
                    {status === "low" && "Running low — consider adding more credits."}
                    {status === "overdraft" && "You've gone into overdraft. Add credits soon."}
                    {status === "paused" && "Waiver collection is paused. Add credits to continue."}
                  </p>
                </div>
              </div>
              <Badge variant={
                status === "healthy" ? "default" :
                status === "paused" ? "destructive" : "secondary"
              } className="text-xs">
                {status === "healthy" ? "Healthy" :
                 status === "low" ? "Low Balance" :
                 status === "overdraft" ? "Overdraft" : "Paused"}
              </Badge>
            </CardContent>
          </Card>
        )}

        {status === "paused" && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Waiver collection is paused</p>
                <p className="text-sm text-muted-foreground">
                  Your credit balance has reached the overdraft limit (-10). Purchase credits below to resume sending waivers.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit packages */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-8">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card key={pkg.id} className={`relative flex flex-col ${pkg.popular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-heading text-lg">{pkg.credits.toLocaleString()} Credits</CardTitle>
                {pkg.label && <CardDescription className="min-h-[20px] text-xs">{pkg.label}</CardDescription>}
                <div className="mt-3">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pkg.perWaiver}/waiver
                </p>
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-primary" /> One-time purchase</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-primary" /> Never expires</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-primary" /> All features included</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => handleCheckout(pkg.id)}
                  disabled={!!loadingPkg}
                  size="sm"
                >
                  {loadingPkg === pkg.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Buy Credits
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Auto-recharge */}
        {user && profile?.org_id && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Auto-Recharge
              </CardTitle>
              <CardDescription>
                Automatically purchase more credits when your balance gets low
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-recharge" className="text-sm font-medium">Enable Auto-Recharge</Label>
                  <p className="text-xs text-muted-foreground">
                    We'll charge your saved payment method when credits drop below the threshold
                  </p>
                </div>
                <Switch
                  id="auto-recharge"
                  checked={wallet.autoRechargeEnabled}
                  onCheckedChange={handleAutoRechargeToggle}
                />
              </div>

              {wallet.autoRechargeEnabled && (
                <div className="grid gap-4 sm:grid-cols-2 pl-4 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label className="text-sm">Recharge when credits drop below</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={wallet.autoRechargeThreshold}
                      onChange={(e) => handleAutoRechargeSettings("auto_recharge_threshold", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Package to auto-purchase</Label>
                    <Select
                      value={wallet.autoRechargePackage || "pkg_200"}
                      onValueChange={(v) => handleAutoRechargeSettings("auto_recharge_package", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CREDIT_PACKAGES.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.credits.toLocaleString()} credits — ${pkg.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        {user && profile?.org_id && (
          <div className="mb-8">
            <CreditTransactionHistory />
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Credits are deducted when you send a waiver (1 credit per signer). Your account can go up to -10 credits before sending is paused.
          </p>
          <Button variant="ghost" size="sm" onClick={refreshWallet}>
            Refresh credit balance
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
