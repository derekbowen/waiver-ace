import type { IndustryPage } from "./industry-pages";

const niches: { slug: string; name: string; activity: string; risk: string; specific: string }[] = [
  { slug: "snowmobile-rental-waiver-software", name: "Snowmobile Rentals", activity: "snowmobile", risk: "high-speed collision, avalanche exposure, frostbite, and rollover injury", specific: "trail-specific hazards, helmet enforcement, alcohol-zero policies, and avalanche briefing acknowledgment" },
  { slug: "paintball-waiver-software", name: "Paintball Fields", activity: "paintball", risk: "eye injury, welts, falls on uneven terrain, and equipment malfunction", specific: "mandatory eye protection enforcement, age-tier rules, marker chrono compliance, and field-specific rules" },
  { slug: "escape-room-waiver-software", name: "Escape Rooms", activity: "escape room", risk: "minor abrasions, claustrophobia distress, allergic reaction to props, and emergency exit confusion", specific: "claustrophobia disclosure, photography/recording prohibition, prop handling rules, and emergency exit acknowledgment" },
  { slug: "trampoline-park-waiver-software", name: "Trampoline Parks", activity: "trampoline park", risk: "fractures, ankle and knee injuries, head impact, and double-bounce collision", specific: "one-jumper-per-trampoline rule, jump sock requirements, age-zone enforcement, and concussion symptom acknowledgment" },
  { slug: "axe-throwing-waiver-software", name: "Axe Throwing Venues", activity: "axe throwing", risk: "lacerations, ricochet impact, shoulder strain, and bystander injury", specific: "closed-toe footwear requirement, sober-only policy, coach instruction compliance, and lane-discipline rules" },
  { slug: "surfboard-rental-waiver-software", name: "Surfboard Rentals", activity: "surfboard rental and surfing", risk: "drowning, board-strike laceration, marine wildlife encounter, and reef contact injury", specific: "swimming ability requirement, leash usage, surf zone hazards, and local wave-condition disclosures" },
  { slug: "segway-tour-waiver-software", name: "Segway Tours", activity: "Segway and personal transporter tour", risk: "falls, collision with pedestrians, traffic exposure, and equipment malfunction", specific: "weight and age limits, helmet wear, guide-instruction compliance, and route-specific traffic hazards" },
  { slug: "drone-rental-waiver-software", name: "Drone Rentals", activity: "drone rental and operation", risk: "property damage, FAA violation liability, third-party injury, and equipment loss or fly-away", specific: "FAA Part 107 acknowledgment, no-fly zone awareness, registration verification, and operator liability assignment" },
  { slug: "climbing-gym-waiver-software", name: "Climbing Gyms", activity: "indoor climbing and bouldering", risk: "falls, finger and tendon injury, belay error, and head impact", specific: "belay test verification, top-rope vs lead climbing tier, falling-zone rules, and child-supervision policy" },
  { slug: "go-kart-rental-waiver-software", name: "Go-Kart Tracks", activity: "go-kart and karting", risk: "collision, whiplash, burn injury, and rollover", specific: "minimum height requirement, helmet wear, no-bumping rules, and flag-instruction compliance" },
  { slug: "zipline-tour-waiver-software", name: "Zipline Tours", activity: "zipline and aerial adventure", risk: "fall from height, harness failure, brake-system injury, and tree or platform impact", specific: "weight-range compliance, harness inspection, guide-instruction adherence, and weather-cancellation policy" },
  { slug: "fitness-class-waiver-software", name: "Fitness Studios", activity: "group fitness, yoga, and personal training", risk: "muscle strain, joint injury, cardiac event, and equipment misuse", specific: "PAR-Q health screening, instructor-modification compliance, recurring-membership consent, and pregnancy disclosure" },
];

export const extraIndustryPages: IndustryPage[] = niches.map((n) => ({
  slug: n.slug,
  name: n.name,
  metaTitle: `${n.name.replace(" Rentals","").replace(" Venues","").replace(" Tours","").replace(" Fields","").replace(" Studios","").replace(" Parks","").replace(" Tracks","").replace(" Gyms","").replace(" Rooms","")} Waiver Software — Digital Liability Waivers, Pay Per Sign`,
  metaDescription: `Digital waiver software built for ${n.name.toLowerCase()}. QR code check-in, group signing, audit trail, and ${n.specific.split(",")[0]}. No monthly fee — pay per waiver.`,
  h1: `Waiver Software for ${n.name}`,
  intro: `${n.name} face a unique liability profile — ${n.risk}. RentalWaivers gives you a fast, legally defensible digital waiver flow purpose-built for ${n.activity} operators: QR code signing at the front desk, group waivers for parties and corporate bookings, automatic minor/guardian handling, and an audit trail that holds up in court. No subscription, no off-season cost — just pay-per-waiver pricing aligned with your real volume.`,
  painPoints: [
    { title: "Generic waiver tools miss your real risks", description: `Off-the-shelf templates don't cover ${n.specific.split(",")[0]} or other ${n.activity}-specific hazards courts expect to see disclosed.` },
    { title: "Front-desk lines kill your throughput", description: `When walk-ins, parties, and corporate bookings arrive simultaneously, clipboard waivers create a 10–20 minute bottleneck. QR-code signing on every guest's phone clears the lobby.` },
    { title: "Minor waivers are a legal minefield", description: `${n.name} typically see lots of minors. Guardian e-signature, age verification, and parental consent must be airtight or your entire release is voidable in many states.` },
    { title: "Subscription pricing punishes seasonal venues", description: `Paying $49–$99/month year-round when you're slow half the year is wasted spend. Pay-per-waiver scales to $0 in your off-season.` },
  ],
  workflow: [
    { step: 1, title: `Customize the ${n.activity} waiver template`, description: `Start from our ${n.activity}-specific template. Add ${n.specific}.` },
    { step: 2, title: "Place QR codes at every entry point", description: "Print branded QR codes for the front desk, kiosk station, and online booking confirmation email. Guests scan and sign on their own phone." },
    { step: 3, title: "Guests sign in 60 seconds", description: "Each participant — including each minor's guardian — signs individually with full name, initials, drawn signature, photo capture (optional), and explicit consent checkboxes." },
    { step: 4, title: "Audit-ready storage forever", description: "Every waiver is stored with timestamp, IP, user-agent, and full audit trail. Search by name, date, group, or booking ID. Export PDFs instantly for insurance or legal requests." },
  ],
  fieldsNeeded: [
    "Full legal name",
    "Date of birth (with auto-calculated age)",
    "Emergency contact name and phone",
    "Guardian name and signature (if minor)",
    `${n.activity} experience level`,
    "Relevant medical conditions",
    "Photography / marketing consent (separate opt-in)",
    `Acknowledgment checkbox for ${n.specific.split(",")[0]}`,
  ],
  useCaseExample: {
    business: `${n.name.replace(" Rentals","").replace(" Venues","").replace(" Tours","").replace(" Fields","").replace(" Studios","").replace(" Parks","").replace(" Tracks","").replace(" Gyms","").replace(" Rooms","")} venue (mid-size, ~12,000 waivers/year)`,
    scenario: `Previously paid $89/month ($1,068/year) for a competing waiver platform plus another $400/year in printing and clipboard supplies for backup paper waivers.`,
    outcome: `Switched to RentalWaivers: 12,000 × ~7¢ = ~$840/year all-in. Saves ~$628/year, eliminated paper entirely, cleared the front-desk line, and reduced minor-waiver disputes to zero by enforcing guardian e-signature at booking.`,
  },
  legalNotes: [
    `Disclose the specific risks of ${n.activity} explicitly — courts disregard generic "all activities have risk" language`,
    `Cannot waive gross negligence, recklessness, or statutory duties in any U.S. state`,
    "Minor waivers are unenforceable or partially enforceable in many states (CT, NJ, UT, WA among others) — collect them anyway, but design operations as if a parent could still sue",
    "Conspicuous-language doctrine: liability terms must be in larger or bolded font, never buried in 8pt paragraph text",
    "Have a licensed attorney in your operating state review the final waiver — this template is a starting point, not legal advice",
  ],
  faqItems: [
    { question: `Is digital waiver software legally binding for ${n.activity}?`, answer: `Yes. Electronic signatures are recognized under the federal E-SIGN Act and state UETA statutes. Every RentalWaivers signature includes timestamp, IP address, device fingerprint, and a tamper-evident audit trail — courts have repeatedly accepted this format.` },
    { question: "How are minor / guardian waivers handled?", answer: "When a date of birth indicates a minor, the form automatically requires a guardian section with the guardian's full legal name, relationship, and a separate drawn signature. Both signatures appear on the final PDF." },
    { question: `What does this cost for a ${n.activity} business?`, answer: `Pricing starts at 6¢ per signed waiver in volume packs. A venue collecting 8,000 waivers/year typically pays $480–$640 — roughly half what a Smartwaiver or WaiverForever subscription costs annually, with $0 in off-season months.` },
    { question: "Can guests sign before they arrive?", answer: "Yes. Send the waiver link in your booking confirmation email or text. Guests sign at home, your front desk just scans them in. Drastically faster check-in for parties and corporate groups." },
    { question: "What happens to old waivers?", answer: "All waivers are retained indefinitely on your account by default. You can export everything to PDF, JSON, or CSV at any time, and bulk-archive on a schedule that matches your insurance carrier's retention requirements." },
  ],
  relatedLanding: n.slug.replace("-waiver-software", "-waivers"),
  relatedTemplate: n.slug.replace("-waiver-software", "-waiver-template"),
  relatedSiblings: ["kayak-rental-waiver-software", "atv-rental-waiver-software", "bounce-house-rental-waiver-software"],
}));

export const extraIndustrySlugs = niches.map((n) => n.slug);
