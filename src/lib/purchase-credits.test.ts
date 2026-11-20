import { describe, expect, it, vi } from "vitest";
import { addPurchasedCredits, paidCreditAmount } from "../../supabase/functions/_shared/purchaseCredits";

describe("purchase credit processing", () => {
  it("grants the purchased 1,250 credits through the unambiguous server routine", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 1250, error: null });
    const args = { p_org_id: "org-1", p_amount: 1250, p_reference_id: "cs_paid", p_notes: "Purchased credits" };
    expect(await addPurchasedCredits({ rpc }, args)).toEqual({ data: 1250, error: null });
    expect(rpc).toHaveBeenCalledExactlyOnceWith("add_credits_internal", { ...args, p_type: "purchase" });
  });

  it("never recovers credits from unpaid or subscription checkout sessions", () => {
    const session = { mode: "payment", payment_status: "paid", metadata: { credits: "1250" } };
    expect(paidCreditAmount(session)).toBe(1250);
    expect(paidCreditAmount({ ...session, payment_status: "unpaid" })).toBeNull();
    expect(paidCreditAmount({ ...session, mode: "subscription" })).toBeNull();
  });

  it("rejects missing, negative, and malformed credit quantities", () => {
    for (const credits of ["", "0", "-1250", "1250oops", "1.5", "9007199254740992"]) {
      expect(paidCreditAmount({ mode: "payment", payment_status: "paid", metadata: { credits } })).toBeNull();
    }
  });

  it("preserves database errors instead of claiming crediting succeeded", async () => {
    const error = { code: "XX000", message: "write failed" };
    const rpc = vi.fn().mockResolvedValue({ data: null, error });
    const result = await addPurchasedCredits({ rpc }, {
      p_org_id: "org-1", p_amount: 1250, p_reference_id: "cs_paid", p_notes: "Recovered credits",
    });
    expect(result.error).toEqual(error);
  });
});