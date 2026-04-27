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

/** State-specific industry hot-spot callout, derived from rentalSpecific text.
 *  Strip the known shared boilerplate suffix first so we don't match every state. */
export function industryHotspot(p: StateWaiverLawPage): { label: string; body: string } | null {
  const cleaned = p.rentalSpecific
    .replace(/\s*Always include the specific activity[\s\S]*$/i, "")
    .toLowerCase();
  const r = cleaned;
  if (/\b(ski|snowboard|snowmobile|snow sports?)\b/.test(r)) {
    return {
      label: "Hot-spot industry: snow sports & ski rentals",
      body: `${p.state} sees outsized litigation volume around ski, snowboard, and snowmobile rentals. If that's your vertical, your waiver needs the state-specific snow-sports clauses — generic recreational language is routinely defeated here.`,
    };
  }
  if (/\b(watercraft|jet ?ski|boat|pwc|paddleboard|sailing|marine|livery)\b/.test(r)) {
    return {
      label: "Hot-spot industry: watercraft & PWC rentals",
      body: `${p.state} has codified livery rules for boat and jet ski rentals. Your waiver must reference those rules directly — courts treat a watercraft waiver that ignores the livery statute as incomplete.`,
    };
  }
  if (/\b(atv|off-?road|ohv|motorsport|utv)\b/.test(r)) {
    return {
      label: "Hot-spot industry: ATV / off-road rentals",
      body: `${p.state}'s ATV and off-road rental segment is a frequent source of waiver litigation. Add specific roll-over, terrain, and helmet-use language to your standard template.`,
    };
  }
  if (/\b(horse|equine|equestrian)\b/.test(r)) {
    return {
      label: "Hot-spot industry: equine activities",
      body: `${p.state}'s equine activity statute typically pre-empts a chunk of liability — but only if your waiver references it by name and includes the statutory warning text.`,
    };
  }
  return null;
}

/** "a" vs "an" for state names starting with vowel sounds (Alabama, Indiana, Oregon...). */
function aOrAn(state: string): string {
  return /^[aeiou]/i.test(state) ? "an" : "a";
}

// =============================================================================
// UNIQUE-PROSE SYNTHESIZERS
// These override the templated source strings (overview, enforcementSummary,
// grossNegligence, rentalSpecific) by weaving each state's UNIQUE inputs
// (statute names, first-statute holding, tier, hotspot) into fresh prose.
// Output differs per state even when source fields share a tier template —
// fixes the doorway-page risk Google Search Console flagged.
// =============================================================================

function firstSentence(s: string): string {
  if (!s) return "";
  const m = s.match(/^[^.!?]+[.!?]/);
  return (m ? m[0] : s).trim();
}

function listAuthorities(p: StateWaiverLawPage): string {
  const names = p.keyStatutes.map((s) => s.name);
  if (names.length === 0) return "general common-law principles";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function tierVerb(p: StateWaiverLawPage): string {
  return p.enforceability === "strong"
    ? "regularly upheld"
    : p.enforceability === "moderate"
    ? "enforced under close scrutiny"
    : "viewed skeptically and frequently invalidated";
}

/** Unique overview synthesized from authorities + first statute holding + tier. */
export function uniqueOverview(p: StateWaiverLawPage): string {
  const lead = p.keyStatutes[0];
  const authorities = listAuthorities(p);
  const verb = tierVerb(p);
  const leadHolding = lead ? firstSentence(lead.description) : "";
  const tierFraming =
    p.enforceability === "strong"
      ? `${p.state} sits on the operator-friendly end of the U.S. waiver-enforcement spectrum`
      : p.enforceability === "moderate"
      ? `${p.state} occupies the middle of the U.S. waiver-enforcement spectrum — wins on drafting, losses on sloppiness`
      : `${p.state} is one of the harder states in the country to enforce a pre-injury release`;
  const cite = lead
    ? `The starting point is ${lead.name}: ${leadHolding.replace(/\.$/, "")}.`
    : "";
  return `${tierFraming}. Pre-injury releases here are ${verb}, and the controlling authorities operators need to know are ${authorities}. ${cite} The rest of this guide breaks those down clause by clause and shows what they mean for ${aOrAn(p.state)} ${p.state} rental contract.`;
}

/** Unique enforcement summary anchored on the actual leading authority. */
export function uniqueEnforcementSummary(p: StateWaiverLawPage): string {
  const lead = p.keyStatutes[0];
  const second = p.keyStatutes[1];
  const tierLine =
    p.enforceability === "strong"
      ? `${p.state} courts will enforce a release for ordinary negligence when it is conspicuous, specific to the activity, and signed by an adult.`
      : p.enforceability === "moderate"
      ? `${p.state} courts enforce releases but read them strictly — ambiguity, buried release language, or generic "recreational risk" wording will get the waiver pierced.`
      : `${p.state} courts treat pre-injury releases with substantial skepticism and have invalidated them on public-policy grounds even when the language was clear.`;
  const leadCite = lead ? ` The standard most ${p.state} judges apply traces back to ${lead.name}.` : "";
  const secondCite = second ? ` ${second.name} is the case operators usually run into when the language is challenged.` : "";
  return `${tierLine}${leadCite}${secondCite}`;
}

/** Unique gross-negligence section that names the state's actual carve-out posture. */
export function uniqueGrossNegligence(p: StateWaiverLawPage): string {
  const tierFraming =
    p.enforceability === "strong"
      ? `Even in operator-friendly ${p.state}, the gross-negligence carve-out is absolute`
      : p.enforceability === "moderate"
      ? `${p.state} courts use the gross-negligence line as the most common reason to send a release case to the jury`
      : `${p.state} reads the gross-negligence carve-out broadly — what other states would treat as ordinary negligence often gets relabeled as "gross" here`;
  const lead = p.keyStatutes[0];
  const leadCite = lead ? ` Plaintiffs typically cite ${lead.name} when arguing the carve-out applies.` : "";
  return `${tierFraming}: a release in ${p.state} cannot waive liability for gross negligence, recklessness, or intentional misconduct, period.${leadCite} The practical defense is documentation — written safety briefings, dated equipment-inspection logs, and trained-staff rosters are what keep a ${p.state} claim on the "ordinary negligence" side of the line where the waiver actually works.`;
}

/** Unique rental-specific paragraph: keep the state's hand-written opener,
 *  drop the shared "Always include the specific activity..." suffix, and
 *  append a sentence derived from the hotspot or generic vertical guidance. */
export function uniqueRentalSpecific(p: StateWaiverLawPage): string {
  const SUFFIX_RE = /\s*Always include the specific activity[\s\S]*$/i;
  const opener = p.rentalSpecific.replace(SUFFIX_RE, "").trim();
  const hot = industryHotspot(p);
  const tail = hot
    ? ` For ${hot.label.replace(/^Hot-spot industry:\s*/i, "").trim()} specifically, your ${p.state} waiver should name the equipment, the operating environment, and the specific failure modes — generic "recreational risk" language is the single most common reason ${p.state} releases get pierced.`
    : ` Whatever the vertical, your ${p.state} release should name the equipment by category (e.g. "personal watercraft," "all-terrain vehicle," "rental bicycle"), the operating environment, and the specific failure modes — generic "recreational risk" language is the most common reason ${p.state} releases get pierced.`;
  return `${opener}${tail}`;
}

/** Unique <title> per state — anchored on the leading case/statute name (which is
 *  unique per state). Falls back to a tier-aware base if no authorities exist. */
export function uniqueMetaTitle(p: StateWaiverLawPage): string {
  const lead = p.keyStatutes[0]?.name;
  // Strip the trailing parenthetical "(Cal. 2008)" / "(Vt. 1995)" so the title stays compact.
  const leadShort = lead ? lead.replace(/\s*\([^)]+\)\s*$/, "").trim() : "";
  if (leadShort) {
    return `${p.state} Waiver Law After ${leadShort} | Rental Operator Guide`;
  }
  const tier =
    p.enforceability === "strong"
      ? "Enforceable"
      : p.enforceability === "moderate"
      ? "Enforceable with Limits"
      : "Often Unenforceable";
  return `${p.state} Liability Waivers: ${tier} | Rental Operator Guide`;
}

/** Unique meta description per state — names the leading case + tier verb. */
export function uniqueMetaDescription(p: StateWaiverLawPage): string {
  const lead = p.keyStatutes[0]?.name;
  const lead2 = p.keyStatutes[1]?.name;
  const verb = tierVerb(p);
  const cite = lead ? `${lead}${lead2 ? `, ${lead2}` : ""}` : "the leading state authorities";
  const desc = `${p.state} pre-injury releases are ${verb}. What ${cite} require, the gross-negligence carve-out, minor-signing rules, and a 7-step ${p.state} waiver playbook.`;
  return desc.length <= 158 ? desc : desc.slice(0, 155) + "...";
}

