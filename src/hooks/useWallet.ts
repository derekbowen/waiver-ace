import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { type CreditStatus } from "@/lib/credit-packages";

export function useWallet() {
  const { wallet } = useAuth();

  return {
    credits: wallet.credits,
    status: wallet.status,
    isPaused: wallet.status === "paused",
    isLow: wallet.status === "low",
    isOverdraft: wallet.status === "overdraft",
    isHealthy: wallet.status === "healthy",
    autoRechargeEnabled: wallet.autoRechargeEnabled,
    loading: wallet.loading,
  };
}

interface CreditTransaction {
  id: string;
  type: string;
  credits_delta: number;
  balance_after: number;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

export function useCreditHistory(limit = 50) {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) { setLoading(false); return; }

    supabase
      .from("credit_transactions")
      .select("id, type, credits_delta, balance_after, reference_id, notes, created_at")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (!error && data) setTransactions(data);
        setLoading(false);
      });
  }, [profile?.org_id, limit]);

  return { transactions, loading };
}
