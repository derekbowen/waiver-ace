export const OVERAGE_RATE = 0.75; // $/waiver over limit

export const TIERS = {
  free: {
    name: "Free",
    price_id: null,
    product_id: null,
    price: 0,
    waiver_limit: 5,
    description: "Try it out with a handful of waivers",
    features: [
      "5 waivers/month",
      "1 template",
      "Basic audit trail",
      "Email support",
    ],
  },
  starter: {
    name: "Starter",
    price_id: "price_1T8oDF9rOl37Kk1Kwq7cVnZe",
    product_id: "prod_U72HqqcrOsLCZK",
    price: 9,
    waiver_limit: 15,
    description: "For small businesses getting started",
    features: [
      "15 waivers/month",
      "Unlimited templates",
      "Full audit trail",
      "Email support",
      "$0.75/waiver overage",
    ],
  },
  growth: {
    name: "Growth",
    price_id: "price_1T8oDG9rOl37Kk1KETgfh4C2",
    product_id: "prod_U72HGR1DW4wSdM",
    price: 29,
    waiver_limit: 50,
    description: "For growing operations with more volume",
    features: [
      "50 waivers/month",
      "Unlimited templates",
      "Webhooks & API access",
      "Priority support",
      "$0.75/waiver overage",
    ],
  },
  business: {
    name: "Business",
    price_id: "price_1T8oDH9rOl37Kk1Kz3m457JT",
    product_id: "prod_U72HK4z5JuWIki",
    price: 79,
    waiver_limit: 150,
    description: "For high-volume marketplace operations",
    features: [
      "150 waivers/month",
      "Unlimited templates",
      "Webhooks & API access",
      "Custom email domain",
      "Dedicated support",
      "$0.75/waiver overage",
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
