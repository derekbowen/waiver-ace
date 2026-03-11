/**
 * Calculate the credit cost for a waiver based on template features.
 * Base: 1 credit
 * +1 for branded (org has logo_url, brand_color, or brand_font)
 * +1 for photo capture (template.require_photo)
 * +1 for video requirement (template.require_video)
 */

export interface CreditCostInput {
  requirePhoto?: boolean;
  requireVideo?: boolean;
  isBranded?: boolean; // org has logo/color/font set
}

export interface CreditCostResult {
  total: number;
  breakdown: string; // e.g. "base:1 + photo:1 + branded:1"
}

export function calculateCreditCost(input: CreditCostInput): CreditCostResult {
  let total = 1;
  const parts: string[] = ["base:1"];

  if (input.isBranded) {
    total += 1;
    parts.push("branded:1");
  }
  if (input.requirePhoto) {
    total += 1;
    parts.push("photo:1");
  }
  if (input.requireVideo) {
    total += 1;
    parts.push("video:1");
  }

  return { total, breakdown: parts.join(" + ") };
}

/**
 * Check if an org has branding configured (logo, color, or font).
 */
export function orgIsBranded(org: {
  logo_url?: string | null;
  brand_color?: string | null;
  brand_font?: string | null;
}): boolean {
  return !!(org.logo_url || org.brand_color || org.brand_font);
}
