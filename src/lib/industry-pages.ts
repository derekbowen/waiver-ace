export interface IndustryPage {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  painPoints: { title: string; description: string }[];
  workflow: { step: number; title: string; description: string }[];
  fieldsNeeded: string[];
  useCaseExample: { business: string; scenario: string; outcome: string };
  legalNotes: string[];
  faqItems: { question: string; answer: string }[];
  relatedLanding: string;
  relatedTemplate: string;
  relatedSiblings: string[];
}

export const industryPages: IndustryPage[] = [
  {
    slug: "kayak-rental-waiver-software",
    name: "Kayak Rentals",
    metaTitle: "Kayak Rental Waiver Software — QR Code Waivers for Paddle Sport Operators",
    metaDescription: "Digital waiver software built for kayak rental operators. QR code check-in, group tour waivers, and offline signing. Pay per waiver — no monthly fee.",
    h1: "Waiver Software for Kayak Rental Operators",
    intro: "Kayak rental businesses operate in challenging environments — outdoor locations with spotty cell signal, groups arriving all at once, and seasonal volume swings. RentalWaivers is built for exactly this: fast QR code signing at the launch point, group waivers for tour parties, and zero cost during your off-season.",
    painPoints: [
      { title: "Clipboards don't survive at the water", description: "Paper waivers get wet, blown away, or lost at outdoor rental counters. Digital waivers are immune to weather and accessible from anywhere." },
      { title: "Tour groups create bottlenecks", description: "When a group of 15 shows up, passing around a clipboard takes forever. One group signing link handles everyone in parallel." },
      { title: "Seasonal staff forgets to collect waivers", description: "Summer hires don't always remember the waiver process. Automated waiver delivery and QR codes remove human error from the equation." },
      { title: "Off-season costs shouldn't exist", description: "Paying $49/month from November through March for zero waivers is wasted money. Pay-per-waiver means $0 when you're closed." },
    ],
    workflow: [
      { step: 1, title: "Create your kayak waiver template", description: "Start from our kayak-specific template or paste your existing waiver language. Add fields for swimming ability, experience level, and group size." },
      { step: 2, title: "Print a QR code for your launch point", description: "Generate a QR code and display it at your rental counter, dock, or launch point. Renters scan with their phone — no app needed." },
      { step: 3, title: "Paddlers sign in 60 seconds", description: "Each participant opens the waiver on their phone, reads the terms, and signs with their finger. Full legal name, initials, and drawn signature." },
      { step: 4, title: "Access signed waivers anytime", description: "Every waiver is stored with timestamp, IP address, and audit trail. Search by name, date, or email from your dashboard." },
    ],
    fieldsNeeded: ["Full legal name", "Swimming ability level", "Prior kayaking experience", "Emergency contact", "Number in group", "Medical conditions affecting water activity", "PFD acknowledgment checkbox", "Safety briefing completion checkbox"],
    useCaseExample: { business: "Lake Tahoe Kayak Co.", scenario: "A guided kayak tour company processing 3,000 waivers during their June-September season used to pay $588/year for Smartwaiver ($49/month × 12 months, including 8 idle months).", outcome: "Switched to RentalWaivers and pays $240/year (3,000 × 8¢). Saves $348 annually and pays nothing October through May. QR code at the dock eliminated clipboard bottlenecks during busy Saturday morning launches." },
    legalNotes: [
      "Drowning risk must be specifically disclosed — generic 'water activity' language is insufficient",
      "PFD acknowledgment should be a separate checkbox, not buried in paragraph text",
      "Many states require boater safety education for guided tours — include compliance language",
      "If operating on federal waterways, USCG regulations may apply to your safety requirements",
    ],
    faqItems: [
      { question: "Does RentalWaivers work with spotty cell signal?", answer: "Our signing page is lightweight and works on minimal connectivity. For truly offline locations, our service worker enables offline-capable waiver signing that syncs when connectivity returns." },
      { question: "How do group tour waivers work?", answer: "Create a group signing link and share it with the tour group before arrival. Each participant signs individually on their own phone. You can see completion status in real-time." },
      { question: "What does it cost for a kayak rental shop?", answer: "A seasonal shop processing 2,000 waivers pays about $160/year at 8¢/waiver. Compare that to $588/year for Smartwaiver — and you pay $0 during off-season." },
      { question: "Can I customize the waiver for different locations?", answer: "Yes. Create separate templates for each launch location with site-specific hazards, rules, and equipment information." },
    ],
    relatedLanding: "kayak-rental-waivers",
    relatedTemplate: "kayak-rental-waiver-template",
    relatedSiblings: ["paddleboard-rental-waiver-software", "boat-rental-waiver-software"],
  },
  {
    slug: "bike-rental-waiver-software",
    name: "Bike Rentals",
    metaTitle: "Bike Rental Waiver Software — QR Code Waivers for Bike Shops",
    metaDescription: "Digital waiver software for bike rental shops. QR code check-in, helmet acknowledgment tracking, and e-bike safety waivers. No monthly fee.",
    h1: "Waiver Software for Bike Rental Shops",
    intro: "Urban bike rentals, tourism bike shops, e-bike operators, and cycling tour companies all need fast, reliable waiver collection. RentalWaivers handles the rush — QR code signing at the counter, automatic helmet acknowledgment tracking, and group tour support.",
    painPoints: [
      { title: "Counter rush during peak hours", description: "Weekend mornings and tourist season create lines. QR code signing lets customers sign on their phone while you prep the bikes." },
      { title: "Helmet liability is real", description: "If a renter declines a helmet, you need documentation. A separate helmet acknowledgment checkbox creates clear evidence." },
      { title: "E-bikes require additional disclosures", description: "Electric bikes have different risk profiles than standard bikes. You need e-bike-specific safety language in your waivers." },
      { title: "Bike tour groups need fast processing", description: "A tour group of 20 can't wait 30 minutes for clipboard waivers. Group signing handles them all simultaneously." },
    ],
    workflow: [
      { step: 1, title: "Build your bike rental waiver", description: "Use our bike rental template with helmet acknowledgment, traffic law compliance, and equipment responsibility clauses." },
      { step: 2, title: "Display QR code at your shop counter", description: "Print a QR code and display it prominently. Customers scan while you adjust seat heights and check brakes." },
      { step: 3, title: "Riders sign on their phone", description: "Each rider signs individually — full name, helmet checkbox, and drawn signature. Under 60 seconds per person." },
      { step: 4, title: "All waivers stored securely", description: "Search by rider name, date, or bike number. Download PDFs for insurance claims instantly." },
    ],
    fieldsNeeded: ["Full legal name", "Height (for bike sizing)", "Helmet acceptance/decline checkbox", "Experience level", "Bike unit assigned", "Rental duration", "Emergency contact", "Route plan (for guided tours)"],
    useCaseExample: { business: "Coastal Bike Rentals, San Diego", scenario: "A beachfront bike rental shop processes about 200 waivers per month during summer and near zero in winter. Previously paid $18/month to WaiverSign year-round ($216/year).", outcome: "Switched to RentalWaivers: 800 summer waivers × 10¢ = $80/year. Saves $136 annually. The QR code at the counter eliminated the clipboard queue and the helmet checkbox reduced helmet-related liability concerns." },
    legalNotes: [
      "Helmet laws vary by state and municipality — include applicable local requirements",
      "E-bikes may require specific disclosures about motor-assisted speed and battery safety",
      "Traffic law compliance language should reference your specific city/state regulations",
      "For bike tours, include guide instruction compliance language",
    ],
    faqItems: [
      { question: "Does this handle e-bike waivers?", answer: "Yes. Create an e-bike-specific template with additional clauses for motor safety, speed limitations, and battery handling. You can run both e-bike and standard bike templates from one dashboard." },
      { question: "How does the helmet checkbox work?", answer: "Add a required checkbox field where renters either accept or decline a helmet. This creates a clear, timestamped record of the helmet offer — critical for liability protection." },
      { question: "Can I track which bike was assigned to which renter?", answer: "Yes. Add a custom 'Bike Number' field to your template. This links each signed waiver to the specific equipment rented." },
      { question: "What about bike delivery rentals?", answer: "Send the waiver link via email or text when the customer books. They sign before delivery arrives — no in-person interaction needed." },
    ],
    relatedLanding: "bike-rental-waivers",
    relatedTemplate: "bike-rental-waiver-template",
    relatedSiblings: ["scooter-rental-waiver-software", "kayak-rental-waiver-software"],
  },
  {
    slug: "boat-rental-waiver-software",
    name: "Boat Rentals",
    metaTitle: "Boat Rental Waiver Software — Digital Waivers for Marina Operators",
    metaDescription: "Waiver software for boat rental and marina businesses. Verify boater certifications, manage passenger waivers, and store records securely. Pay per waiver.",
    h1: "Waiver Software for Boat Rental & Marina Operations",
    intro: "Marina operators, pontoon rental companies, and fishing charter businesses handle complex liability — multiple passengers per vessel, boater certification requirements, and high-value equipment. RentalWaivers simplifies the entire process.",
    painPoints: [
      { title: "Multiple passengers per boat", description: "Every person on the vessel needs a waiver. Group signing handles entire boat parties with one shared link." },
      { title: "Boater certification verification", description: "Many states require boater safety certificates. Include certification fields in your waiver to document compliance." },
      { title: "Marina environments destroy paper", description: "Salt water, wind, and sun destroy paper waivers within weeks. Digital storage is permanent and weather-proof." },
      { title: "Insurance claims need fast access", description: "When an incident happens, you need the signed waiver immediately. Instant digital search beats digging through waterlogged filing cabinets." },
    ],
    workflow: [
      { step: 1, title: "Create your boat rental waiver", description: "Include boater certification verification, passenger list, life jacket acknowledgment, and navigation rule compliance." },
      { step: 2, title: "Send when customers book", description: "Integrate with your marina booking system to auto-send waivers on reservation. Renters sign before they arrive at the dock." },
      { step: 3, title: "All passengers sign", description: "Each passenger signs individually via the group link. The captain/renter signs the equipment responsibility section." },
      { step: 4, title: "Records stored for 7+ years", description: "Access any waiver instantly. Filter by vessel, date, or renter name. Download PDFs for insurance or legal needs." },
    ],
    fieldsNeeded: ["Captain/renter full legal name", "Boater safety certificate number", "Number of passengers", "Passenger names (via group signing)", "Vessel assigned (name/hull number)", "Life jacket acknowledgment", "Trip plan/destination area", "Emergency contact"],
    useCaseExample: { business: "Sunset Marina Pontoon Rentals, Lake of the Ozarks", scenario: "A pontoon rental business rents 20 boats daily during summer, averaging 6 passengers each. That's 120 individual waivers daily, 3,600 per month during peak season.", outcome: "Using RentalWaivers group signing: captain receives the link at booking, shares with passengers, and everyone signs before arriving at the dock. Cost: 14,000 seasonal waivers × 6¢ = $840. Previous Smartwaiver cost: $3,120/year ($260/month × 12). Annual savings: $2,280." },
    legalNotes: [
      "Most states require boater safety certification for motorboat operation — verify and document",
      "USCG regulations apply to vessels on navigable waterways — include compliance language",
      "Life jacket requirements vary by state, especially for children — include state-specific age thresholds",
      "For captained charters, liability dynamics differ — consult your maritime attorney",
    ],
    faqItems: [
      { question: "How do passenger waivers work for boat rentals?", answer: "Create a group signing link for each booking. The captain shares it with all passengers. Each person signs individually on their own phone with their own name and signature." },
      { question: "Can I verify boater safety certifications?", answer: "Add a certification number field to your waiver. Renters enter their certificate number which is recorded in the audit trail. Visual verification at dock checkout adds an additional layer." },
      { question: "What about fishing charter operations?", answer: "Create a separate template for charters with specific fishing equipment liability, captain authority, and catch policy language." },
      { question: "How much does this cost for a busy marina?", answer: "A marina processing 10,000 seasonal waivers pays about $600–$800/year depending on credit package. Compare that to $3,120/year for Smartwaiver's highest tier." },
    ],
    relatedLanding: "boat-rental-waivers",
    relatedTemplate: "boat-rental-waiver-template",
    relatedSiblings: ["jet-ski-rental-waiver-software", "kayak-rental-waiver-software"],
  },
];

// Add remaining industries with shorter data (still complete pages)
const additionalIndustries: IndustryPage[] = [
  "jet-ski-rental-waiver-software", "atv-rental-waiver-software", "scooter-rental-waiver-software",
  "paddleboard-rental-waiver-software", "equipment-rental-waiver-software", "bounce-house-rental-waiver-software",
  "ski-rental-waiver-software", "golf-cart-rental-waiver-software", "rv-rental-waiver-software",
  "horse-rental-waiver-software", "tool-rental-waiver-software", "party-rental-waiver-software",
].map((slug) => {
  const name = slug.replace("-waiver-software", "").split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const landing = slug.replace("-waiver-software", "-waivers").replace("-rental", "-rental");
  const template = slug.replace("-waiver-software", "-waiver-template").replace("-rental", "-rental");
  return {
    slug,
    name: `${name} Rentals`,
    metaTitle: `${name} Rental Waiver Software — Digital Waivers, No Monthly Fee`,
    metaDescription: `Waiver software for ${name.toLowerCase()} rental businesses. QR code check-in, group signing, audit trails. Pay per waiver — no subscription.`,
    h1: `Waiver Software for ${name} Rental Businesses`,
    intro: `${name} rental operators need fast, reliable waiver collection that doesn't break the bank during off-season. RentalWaivers delivers QR code signing, group waivers, and secure storage — all with pay-per-waiver pricing that aligns with your seasonal business model.`,
    painPoints: [
      { title: "Seasonal volume means wasted subscription fees", description: `${name} rental businesses are seasonal. Paying $49/month for waiver software during months you're closed is money thrown away. RentalWaivers charges $0 when you're not collecting waivers.` },
      { title: "Check-in speed matters", description: "Customers arrive excited and ready to go. Clipboard waivers create bottlenecks. QR code signing gets waivers done on their phone in under 60 seconds." },
      { title: "Paper gets lost or damaged", description: "Outdoor rental environments are hostile to paper. Digital waivers are stored securely in the cloud, accessible from anywhere, forever." },
      { title: "Group bookings need better tooling", description: "Family and group rentals mean multiple signers. One group signing link handles any party size — each person signs individually." },
    ],
    workflow: [
      { step: 1, title: "Create your waiver template", description: `Use our ${name.toLowerCase()}-specific template or build your own. Add industry-relevant custom fields and safety acknowledgments.` },
      { step: 2, title: "Set up QR code check-in", description: "Print a QR code for your rental counter. Customers scan and sign on their phone while you prep equipment." },
      { step: 3, title: "Collect signatures", description: "Each participant signs with full legal name, initials, and drawn signature. Under 60 seconds per person." },
      { step: 4, title: "Manage from your dashboard", description: "Search, download, and manage all signed waivers. Full audit trails with timestamps and IP addresses." },
    ],
    fieldsNeeded: ["Full legal name", "Date of birth", "Emergency contact", "Experience level", "Equipment assigned", "Safety briefing acknowledgment", "Medical conditions", "Group size"],
    useCaseExample: { business: `${name} Adventure Co.`, scenario: `A ${name.toLowerCase()} rental business processing 1,500 waivers during their busy season previously paid $588/year for subscription waiver software.`, outcome: `Switched to RentalWaivers: 1,500 × 8¢ = $120/year. Saves $468 annually and pays $0 during off-season.` },
    legalNotes: [
      `Include specific risks associated with ${name.toLowerCase()} activities`,
      "Waivers must be clear and conspicuous — don't bury liability language",
      "Cannot waive gross negligence or willful misconduct in any state",
      "Have a state-licensed attorney review your waiver for local compliance",
    ],
    faqItems: [
      { question: `How much does waiver software cost for ${name.toLowerCase()} rentals?`, answer: `Pay-per-waiver starting at 6¢. A typical ${name.toLowerCase()} rental shop processing 1,000 waivers/year pays about $80. No monthly fees.` },
      { question: "Do I need separate waivers for different activities?", answer: "We recommend separate templates for activities with different risk profiles. You can manage multiple templates from one dashboard." },
      { question: "Can customers sign before they arrive?", answer: "Yes! Send waivers via email when customers book. They sign on their phone before showing up, eliminating check-in delays." },
      { question: "Is this legally binding?", answer: "Yes. Electronic signatures are legally binding under the E-SIGN Act and UETA. Every waiver includes timestamps, IP addresses, and device information for legal defensibility." },
    ],
    relatedLanding: landing,
    relatedTemplate: template,
    relatedSiblings: ["kayak-rental-waiver-software", "bike-rental-waiver-software"],
  } as IndustryPage;
});

import { extraIndustryPages } from "./industry-pages-extra";

export const allIndustryPages = [...industryPages, ...additionalIndustries, ...extraIndustryPages];

export function getIndustryPage(slug: string): IndustryPage | undefined {
  return allIndustryPages.find((p) => p.slug === slug);
}
