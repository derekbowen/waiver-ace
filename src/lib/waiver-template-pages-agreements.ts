import type { WaiverTemplatePage } from "./waiver-template-pages";

export const agreementTemplatePages: WaiverTemplatePage[] = [
  {
    slug: "rental-agreement-template",
    name: "Rental Agreement",
    metaTitle: "Free Rental Agreement Template — Lease & Rental Contract (2026)",
    metaDescription:
      "Free rental agreement template covering term, rent, deposit, use rules, damage and termination. Works as a short-term rental contract or residential lease agreement. Customize and sign online.",
    h1: "Rental Agreement Template",
    intro:
      "This rental agreement template gives you a clean, plain-English contract between an owner and a renter. It works for short-term and vacation rentals, month-to-month residential leases, and equipment or venue rentals. It covers the terms that actually cause disputes — rent and payment timing, security deposits, occupancy limits, damage responsibility, cancellation, and termination — and pairs naturally with a liability waiver so you have both the contract and the release on file before check-in.",
    risks: [
      "Unpaid rent or bounced payments",
      "Property damage beyond normal wear and tear",
      "Unauthorized occupants, guests, subletting, or parties",
      "Overstays and failure to vacate at the end of the term",
      "Disputes over security deposit deductions",
      "Pet damage, smoking, or violation of house rules",
      "Injury claims not covered by the agreement alone",
    ],
    clauses: [
      {
        title: "Parties & Property",
        text: "This Rental Agreement is entered into between [Business Name / Owner] (\"Owner\") and the undersigned renter (\"Renter\") for the property, unit, or equipment described as [Property Address / Item Description]. Renter confirms all information provided is accurate and that Renter is at least 18 years of age.",
      },
      {
        title: "Term of Rental",
        text: "The rental term begins on [Start Date] at [Check-In Time] and ends on [End Date] at [Check-Out Time]. For month-to-month tenancies, the agreement renews automatically each month until terminated by either party with [30] days' written notice. Holding over beyond the end of the term without Owner's written consent authorizes Owner to charge [Holdover Rate] per day.",
      },
      {
        title: "Rent, Fees & Payment Terms",
        text: "Renter agrees to pay [Rent Amount] for the rental term, due on [Due Date] by [Payment Method]. Additional fees may include a cleaning fee of [Amount], a pet fee of [Amount], and applicable taxes. Payments more than [5] days late incur a late fee of [Amount]. Returned or failed payments incur a [Amount] processing fee.",
      },
      {
        title: "Security Deposit",
        text: "Renter shall provide a security deposit of [Amount], held by Owner to cover unpaid rent, damage beyond normal wear and tear, excessive cleaning, and lost keys or equipment. Owner will return the deposit, less any itemized deductions, within [state-required number] days after the end of the term. The deposit is not a substitute for the final rent payment.",
      },
      {
        title: "Use of Property & House Rules",
        text: "The property may be used only as a [residence / short-term lodging / rental of the described equipment]. Maximum occupancy is [Number] persons. Renter agrees to comply with all posted house rules, quiet hours, parking limits, HOA or building regulations, and applicable laws. Events, parties, commercial filming, subletting, and re-listing the property are prohibited without Owner's prior written consent.",
      },
      {
        title: "Condition, Maintenance & Damage Responsibility",
        text: "Renter accepts the property and any included equipment in its current condition and agrees to report existing damage within [24] hours of check-in. Renter is financially responsible for any loss, damage, or destruction caused by Renter, Renter's guests, or invitees beyond normal wear and tear, including the cost of repair or replacement and any lost rental income during repairs.",
      },
      {
        title: "Pets, Smoking & Prohibited Conduct",
        text: "Smoking, vaping, and use of illegal substances are prohibited on the property. Pets are [permitted with prior written approval and a pet fee / not permitted]. Violations authorize Owner to charge remediation costs, including deep cleaning and odor removal, and may result in immediate termination of the rental.",
      },
      {
        title: "Cancellation & Refund Policy",
        text: "Cancellations made more than [Number] days before the start date receive a [Percentage]% refund. Cancellations within [Number] days are non-refundable. If Owner cancels for reasons other than Renter's breach, Renter receives a full refund of all amounts paid as Renter's sole remedy.",
      },
      {
        title: "Termination & Default",
        text: "Owner may terminate this agreement immediately upon Renter's non-payment, material breach of the house rules, unlawful activity, or conduct that endangers persons or property, subject to any notice period required by applicable state or local law. Upon termination, Renter shall promptly vacate and return all keys, access devices, and rented items.",
      },
      {
        title: "Liability, Insurance & Indemnification",
        text: "Owner is not liable for loss of or damage to Renter's personal property, or for injury arising from Renter's use of the property, except to the extent caused by Owner's gross negligence or willful misconduct. Renter agrees to indemnify and hold Owner harmless from third-party claims arising from Renter's use of the property. Renter is encouraged to maintain renter's or travel insurance. This agreement is separate from, and does not replace, any liability waiver Renter signs.",
      },
      {
        title: "Entry & Access",
        text: "Owner may enter the property for inspection, maintenance, repairs, or to show the property, with reasonable advance notice as required by applicable law, or without notice in an emergency.",
      },
      {
        title: "Governing Law, Severability & Entire Agreement",
        text: "This agreement is governed by the laws of the state where the property is located. If any provision is found unenforceable, the remaining provisions remain in full effect. This document, together with any attached rules, addenda, and signed waiver, constitutes the entire agreement between the parties and supersedes all prior discussions.",
      },
    ],
    customFields: [
      "Renter full legal name and date of birth",
      "Renter email, phone, and mailing address",
      "Government-issued ID number or verification",
      "Property address, unit, or equipment description",
      "Rental start and end dates with check-in/check-out times",
      "Rent amount, due date, and payment method",
      "Security deposit amount",
      "Number of occupants and names of all adult guests",
      "Vehicle make, model, and plate for parking",
      "Pet details (type, breed, weight) if permitted",
      "Emergency contact name and phone",
      "Booking or reservation ID",
      "Signature, date, and timestamp",
    ],
    bestPractices: [
      "Send the rental agreement and liability waiver together before check-in — one link, both signed, both timestamped",
      "Spell out security deposit deduction categories; vague deposit language is the number-one source of disputes",
      "Match notice periods and deposit return windows to your state's landlord-tenant statute",
      "Name every adult occupant on the agreement, not just the person who booked",
      "Attach the house rules as a numbered addendum and require a separate initial or checkbox",
      "Document condition with dated photos at check-in and check-out and reference them in the agreement",
      "Use a fresh agreement for each booking rather than reusing an old signed copy",
      "Have a licensed attorney in your state review residential leases — tenancy law is far stricter than short-term rental law",
    ],
    faqItems: [
      {
        question: "Is this rental agreement template free?",
        answer:
          "Yes. Download and customize it for free. If you want renters to sign it online with a legal audit trail, RentalWaivers costs about 6¢ per signature with no monthly subscription, and your first 250 signatures are free.",
      },
      {
        question: "What's the difference between a rental agreement and a lease agreement?",
        answer:
          "A lease agreement usually locks in a fixed term, commonly 6 or 12 months, and both sides are committed for that period. A rental agreement is typically shorter or month-to-month and renews automatically until either side gives notice. The clauses in this template cover both — you set the term in the Term of Rental section.",
      },
      {
        question: "Can I use this for a short-term or vacation rental?",
        answer:
          "Yes. It's written to work for Airbnb, Vrbo, and direct bookings: set the check-in and check-out dates, keep the cancellation and house rules sections, and pair it with a liability waiver for pools, hot tubs, or other amenities.",
      },
      {
        question: "Do I still need a liability waiver if I have a rental agreement?",
        answer:
          "In most cases yes. The rental agreement is a contract about money, term, and use. A liability waiver is a release covering injury risk. If your property has a pool, hot tub, dock, trampoline, gym, or rented equipment, use both.",
      },
      {
        question: "Is an electronically signed rental agreement legally binding?",
        answer:
          "Yes. Under the federal ESIGN Act and state UETA laws, an electronic signature carries the same weight as ink when you can show who signed, what they saw, and when. RentalWaivers records the signer's identity, IP address, timestamp, and the exact document version.",
      },
      {
        question: "Can a parent sign for a renter under 18?",
        answer:
          "A minor generally cannot be held to a rental contract. Put the adult renter's name on the agreement as the responsible party, and have a parent or guardian sign for any minor who is covered by an accompanying waiver.",
      },
      {
        question: "Should I have a lawyer review it?",
        answer:
          "For short-term rentals this template is a strong starting point. For residential tenancies, have a licensed attorney in your state review it — required disclosures, deposit limits, and notice periods differ in every state and some cities add their own rules.",
      },
    ],
    relatedIndustry: "vacation-rental-waivers",
    relatedTemplates: [
      "rv-rental-waiver-template",
      "equipment-rental-waiver-template",
      "boat-rental-waiver-template",
    ],
  },
];
