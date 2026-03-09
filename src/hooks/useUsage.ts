import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TIERS } from "@/lib/stripe-tiers";

export function useUsage() {
  const { profile, subscription } = useAuth();
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    supabase
      .from("envelopes")
      .select("id", { count: "exact", head: true })
      .eq("org_id", profile.org_id)
      .gte("created_at", startOfMonth)
      .then(({ count, error }) => {
        if (!error) setUsed(count ?? 0);
        setLoading(false);
      });
  }, [profile?.org_id]);

  const tier = TIERS[subscription.tier];
  const limit = tier.waiver_limit;
  const remaining = Math.max(0, limit - used);
  const isOverLimit = used >= limit;

  return { used, limit, remaining, isOverLimit, loading };
}
