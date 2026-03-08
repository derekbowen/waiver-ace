import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { TIERS, OVERAGE_RATE, type TierKey } from "@/lib/stripe-tiers";

export default function Pricing() {
  const { user, subscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async (tierKey: TierKey) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const tier = TIERS[tierKey];
    if (!tier.price_id) return;

    setLoadingTier(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: tier.price_id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open subscription management");
    } finally {
      setPortalLoading(false);
    }
  };

  const tierEntries = Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][];

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2">
            Pay for what you use — every plan includes overage at ${OVERAGE_RATE.toFixed(2)}/waiver
          </p>
          {subscription.subscribed && (
            <Button variant="outline" className="mt-4 gap-2" onClick={handleManage} disabled={portalLoading}>
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Manage Subscription
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tierEntries.map(([key, tier]) => {
            const isCurrent = subscription.tier === key;
            const isPopular = key === "growth";

            return (
              <Card key={key} className={`relative flex flex-col ${isPopular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""} ${isCurrent ? "border-primary bg-primary/5" : ""}`}>
                {isPopular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">Your Plan</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="font-heading text-xl">{tier.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tier.waiver_limit} waivers included
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : key === "free" ? (
                    <Button className="w-full" variant="outline" disabled={!subscription.subscribed} onClick={handleManage}>
                      {subscription.subscribed ? "Downgrade" : "Current Plan"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleCheckout(key)}
                      disabled={!!loadingTier}
                    >
                      {loadingTier === key ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {subscription.subscribed ? "Switch Plan" : "Get Started"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {subscription.subscriptionEnd && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Current period ends: {new Date(subscription.subscriptionEnd).toLocaleDateString()}
          </p>
        )}

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={refreshSubscription}>
            Refresh subscription status
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
