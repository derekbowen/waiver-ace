// Programmatic SEO matrix: cross-join of industries × states.
// Generates a unique long-tail URL for every (industry, state) pair.
// URL pattern: /industries/:industrySlug/state/:stateSlug
// Example: /industries/kayak-rental-waiver-software/state/california

import { allIndustryPages, getIndustryPage, type IndustryPage } from "./industry-pages";
import { stateWaiverLawPages, getStateLawPage, type StateWaiverLawPage } from "./state-waiver-laws";

export interface MatrixPair {
  industrySlug: string;
  stateSlug: string;
  industry: IndustryPage;
  state: StateWaiverLawPage;
}

/** Resolve a matrix pair from URL params. Returns undefined if either side missing. */
export function getMatrixPage(industrySlug: string, stateSlug: string): MatrixPair | undefined {
  const industry = getIndustryPage(industrySlug);
  const state = getStateLawPage(stateSlug);
  if (!industry || !state) return undefined;
  return { industrySlug, stateSlug, industry, state };
}

/** All valid (industry, state) URL pairs — used for sitemap generation and internal linking. */
export function listAllMatrixSlugs(): { industrySlug: string; stateSlug: string }[] {
  const pairs: { industrySlug: string; stateSlug: string }[] = [];
  for (const ind of allIndustryPages) {
    for (const st of stateWaiverLawPages) {
      pairs.push({ industrySlug: ind.slug, stateSlug: st.slug });
    }
  }
  return pairs;
}

export function matrixUrl(industrySlug: string, stateSlug: string): string {
  return `/industries/${industrySlug}/state/${stateSlug}`;
}

/** Build a unique meta title that varies per pair (avoids duplicate-content flags). */
export function matrixMetaTitle(industry: IndustryPage, state: StateWaiverLawPage): string {
  return `${industry.name} Waiver in ${state.state} — Laws, Template & Software | RentalWaivers`;
}

export function matrixMetaDescription(industry: IndustryPage, state: StateWaiverLawPage): string {
  const enf =
    state.enforceability === "strong"
      ? "generally enforced"
      : state.enforceability === "moderate"
      ? "enforceable with care"
      : "challenging to enforce";
  return `${state.state} ${industry.name.toLowerCase()} waiver guide. Liability waivers are ${enf} in ${state.state}. Free template, state-specific clauses, and pay-per-waiver software starting at 6¢.`;
}

/** Pair-specific intro paragraph — unique per (industry, state) for SEO uniqueness. */
export function matrixIntro(industry: IndustryPage, state: StateWaiverLawPage): string {
  const noun = industry.name.toLowerCase();
  const enf =
    state.enforceability === "strong"
      ? `${state.state} courts have a well-developed body of case law supporting liability waivers, which makes it one of the more favorable states for ${noun} operators.`
      : state.enforceability === "moderate"
      ? `${state.state} enforces waivers when they are drafted carefully, so ${noun} operators need to pay attention to clarity, conspicuousness, and the limits of what a waiver can cover.`
      : `${state.state} is a challenging state for waiver enforcement, which means ${noun} operators must combine waivers with other risk-control measures and avoid relying on a waiver alone.`;
  return `If you operate a ${noun} business in ${state.state}, your liability waiver has to satisfy two different audiences: the customer signing on a phone in 60 seconds, and a ${state.state} judge reading it years later. ${enf} This page combines our ${industry.name} waiver guidance with the specific case law, statutes, and drafting rules that apply in ${state.state}.`;
}

/** Five "what to include" bullets that mix industry fields with state requirements. */
export function matrixChecklist(industry: IndustryPage, state: StateWaiverLawPage): string[] {
  return [
    `${state.state}-compliant assumption-of-risk language that names the specific hazards of ${industry.name.toLowerCase()} (not generic "recreational activity" wording)`,
    `Conspicuous formatting — ${state.state} courts routinely strike waivers with hidden release language; bold headers and a separate signature line are standard`,
    `${industry.fieldsNeeded[0] ?? "Full legal name"}, ${industry.fieldsNeeded[1] ?? "emergency contact"}, and a clear acknowledgment of the activity-specific risks listed above`,
    `Minor handling that matches ${state.state} law — see the parental-consent section below before letting under-18 participants sign`,
    `An explicit carve-out that the waiver does not attempt to release ${state.state}'s gross-negligence standard (overreach is the #1 reason waivers fail)`,
  ];
}

export function matrixFaq(industry: IndustryPage, state: StateWaiverLawPage) {
  const noun = industry.name.toLowerCase();
  return [
    {
      question: `Are ${noun} liability waivers enforceable in ${state.state}?`,
      answer: `${state.enforcementSummary} For ${noun} specifically, the waiver should name the activity-specific hazards rather than relying on generic recreational language.`,
    },
    {
      question: `Can a parent sign a ${noun} waiver for a minor in ${state.state}?`,
      answer: state.minorRules,
    },
    {
      question: `Does ${state.state} require any specific language in a ${noun} waiver?`,
      answer: `${state.rentalSpecific} Combine that with the activity-specific clauses we recommend for ${industry.name.toLowerCase()}.`,
    },
    {
      question: `What happens if a customer is grossly injured in ${state.state}?`,
      answer: state.grossNegligence,
    },
    {
      question: `How much does ${noun} waiver software cost for a ${state.state} operator?`,
      answer: `RentalWaivers is pay-per-waiver starting at 6¢ per signature with no monthly fee. A typical ${state.state} ${noun} operator processing 1,000 waivers a year pays around $80, vs. $228+/year for fixed-monthly competitors like Smartwaiver.`,
    },
  ];
}
