import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, History, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: string;
  credits_delta: number;
  balance_after: number;
  notes: string | null;
  reference_id: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  credit_purchase: "Purchase",
  waiver_deduction: "Waiver Sent",
  auto_recharge: "Auto-Recharge",
  manual_adjustment: "Adjustment",
  refund: "Refund",
};

export function CreditTransactionHistory() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.org_id) return;

    supabase
      .from("credit_transactions")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setTransactions(data || []);
        setLoading(false);
      });
  }, [profile?.org_id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Transaction History
        </CardTitle>
        <CardDescription>Your recent credit purchases and usage</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No transactions yet. Purchase credits to get started.
          </p>
        ) : (
          <div className="space-y-1">
            {/* Header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
              <span>Type</span>
              <span className="w-20 text-right">Amount</span>
              <span className="w-20 text-right">Balance</span>
              <span className="w-28 text-right">Date</span>
            </div>

            {transactions.map((tx) => {
              const isPositive = tx.credits_delta > 0;
              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-4 px-3 py-2.5 rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isPositive ? (
                      <ArrowUpCircle className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {TYPE_LABELS[tx.type] || tx.type}
                      </span>
                      {tx.notes && (
                        <span className="text-xs text-muted-foreground truncate block">
                          {tx.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center sm:w-20 justify-end">
                    <Badge
                      variant={isPositive ? "default" : "secondary"}
                      className="text-xs font-mono tabular-nums"
                    >
                      {isPositive ? "+" : ""}{tx.credits_delta}
                    </Badge>
                  </div>

                  <div className="hidden sm:flex items-center w-20 justify-end">
                    <span className="text-sm text-muted-foreground font-mono tabular-nums">
                      {tx.balance_after}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center w-28 justify-end">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
