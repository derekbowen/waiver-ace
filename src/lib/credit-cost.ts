/**
 * Calculate the credit cost for a waiver based on template/org features.
 * Base: 1 credit
 * +1 for branded (org has logo_url, brand_color, or brand_font)
 * +1 for photo capture (template.require_photo)
 * +1 for video requirement (template.require_video)
 */

export interface CreditCostInput {
  requirePhoto?: boolean;
  requireVideo?: boolean;
  isBranded?: boolean;
}

export interface CreditCostResult {
  total: number;
  breakdown: { label: string; cost: number }[];
}

export function calculateCreditCost(input: CreditCostInput): CreditCostResult {
  const breakdown: { label: string; cost: number }[] = [
    { label: "Base waiver", cost: 1 },
  ];

  if (input.isBranded) {
    breakdown.push({ label: "Branded", cost: 1 });
  }
  if (input.requirePhoto) {
    breakdown.push({ label: "Photo capture", cost: 1 });
  }
  if (input.requireVideo) {
    breakdown.push({ label: "Video requirement", cost: 1 });
  }

  return {
    total: breakdown.reduce((sum, b) => sum + b.cost, 0),
    breakdown,
  };
}

export function orgIsBranded(org: {
  logo_url?: string | null;
  brand_color?: string | null;
  brand_font?: string | null;
}): boolean {
  return !!(org.logo_url || org.brand_color || org.brand_font);
}
