// Programmatic SEO: rental / property-management software integrations.
// URL patterns:
//   /integrations
//   /integrations/:platformSlug
//   /integrations/:platformSlug/:industrySlug
//   /integrations/:platformSlug/state/:stateSlug

export interface IntegrationPlatform {
  slug: string;
  name: string;
  category: string;
  audience: string;
  /** How the booking data reaches RentalWaivers. */
  connectionMethod: string;
  trigger: string;
  /** Distinctive facts used to keep each page unique. */
  strengths: string[];
  gaps: string[];
  fieldsMapped: string[];
  workflow: { step: number; title: string; description: string }[];
  faqExtra: { question: string; answer: string }[];
}

const PLATFORMS: IntegrationPlatform[] = [
  {
    slug: "guesty",
    name: "Guesty",
    category: "Vacation rental property management platform",
    audience: "professional short-term rental managers running 20 to 2,000+ listings",
    connectionMethod: "a direct Guesty API connection with OAuth token refresh, plus reservation webhooks",
    trigger: "a reservation moves to confirmed",
    strengths: [
      "Native two-way connection: RentalWaivers reads the reservation and writes back to Guesty",
      "Adds a \"Waiver pending\" tag on send and a \"Waiver signed\" tag on completion",
      "Attaches the signed PDF link as a reservation note so your team sees it in the Guesty inbox",
      "Prefills the guest's name, email, check-in and check-out dates on the waiver",
    ],
    gaps: [
      "Guesty does not collect liability waivers natively — rental agreements are not waivers",
      "Guesty's guest portal cannot record a drawn signature with an IP and timestamp audit trail",
      "Minors and guardian attestation have nowhere to live in a standard Guesty reservation",
    ],
    fieldsMapped: ["Guest full name", "Guest email", "Guest phone", "Check-in date (rental date)", "Check-out date", "Listing / property name", "Confirmation code", "Number of guests"],
    workflow: [
      { step: 1, title: "Connect Guesty", description: "Authorize RentalWaivers from your integrations page. We store an OAuth token and refresh it automatically — no API keys to rotate by hand." },
      { step: 2, title: "Pick the waiver template", description: "Choose which waiver template goes out, and map the check-in date into the {{rental_date}} field so each waiver shows the guest's real stay." },
      { step: 3, title: "Reservation confirms, waiver sends", description: "The moment a reservation is confirmed, the signing link emails the guest and the reservation is tagged \"Waiver pending\"." },
      { step: 4, title: "Signed PDF lands back in Guesty", description: "When the guest signs, the tag flips to \"Waiver signed\" and the tamper-proof PDF link is added as a reservation note." },
    ],
    faqExtra: [
      { question: "Does this use the official Guesty API?", answer: "Yes. RentalWaivers connects through Guesty's Open API with OAuth, listens to reservation webhooks, and writes tags and notes back to the reservation." },
      { question: "Can I hold door codes until the waiver is signed?", answer: "Yes. Because Guesty tags the reservation \"Waiver signed\", you can gate your check-in message on that tag in your Guesty automation rules." },
    ],
  },
  {
    slug: "hostaway",
    name: "Hostaway",
    category: "Short-term rental management and channel manager",
    audience: "growing STR managers who live inside Hostaway's unified inbox and automations",
    connectionMethod: "Hostaway's API with a reservation webhook, or a no-code Zapier/Make connection",
    trigger: "a new or modified reservation is created with status \"new\"",
    strengths: [
      "Fires off the same automation layer you already use for check-in messaging",
      "Guest name, email and arrival date prefill the waiver so guests just read and sign",
      "Works alongside Hostaway's rental agreement instead of replacing it",
    ],
    gaps: [
      "Hostaway's rental agreement e-sign captures acceptance, not a drawn signature with a forensic audit trail",
      "No native place to list minors in the party or capture guardian consent",
      "Agreements live per-listing, so amenity-specific risk language gets copied and drifts",
    ],
    fieldsMapped: ["Guest name", "Guest email", "Arrival date", "Departure date", "Listing name", "Reservation ID", "Channel (Airbnb, Vrbo, direct)"],
    workflow: [
      { step: 1, title: "Create an API key in Hostaway", description: "Generate a Hostaway API key and paste it into RentalWaivers, or connect through Zapier if you prefer no-code." },
      { step: 2, title: "Map the reservation fields", description: "Point guest name, email, and arrival date at your waiver's merge fields, including {{rental_date}}." },
      { step: 3, title: "Waiver sends on booking", description: "Each new reservation triggers the signing link by email; guests sign on their phone in about 60 seconds." },
      { step: 4, title: "Track completion", description: "Your RentalWaivers dashboard shows sent, signed, and expired for every reservation so nobody checks in unsigned." },
    ],
    faqExtra: [
      { question: "Will this conflict with Hostaway's rental agreement?", answer: "No. The rental agreement covers the terms of the stay; the waiver covers injury risk on your property. Most managers send both." },
      { question: "Can I use Zapier instead of the API?", answer: "Yes. A Hostaway \"new reservation\" trigger into the RentalWaivers send-waiver action works without writing any code." },
    ],
  },
  {
    slug: "lodgify",
    name: "Lodgify",
    category: "Vacation rental website builder and booking engine",
    audience: "hosts and small managers taking direct bookings from their own Lodgify website",
    connectionMethod: "Lodgify's public API or a Zapier/Make automation on the booking event",
    trigger: "a direct booking is confirmed on your Lodgify site",
    strengths: [
      "Direct bookings mean you own the guest email — waivers deliver reliably, no platform relay address",
      "Pairs naturally with Lodgify's rental agreement step at checkout",
      "Great fit for owners with pools and hot tubs marketed heavily on their own site",
    ],
    gaps: [
      "Lodgify has no liability waiver feature — only booking terms and rental agreements",
      "Channel bookings relayed through Airbnb can hide the real guest email until you ask for it",
      "No audit trail suitable for defending an injury claim years later",
    ],
    fieldsMapped: ["Guest name", "Guest email", "Arrival date", "Departure date", "Property name", "Booking ID", "Number of guests"],
    workflow: [
      { step: 1, title: "Turn on the Lodgify API", description: "Create an API key in your Lodgify account settings and connect it to RentalWaivers." },
      { step: 2, title: "Choose your waiver", description: "Pick the template for the property type — pool home, lakefront, ski chalet — and set the rental date field." },
      { step: 3, title: "Send at booking confirmation", description: "The waiver link goes out with or right after your booking confirmation, long before door codes." },
      { step: 4, title: "Store and search", description: "Signed waivers are stored as tamper-proof PDFs, searchable by guest name or date." },
    ],
    faqExtra: [
      { question: "Can the waiver be part of my Lodgify checkout?", answer: "The cleanest flow is to send the waiver immediately after booking confirmation by email; the guest signs on their phone without leaving the confirmation." },
      { question: "What about bookings that come from Airbnb through Lodgify?", answer: "Those arrive with a relay email. Waivers still deliver, and Airbnb forwards the message to the guest." },
    ],
  },
  {
    slug: "ownerrez",
    name: "OwnerRez",
    category: "Vacation rental management, booking and channel software",
    audience: "owner-operators and small managers who rely on OwnerRez templates and triggers",
    connectionMethod: "an OwnerRez webhook or API connection on the booking event",
    trigger: "a booking is created or a booking is marked as confirmed",
    strengths: [
      "OwnerRez's trigger system makes timing easy — send at booking, resend 7 days before arrival",
      "Merge-field discipline in OwnerRez maps cleanly onto waiver merge fields",
      "Owners already using OwnerRez e-sign renter agreements adopt waivers with almost no training",
    ],
    gaps: [
      "OwnerRez renter agreements are contracts for the stay, not releases of liability for injury",
      "Guardian consent for minors is not part of the standard agreement flow",
      "Amenity risk language (hot tub, dock, stairs) must be maintained manually in every template",
    ],
    fieldsMapped: ["Guest first and last name", "Guest email", "Arrival date", "Departure date", "Property", "Booking ID", "Adults and children counts"],
    workflow: [
      { step: 1, title: "Add the RentalWaivers webhook", description: "Point an OwnerRez booking webhook at RentalWaivers, or connect via API key." },
      { step: 2, title: "Map fields including children", description: "OwnerRez already tracks adults and children counts — use that to prompt guests to name the minors in their party." },
      { step: 3, title: "Waiver sends automatically", description: "Guests receive the signing link at booking and a reminder before arrival if they have not signed." },
      { step: 4, title: "Confirm before check-in", description: "Your dashboard flags any arrival in the next 48 hours without a signed waiver." },
    ],
    faqExtra: [
      { question: "Does this replace my OwnerRez renter agreement?", answer: "No — keep it. The renter agreement covers payment and house rules; the waiver covers injury liability. They do different jobs." },
      { question: "Can I send the waiver only for pool properties?", answer: "Yes. Map different waiver templates to different OwnerRez properties." },
    ],
  },
  {
    slug: "hospitable",
    name: "Hospitable",
    category: "Short-term rental messaging and operations automation",
    audience: "Airbnb-heavy hosts who run everything through Hospitable's messaging rules",
    connectionMethod: "a Hospitable automation or Zapier/Make step that calls the RentalWaivers send action",
    trigger: "booking confirmed, or a scheduled message X days before check-in",
    strengths: [
      "Hospitable's message scheduling means you can place the waiver exactly where guests are paying attention",
      "The signing link drops straight into the Airbnb thread, so no email deliverability worries",
      "Ideal for hosts who want door codes released only after the waiver is signed",
    ],
    gaps: [
      "Hospitable does not store signed documents or produce a legal audit trail",
      "A guest replying \"I agree\" in a message thread is far weaker evidence than a signed waiver",
      "No structured place for minors, guardians, or amenity-specific acknowledgments",
    ],
    fieldsMapped: ["Guest first name", "Guest email (where available)", "Check-in date", "Check-out date", "Property nickname", "Reservation code"],
    workflow: [
      { step: 1, title: "Create the waiver link action", description: "Connect RentalWaivers to Hospitable through Zapier or a custom automation that requests a signing link per reservation." },
      { step: 2, title: "Insert the link in a scheduled message", description: "Add the signing link to your booking-confirmed message and your 3-days-before reminder." },
      { step: 3, title: "Gate the check-in message", description: "Hold the door code message until the waiver status is signed." },
      { step: 4, title: "Keep the record", description: "Every signature is stored as a tamper-proof PDF with timestamp, IP, and device." },
    ],
    faqExtra: [
      { question: "Can I send the waiver through the Airbnb thread?", answer: "Yes — Hospitable posts the signing link as a normal message, which avoids email spam folders entirely." },
      { question: "What if a guest never signs?", answer: "RentalWaivers sends automatic reminders and flags the reservation so you can hold check-in instructions." },
    ],
  },
  {
    slug: "uplisting",
    name: "Uplisting",
    category: "Short-term rental channel manager and direct booking engine",
    audience: "multi-channel hosts syncing Airbnb, Vrbo, Booking.com and direct bookings",
    connectionMethod: "Uplisting webhooks or a Zapier/Make connection on the booking event",
    trigger: "a booking is created on any connected channel",
    strengths: [
      "One waiver flow covers every channel — Airbnb, Vrbo, Booking.com and direct",
      "Uplisting's guest data quality makes prefilling name and arrival date reliable",
      "Works with Uplisting's automated guest messaging for reminders",
    ],
    gaps: [
      "No native liability waiver or e-signature audit trail",
      "Booking.com reservations often arrive without a usable guest email, so SMS or in-thread links matter",
      "Channel terms of service are not a substitute for your own signed release",
    ],
    fieldsMapped: ["Guest name", "Guest email", "Check-in date", "Check-out date", "Property", "Channel", "Booking reference"],
    workflow: [
      { step: 1, title: "Add the webhook", description: "Register RentalWaivers as a booking webhook target in Uplisting." },
      { step: 2, title: "Set per-channel rules", description: "Email the link for direct and Vrbo bookings; use the messaging thread for Booking.com reservations." },
      { step: 3, title: "Guests sign before arrival", description: "One minute on a phone, with minors named and guardian consent captured." },
      { step: 4, title: "Audit anytime", description: "Search signed waivers by guest, property, or date range." },
    ],
    faqExtra: [
      { question: "Does it work for Booking.com reservations without an email?", answer: "Yes — send the signing link through the channel message thread or as a QR code at check-in." },
      { question: "Can I use one waiver across all channels?", answer: "Yes, and most operators do. You can still use property-specific templates where amenities differ." },
    ],
  },
  {
    slug: "smoobu",
    name: "Smoobu",
    category: "Vacation rental channel manager and website builder",
    audience: "European and independent hosts managing a handful of properties",
    connectionMethod: "Smoobu's API or a Zapier/Make automation on new bookings",
    trigger: "a new booking arrives from any connected channel",
    strengths: [
      "Smoobu's guest portal is a natural place to link the waiver alongside check-in details",
      "Simple setup for small portfolios — no developer needed with the no-code route",
      "Multi-language waivers match Smoobu's international guest base",
    ],
    gaps: [
      "No liability waiver or signature audit trail inside Smoobu",
      "Guest registration forms collect identity data, not a release of liability",
      "Amenity risk disclosure has to live somewhere else — that somewhere is your waiver",
    ],
    fieldsMapped: ["Guest name", "Guest email", "Arrival date", "Departure date", "Apartment / property", "Booking reference", "Guest language"],
    workflow: [
      { step: 1, title: "Connect Smoobu", description: "Use the Smoobu API key or a no-code automation to pass new bookings to RentalWaivers." },
      { step: 2, title: "Choose the guest's language", description: "RentalWaivers serves waivers in multiple languages, matched to the guest's booking language." },
      { step: 3, title: "Send with the check-in instructions", description: "Include the signing link in the Smoobu guest portal message." },
      { step: 4, title: "Store the signed PDF", description: "Each signature is preserved with timestamp, IP, and device metadata." },
    ],
    faqExtra: [
      { question: "Can guests sign in German or French?", answer: "Yes. RentalWaivers supports multiple signing languages, which matters for Smoobu's mostly European guest base." },
      { question: "Is this GDPR-friendly?", answer: "Waivers collect only the data you configure, with explicit consent recorded for anything sensitive such as photo capture." },
    ],
  },
  {
    slug: "escapia",
    name: "Escapia",
    category: "Enterprise vacation rental management system (Vrbo / Expedia family)",
    audience: "large resort-area managers with hundreds of owner-managed units",
    connectionMethod: "an Escapia API or scheduled reservation export feeding the RentalWaivers API",
    trigger: "a confirmed reservation appears in the nightly or real-time reservation feed",
    strengths: [
      "Handles large nightly reservation volumes without manual sending",
      "Per-unit waiver templates for pools, hot tubs, docks, and beach access",
      "Owner-reporting friendly — signed waivers are attributable per unit",
    ],
    gaps: [
      "Escapia's document handling is built for agreements and statements, not injury releases",
      "Guest-facing e-sign flows are not designed for mobile signature capture with an audit trail",
      "Minor and guardian handling is absent from standard reservation data",
    ],
    fieldsMapped: ["Guest name", "Guest email", "Arrival date", "Departure date", "Unit code", "Reservation number", "Occupancy"],
    workflow: [
      { step: 1, title: "Establish the reservation feed", description: "Connect Escapia through its API or a scheduled export into the RentalWaivers API." },
      { step: 2, title: "Template per unit type", description: "Map pool units, hot tub units, and beachfront units to the matching waiver template." },
      { step: 3, title: "Bulk-send automatically", description: "Every confirmed reservation gets a signing link, with reminders until signed." },
      { step: 4, title: "Report by unit and owner", description: "Pull signed-waiver counts per unit for owner statements and insurance reviews." },
    ],
    faqExtra: [
      { question: "Can this handle several hundred reservations a night?", answer: "Yes. Sending is queued and rate-controlled, and pricing is per signed waiver, so volume never triggers a plan upgrade." },
      { question: "Can each owner see their own signed waivers?", answer: "Waivers are attributable per unit, so you can report signed counts and pull individual PDFs for any owner." },
    ],
  },
  {
    slug: "streamline",
    name: "Streamline",
    category: "Vacation rental software for large professional managers",
    audience: "established managers in beach, lake and mountain markets with owner trust accounting",
    connectionMethod: "the Streamline API or a webhook/export bridge into the RentalWaivers API",
    trigger: "reservation confirmation, or a pre-arrival milestone you choose",
    strengths: [
      "Fits managers who already run structured pre-arrival sequences",
      "Supports separate waivers for the stay and for add-on activities like boat or golf cart rentals",
      "Signed PDFs give risk managers and insurers a clean paper trail",
    ],
    gaps: [
      "Streamline's e-sign is oriented to owner and rental agreements",
      "Add-on activity risk (boats, carts, bikes) is usually undocumented",
      "No structured minors and guardian capture",
    ],
    fieldsMapped: ["Guest name", "Guest email", "Arrival date", "Departure date", "Unit", "Reservation ID", "Add-on services booked"],
    workflow: [
      { step: 1, title: "Bridge the reservation data", description: "Connect Streamline through its API or an export bridge to the RentalWaivers API." },
      { step: 2, title: "Split stay vs activity waivers", description: "Send the property waiver at booking and an activity waiver when a boat, cart, or bike add-on is booked." },
      { step: 3, title: "Automate reminders", description: "Unsigned waivers are chased automatically until check-in." },
      { step: 4, title: "Archive for insurance", description: "Export signed waivers for your carrier or risk review at any time." },
    ],
    faqExtra: [
      { question: "Can we send a second waiver for golf cart or boat add-ons?", answer: "Yes. Trigger a separate activity waiver when the add-on is booked — these carry very different risk language." },
      { question: "How does pricing work at our volume?", answer: "6¢ per signed waiver with no monthly fee, so 50,000 signatures a year is $3,000 — no plan tiers to negotiate." },
    ],
  },
  {
    slug: "track",
    name: "Track (TRACK Hospitality)",
    category: "Enterprise hospitality PMS and CRM for vacation rentals",
    audience: "enterprise managers running TRACK PMS with a contact center and CRM workflows",
    connectionMethod: "TRACK's REST API or webhook events into the RentalWaivers API",
    trigger: "a reservation is confirmed or a pre-arrival workflow step fires",
    strengths: [
      "CRM-grade guest records make prefill and de-duplication accurate",
      "Waiver status can be surfaced to contact-center agents handling arrival calls",
      "Scales across brands and portfolios with separate templates per brand",
    ],
    gaps: [
      "TRACK documents focus on agreements, folios and owner statements",
      "Injury-release language and mobile signature capture are outside its core",
      "No native audit trail designed for defending a negligence claim",
    ],
    fieldsMapped: ["Guest name", "Guest email", "Guest phone", "Arrival date", "Departure date", "Unit", "Confirmation number", "Brand / portfolio"],
    workflow: [
      { step: 1, title: "Connect the API", description: "Use TRACK's REST API or webhooks to push confirmed reservations to RentalWaivers." },
      { step: 2, title: "Template per brand", description: "Assign a waiver template per brand or portfolio so language matches the property standard." },
      { step: 3, title: "Send and track", description: "Waivers send on confirmation; agents can see signed status when guests call." },
      { step: 4, title: "Enterprise reporting", description: "Signed, unsigned, and expired counts by property, brand, and date range." },
    ],
    faqExtra: [
      { question: "Can agents resend a waiver from a call?", answer: "Yes. Any team member can resend the signing email from the envelope screen in RentalWaivers." },
      { question: "Do you support multiple brands under one account?", answer: "Yes — templates, branding, and reporting can be separated by brand." },
    ],
  },
];

export const integrationPlatforms = PLATFORMS;

export function getIntegrationPlatform(slug: string): IntegrationPlatform | undefined {
  return PLATFORMS.find((p) => p.slug === slug);
}

export function integrationUrl(slug: string) {
  return `/integrations/${slug}`;
}
