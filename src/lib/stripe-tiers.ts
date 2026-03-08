export const TIERS = {
  free: {
    name: "Free",
    price_id: null,
    product_id: "prod_U729n6u66MvwbU",
    price: 0,
    description: "Get started with basic waiver management",
    features: [
      "Up to 50 envelopes/month",
      "1 template",
      "Email support",
      "Basic audit trail",
    ],
  },
  pro: {
    name: "Pro",
    price_id: "price_1T8o5N9rOl37Kk1K7PcJKtAV",
    product_id: "prod_U729lNTB6OBIWv",
    price: 49,
    description: "For growing businesses that need more power",
    features: [
      "Unlimited envelopes",
      "Unlimited templates",
      "Webhooks & API access",
      "Priority support",
      "Custom email domain",
      "Full audit trail",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price_id: "price_1T8o5O9rOl37Kk1Kr3ccY6ve",
    product_id: "prod_U729XNCJnLXYlm",
    price: 199,
    description: "For organizations with advanced needs",
    features: [
      "Everything in Pro",
      "Custom branding & logo",
      "Dedicated support & SLA",
      "SSO integration",
      "Advanced analytics",
      "Custom retention policies",
    ],
  },
} as const;

export type TierKey = keyof typeof TIERS;

export function getTierByProductId(productId: string | null): TierKey {
  if (!productId) return "free";
  for (const [key, tier] of Object.entries(TIERS)) {
    if (tier.product_id === productId) return key as TierKey;
  }
  return "free";
}
