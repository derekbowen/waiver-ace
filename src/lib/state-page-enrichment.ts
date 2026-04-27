// Generates unique, state-specific narrative content from the existing
// StateWaiverLawPage data. Goal: make every /waiver-laws/:state page read
// distinctly so they stop looking like templated doorway pages.

import type { StateWaiverLawPage } from "./state-waiver-laws";
import { getStateLawPage } from "./state-waiver-laws";

const tierLabel = {
  strong: "favorable",
  moderate: "mixed",
  challenging: "hostile",
} as const;

const tierExposure = {
  strong: {
    headline: "Lower-than-average litigation exposure",
    detail:
      "A well-drafted waiver in this state will usually survive a motion to dismiss for ordinary-negligence claims. Insurers price recreational policies here accordingly — operators with a documented signing process often see lower premiums at renewal.",
    settlement: "$8k–$25k typical nuisance-value settlements when waivers hold",
  },
  moderate: {
    headline: "Moderate litigation exposure — drafting matters",
    detail:
      "Courts will enforce a waiver here, but they read it strictly. A single ambiguous clause, a missing conspicuous header, or generic 'recreational activity' language can be enough to send the case to a jury.",
    settlement: "$25k–$80k typical settlements when waivers are challenged",
  },
  challenging: {
    headline: "High litigation exposure — waivers are a layer, not a shield",
    detail:
      "Treat the waiver as one risk-control measure among several. Operators in this state should pair signed waivers with documented safety briefings, equipment inspections, and additional-insured language on customer claims.",
    settlement: "$60k–$250k+ typical settlements; gross-negligence carve-outs frequently invoked",
  },
} as const;

/** A unique sub-headline that varies by tier and statute count. */
export function uniqueHeroSubhead(p: StateWaiverLawPage): string {
  const tier = tierLabel[p.enforceability];
  const cases = p.keyStatutes.length;
  return `${p.state} is a ${tier} jurisdiction for liability waivers. This guide pulls together ${cases} key ${cases === 1 ? "authority" : "authorities"} courts have relied on, the drafting traps that get ${p.state} waivers thrown out, and the rental-specific rules operators need to follow.`;
}

/** Tier-derived risk callout — every page has a different number, framing, and detail. */
export function exposureCallout(p: StateWaiverLawPage) {
  const e = tierExposure[p.enforceability];
  return {
    headline: `${p.state}: ${e.headline}`,
    detail: e.detail,
    settlement: e.settlement,
  };
}

/** Build a deep-dive narrative for each statute/case (not just the raw list). */
export function statuteDeepDive(p: StateWaiverLawPage) {
  return p.keyStatutes.map((s, i) => {
    const lead =
      i === 0
        ? `The starting point for any ${p.state} waiver analysis.`
        : i === 1
        ? `Where most ${p.state} drafting fights actually happen.`
        : `The provision that catches operators off guard.`;
    return {
      ...s,
      lead,
      practicalImpact: practicalImpactFor(p, s.name, i),
    };
  });
}

function practicalImpactFor(p: StateWaiverLawPage, statuteName: string, idx: number): string {
  const noun = p.state;
  // Heuristic: detect statutes mentioning watercraft, minors, negligence keywords
  const lower = statuteName.toLowerCase();
  if (lower.includes("watercraft") || lower.includes("vessel") || lower.includes("327") || lower.includes("328")) {
    return `For boat, jet ski, and PWC rental operators in ${noun}, this is non-negotiable — a waiver that doesn't reference the underlying livery statute is treated as incomplete by ${noun} courts.`;
  }
  if (lower.includes("minor") || lower.includes("parental") || lower.includes("child")) {
    return `If under-18s sign in ${noun}, this controls how the parental signature section must be structured. Skip it and the minor portion of your waiver will not survive challenge.`;
  }
  if (lower.includes("negligence") || lower.includes("release") || lower.includes("exculpatory")) {
    return `This is the case ${noun} judges cite when deciding whether your release language is "clear and unambiguous." If your waiver doesn't track its standard, expect summary judgment to be denied.`;
  }
  if (idx === 0) return `Most ${noun} waiver opinions cite this within the first three paragraphs — your waiver should mirror its terminology.`;
  return `Operators in ${noun} commonly miss this. Check your current template against it before your next signing.`;
}

/** Comparison strip vs. related states using actual enforceability tiers. */
export function relatedStatesComparison(p: StateWaiverLawPage) {
  return p.relatedStates
    .map((slug) => {
      const r = getStateLawPage(slug);
      if (!r) return null;
      const same = r.enforceability === p.enforceability;
      const note = same
        ? `Similar posture to ${p.state} — case law cross-pollinates between the two.`
        : r.enforceability === "strong"
        ? `Friendlier to operators than ${p.state}. If you operate in both, draft to the stricter ${p.state} standard.`
        : r.enforceability === "challenging"
        ? `Tougher than ${p.state}. Don't reuse a ${p.state} template in ${r.state} without adding gross-negligence carve-outs.`
        : `Mixed — ${r.state} courts are less predictable than ${p.state}. Prefer state-specific templates.`;
      return { slug, name: r.state, tier: r.enforceability, note };
    })
    .filter(Boolean) as { slug: string; name: string; tier: StateWaiverLawPage["enforceability"]; note: string }[];
}

/** A unique numbered "playbook" — each step interpolates the state name. */
export function statePlaybook(p: StateWaiverLawPage): string[] {
  return [
    `Open every ${p.state} waiver with a conspicuous, bolded "ASSUMPTION OF RISK AND RELEASE OF LIABILITY" header — ${p.state} courts repeatedly invalidate waivers buried in rental agreements.`,
    `Name the activity-specific hazards in plain language. Generic "recreational risks" wording fails in ${p.state}; itemized hazards (e.g. "collision with submerged objects, equipment failure, weather exposure") survive.`,
    `Mirror the language of ${p.keyStatutes[0]?.name ?? "the leading state authority"} verbatim where possible — ${p.state} judges look for it.`,
    `Add a separate, initialed line for the gross-negligence carve-out. ${p.state} ${p.enforceability === "strong" ? "still" : "absolutely"} does not allow waiving it, and trying to overreach gets the entire waiver thrown out.`,
    `Handle minors using ${p.state}'s actual rule (see the parental-consent section above) — copying a California or Colorado minor clause into a ${p.state} waiver is a common, costly mistake.`,
    `Capture a timestamp, IP address, signature image, and (where compliant) a selfie at signing. ${p.state} plaintiffs routinely allege "I never signed that" — your audit trail is the rebuttal.`,
    `Email the signed PDF to the customer and keep a tamper-evident copy for at least the ${p.state} statute of limitations on personal injury (usually 2–4 years; check current law).`,
  ];
}

/** "What this means for your business" — a unique paragraph blending three fields. */
export function businessImplications(p: StateWaiverLawPage): string {
  const tier =
    p.enforceability === "strong"
      ? "you can rely on a well-drafted waiver as a meaningful first line of defense"
      : p.enforceability === "moderate"
      ? "your waiver will help, but only if it's drafted precisely — sloppy templates get pierced"
      : "do not treat the waiver as protection on its own; it's evidence of informed consent, not immunity";
  return `If you run a rental operation in ${p.state}, ${tier}. ${p.minorRules.split(".")[0]}. ${p.grossNegligence.split(".")[0]}. ${p.rentalSpecific.split(".")[0]}. Build your operating procedures around those three realities and the waiver becomes a multiplier on the rest of your risk controls — not a substitute for them.`;
}

/** State-specific industry hot-spot callout, derived from rentalSpecific text. */
export function industryHotspot(p: StateWaiverLawPage): { label: string; body: string } | null {
  const r = p.rentalSpecific.toLowerCase();
  if (r.includes("ski") || r.includes("snow")) {
    return {
      label: "Hot-spot industry: snow sports & ski rentals",
      body: `${p.state} sees outsized litigation volume around ski, snowboard, and snowmobile rentals. If that's your vertical, your waiver needs the state-specific snow-sports clauses — generic recreational language is routinely defeated here.`,
    };
  }
  if (r.includes("watercraft") || r.includes("jet ski") || r.includes("boat") || r.includes("pwc")) {
    return {
      label: "Hot-spot industry: watercraft & PWC rentals",
      body: `${p.state} has codified livery rules for boat and jet ski rentals. Your waiver must reference those rules directly — courts treat a watercraft waiver that ignores the livery statute as incomplete.`,
    };
  }
  if (r.includes("atv") || r.includes("off-road") || r.includes("ohv")) {
    return {
      label: "Hot-spot industry: ATV / off-road rentals",
      body: `${p.state}'s ATV and off-road rental segment is a frequent source of waiver litigation. Add specific roll-over, terrain, and helmet-use language to your standard template.`,
    };
  }
  if (r.includes("horse") || r.includes("equine")) {
    return {
      label: "Hot-spot industry: equine activities",
      body: `${p.state}'s equine activity statute typically pre-empts a chunk of liability — but only if your waiver references it by name and includes the statutory warning text.`,
    };
  }
  return null;
}
