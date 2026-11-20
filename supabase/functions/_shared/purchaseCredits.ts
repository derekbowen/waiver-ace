type PurchaseSession = {
  mode: string | null;
  payment_status: string;
  metadata: Record<string, string> | null;
};

export function paidCreditAmount(session: PurchaseSession): number | null {
  if (session.mode !== "payment" || session.payment_status !== "paid") return null;
  const value = session.metadata?.credits;
  if (!value || !/^\d+$/.test(value)) return null;
  const credits = Number(value);
  return Number.isSafeInteger(credits) && credits > 0 ? credits : null;
}

type CreditArguments = {
  p_org_id: string;
  p_amount: number;
  p_reference_id: string;
  p_type: string;
  p_notes: string;
};

type CreditClient = {
  rpc(name: string, args: CreditArguments): PromiseLike<{ data: unknown; error: unknown }>;
};

// Server-side callers only: the public add_credits name has ambiguous overloads.
export function addPurchasedCredits(client: CreditClient, args: Omit<CreditArguments, "p_type">) {
  return client.rpc("add_credits_internal", { ...args, p_type: "purchase" });
}