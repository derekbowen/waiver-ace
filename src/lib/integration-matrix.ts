// Cross-joins for the integration page network:
//   platform × industry  -> /integrations/:platformSlug/:industrySlug
//   platform × state     -> /integrations/:platformSlug/state/:stateSlug

import { integrationPlatforms, getIntegrationPlatform, type IntegrationPlatform } from "./integration-pages";
import { allIndustryPages, getIndustryPage, type IndustryPage } from "./industry-pages";
import { stateWaiverLawPages, getStateLawPage, type StateWaiverLawPage } from "./state-waiver-laws";

export interface IntegrationIndustryPair {
  platform: IntegrationPlatform;
  industry: IndustryPage;
}
export interface IntegrationStatePair {
  platform: IntegrationPlatform;
  state: StateWaiverLawPage;
}

export function getIntegrationIndustryPair(platformSlug: string, industrySlug: string): IntegrationIndustryPair | undefined {
  const platform = getIntegrationPlatform(platformSlug);
  const industry = getIndustryPage(industrySlug);
  if (!platform || !industry) return undefined;
  return { platform, industry };
}

export function getIntegrationStatePair(platformSlug: string, stateSlug: string): IntegrationStatePair | undefined {
  const platform = getIntegrationPlatform(platformSlug);
  const state = getStateLawPage(stateSlug);
  if (!platform || !state) return undefined;
  return { platform, state };
}

export function listIntegrationIndustrySlugs() {
  const out: { platformSlug: string; industrySlug: string }[] = [];
  for (const p of integrationPlatforms) for (const i of allIndustryPages) out.push({ platformSlug: p.slug, industrySlug: i.slug });
  return out;
}

export function listIntegrationStateSlugs() {
  const out: { platformSlug: string; stateSlug: string }[] = [];
  for (const p of integrationPlatforms) for (const s of stateWaiverLawPages) out.push({ platformSlug: p.slug, stateSlug: s.slug });
  return out;
}

/* ---------- unique copy generators ---------- */

export function platformIndustryTitle(p: IntegrationPlatform, i: IndustryPage) {
  return `${p.name} Waiver Integration for ${i.name} — Auto-Send Liability Waivers | RentalWaivers`;
}

export function platformIndustryDescription(p: IntegrationPlatform, i: IndustryPage) {
  return `Connect ${p.name} to RentalWaivers and send a signed liability waiver automatically for every ${i.name.toLowerCase()} booking. Prefilled guest details, minors and guardian consent, tamper-proof PDF. 6¢ per waiver, no monthly fee.`;
}

export function platformIndustryIntro(p: IntegrationPlatform, i: IndustryPage) {
  return `${i.name} operators running ${p.name} already have the booking data — guest name, email, and dates all sit in the reservation. What ${p.name} does not give you is a signed release of liability. RentalWaivers closes that gap: when ${p.trigger}, the waiver goes out automatically, prefilled from ${p.name}, and comes back as a tamper-proof PDF with the timestamp, IP address and device of whoever signed it. For ${i.name.toLowerCase()}, that record is the difference between a claim you can defend and one you cannot.`;
}

export function platformIndustryFaq(p: IntegrationPlatform, i: IndustryPage) {
  return [
    {
      question: `Does ${p.name} collect liability waivers for ${i.name.toLowerCase()}?`,
      answer: `No. ${p.name} is ${p.category.toLowerCase()} — it handles bookings, messaging and agreements. ${p.gaps[0]}. RentalWaivers adds the signed waiver layer on top without changing how you work in ${p.name}.`,
    },
    {
      question: `How does the ${p.name} waiver integration work?`,
      answer: `RentalWaivers connects through ${p.connectionMethod}. When ${p.trigger}, we send the signing link to the customer with their details already filled in. They sign on their phone in about 60 seconds.`,
    },
    {
      question: `What does a ${i.name.toLowerCase()} waiver need to cover?`,
      answer: i.legalNotes.slice(0, 2).join(". ") + ". All of this can be built into the template that sends from your " + p.name + " bookings.",
    },
    {
      question: `What does it cost on top of ${p.name}?`,
      answer: `6¢ per signed waiver, no monthly fee, and your first 250 signatures are free. If you have a slow season, you pay nothing during it — unlike subscription waiver tools at $18–$260 a month.`,
    },
    {
      question: `Can minors in the party be covered?`,
      answer: `Yes. The waiver can require each minor to be named with their age, plus a guardian attestation from the signing adult — something a ${p.name} reservation record has no field for.`,
    },
  ];
}

export function platformStateTitle(p: IntegrationPlatform, s: StateWaiverLawPage) {
  return `${p.name} Liability Waivers in ${s.state} — Automatic Signing for Every Booking | RentalWaivers`;
}

export function platformStateDescription(p: IntegrationPlatform, s: StateWaiverLawPage) {
  return `Using ${p.name} in ${s.state}? Auto-send a state-aware liability waiver on every booking. ${s.state} waiver rules, prefilled guest data, tamper-proof PDFs, 6¢ per waiver with no monthly fee.`;
}

export function platformStateIntro(p: IntegrationPlatform, s: StateWaiverLawPage) {
  const enf =
    s.enforceability === "strong"
      ? `${s.state} courts generally uphold well-drafted liability waivers, so a clean signed record is genuinely worth having.`
      : s.enforceability === "moderate"
      ? `${s.state} courts will enforce liability waivers when the language is clear and conspicuous, so wording and proof of signature both matter.`
      : `${s.state} is a harder state for waivers, which makes the quality of your document and your proof of signature even more important.`;
  return `${enf} If you run bookings through ${p.name}, the waiver should never be a manual step. RentalWaivers connects through ${p.connectionMethod} and sends the signing link the moment ${p.trigger} — with the guest's name, email and stay dates already filled in, and a ${s.state}-appropriate template behind it.`;
}

export function platformStateFaq(p: IntegrationPlatform, s: StateWaiverLawPage) {
  return [
    {
      question: `Are liability waivers enforceable in ${s.state}?`,
      answer: `${s.state} treats waivers as ${s.enforceability === "strong" ? "generally enforceable for ordinary negligence when clearly written" : s.enforceability === "moderate" ? "enforceable when the release language is clear, conspicuous and specific" : "difficult to enforce, with meaningful limits courts apply"}. No waiver protects against gross negligence or willful misconduct anywhere. Have an attorney licensed in ${s.state} review your final wording.`,
    },
    {
      question: `Does ${p.name} send waivers in ${s.state} automatically?`,
      answer: `Not on its own — ${p.name} is ${p.category.toLowerCase()}. With RentalWaivers connected, the waiver sends automatically when ${p.trigger}.`,
    },
    {
      question: `Is an electronic signature valid in ${s.state}?`,
      answer: `Electronic signatures are recognized under the federal E-SIGN Act and ${s.state}'s adoption of UETA-style rules. RentalWaivers records the signature with a timestamp, IP address and device fingerprint so you can prove who signed and when.`,
    },
    {
      question: `What does it cost?`,
      answer: `6¢ per signed waiver with no monthly fee, plus 250 free signatures to start. Works alongside your existing ${p.name} plan.`,
    },
  ];
}
