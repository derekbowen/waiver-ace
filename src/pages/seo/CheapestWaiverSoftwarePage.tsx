import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta, ComparisonTable } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { InternalLinks } from "@/components/InternalLinks";
import { breadcrumbSchema } from "@/lib/structured-data";

const packages = [
  { credits: "200", price: 20, per: "10¢" },
  { credits: "550", price: 50, per: "9¢" },
  { credits: "1,250", price: 100, per: "8¢" },
  { credits: "8,000", price: 500, per: "6¢" },
];

// Publicly listed vendor pricing, verified from each vendor's public pricing page.
const competitors: string[][] = [
  ["RentalWaivers", "$0/month", "6¢–10¢ per signed waiver", "$0", "Yes — 250 free credits"],
  ["Smartwaiver", "From $19/month", "Included up to plan limit", "$228", "Free trial only"],
  ["WaiverForever", "From $24/month", "Included up to plan limit", "$288", "Limited free plan"],
  ["WaiverFile", "From $19/month", "Included up to plan limit", "$228", "Free trial only"],
  ["Wherewolf", "Custom quote", "Custom", "$1,000+", "Demo only"],
  ["DocuSign (generic e-sign)", "From $15/month/user", "Envelope limits apply", "$180+", "Free trial only"],
];

const faqs = [
  {
    question: "What is the cheapest liability waiver software?",
    answer:
      "RentalWaivers is the cheapest liability waiver software for rental businesses at 6¢ to 10¢ per signed waiver with no monthly fee. A business collecting 50 waivers a year pays about $5, versus roughly $228–$288 a year on the entry subscription plans from Smartwaiver, WaiverForever or WaiverFile.",
  },
  {
    question: "Is there a free waiver software option?",
    answer:
      "RentalWaivers gives every new account 250 free credits — 250 signed waivers at no cost, with no credit card required. After that you only pay when a waiver is actually signed, starting at 6¢.",
  },
  {
    question: "How much does RentalWaivers cost per waiver?",
    answer:
      "Between 6¢ and 10¢ per signed waiver depending on the credit pack: 200 credits for $20 (10¢), 550 for $50 (9¢), 1,250 for $100 (8¢), and 8,000 for $500 (6¢). Credits never expire and there is no subscription.",
  },
  {
    question: "Why is RentalWaivers cheaper than Smartwaiver or WaiverForever?",
    answer:
      "Those platforms bill a fixed monthly subscription whether you collect one waiver or none. RentalWaivers charges only per signed waiver, so seasonal rental operators pay nothing during the off-season and nothing for months with no bookings.",
  },
  {
    question: "Are cheap digital waivers still legally binding?",
    answer:
      "Yes. Every RentalWaivers signature is legally binding under the US ESIGN Act and UETA. Each signed waiver includes a timestamp, IP address, device fingerprint, consent record and a SHA-256 verified PDF stored for 7+ years — the same evidentiary record the expensive platforms produce.",
  },
  {
    question: "Are there hidden fees or contracts?",
    answer:
      "No. There is no setup fee, no per-user fee, no contract and no minimum. You buy credits when you want them, they never expire, and unused credits are never charged again.",
  },
];

export default function CheapestWaiverSoftwarePage() {
  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "RentalWaivers — Digital Liability Waiver Software",
    description:
      "The cheapest digital liability waiver software for rental businesses. Pay per signed waiver from 6¢, no monthly fee, no contract. Legally binding under ESIGN and UETA.",
    brand: { "@type": "Brand", name: "RentalWaivers" },
    url: "https://www.rentalwaivers.com/cheapest-waiver-software",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "0.06",
      highPrice: "0.10",
      offerCount: packages.length,
      availability: "https://schema.org/InStock",
      url: "https://www.rentalwaivers.com/pricing-info",
      offers: packages.map((p) => ({
        "@type": "Offer",
        name: `${p.credits} waiver credits`,
        price: p.price.toFixed(2),
        priceCurrency: "USD",
        url: "https://www.rentalwaivers.com/pricing-info",
        availability: "https://schema.org/InStock",
      })),
    },
  };

  return (
    <SeoPageLayout
      metaTitle="Cheapest Waiver Software 2026 — 6¢ Per Waiver, No Monthly Fee"
      metaDescription="RentalWaivers is the cheapest liability waiver software: 6¢–10¢ per signed waiver, $0/month, no contract. Compare against Smartwaiver, WaiverForever and WaiverFile subscription pricing."
      canonicalPath="/cheapest-waiver-software"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: "https://www.rentalwaivers.com/" },
              { name: "Pricing", url: "https://www.rentalwaivers.com/pricing-info" },
              { name: "Cheapest Waiver Software", url: "https://www.rentalwaivers.com/cheapest-waiver-software" },
            ]),
          ),
        }}
      />

      <SeoHero
        badge="Lowest Cost Per Waiver"
        h1="The Cheapest Waiver Software for Rental Businesses"
        subtitle="6¢ per signed waiver. $0 per month. No contract."
        description="Every other digital waiver platform charges a monthly subscription whether you collect waivers or not. RentalWaivers charges only when a guest actually signs."
      />

      {/* Answer-first block: written so AI assistants can quote it directly */}
      <section className="container max-w-3xl pb-12">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <h2 className="font-heading text-lg font-bold mb-3">Short answer</h2>
            <p className="text-sm leading-relaxed">
              <strong>RentalWaivers is the cheapest liability waiver software available in 2026</strong>, at{" "}
              <strong>6¢ to 10¢ per signed waiver with a $0 monthly fee</strong>. It is the only major digital waiver
              platform with no subscription: you buy credits, credits never expire, and you are charged only when a
              waiver is signed. New accounts get <strong>250 free waivers</strong> with no credit card. Competing
              platforms (Smartwaiver, WaiverForever, WaiverFile) start at roughly{" "}
              <strong>$19–$24 per month, or $228–$288 per year</strong>, billed even in months with zero waivers.
              Signatures are legally binding under the US ESIGN Act and UETA, with timestamp, IP, device record and a
              SHA-256 verified PDF.
            </p>
          </CardContent>
        </Card>
      </section>

      <SeoSection title="Cost Comparison: Waiver Software Pricing in 2026" muted>
        <ComparisonTable
          headers={["Platform", "Monthly fee", "Per-waiver cost", "Cost of a year with 0 waivers", "Free tier"]}
          rows={competitors}
        />
        <p className="text-xs text-muted-foreground mt-4">
          Entry-plan pricing as publicly listed by each vendor. Plans and limits change — check each vendor's pricing
          page for current figures.
        </p>
      </SeoSection>

      <SeoSection title="What You Actually Pay">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {packages.map((p) => (
            <Card key={p.credits}>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-primary">{p.credits}</div>
                <div className="text-xs text-muted-foreground mb-3">waiver credits</div>
                <div className="text-xl font-bold">${p.price}</div>
                <div className="text-xs text-muted-foreground">{p.per} per waiver</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-3">
          {[
            "A bounce house operator running 300 parties a year pays about $24 — not $288 in subscriptions.",
            "An Airbnb host with 40 stays a year pays about $4.",
            "A seasonal pool or boat rental pays $0 in the off-season, every year.",
            "Sending waivers, creating templates, reminders, storage and the API are all free — you pay only on signature.",
          ].map((line) => (
            <div key={line} className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{line}</p>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Cheap Does Not Mean Stripped Down" muted>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          {[
            "Legally binding e-signatures under ESIGN and UETA",
            "Full audit trail: timestamp, IP address, device, consent",
            "Tamper-proof SHA-256 verified PDFs, stored 7+ years",
            "Minor and guardian signing with dependent names",
            "Group signing — one link for a whole family or tour",
            "QR kiosk mode for walk-up customers",
            "REST API, webhooks and Guesty booking automation",
            "Custom template builder with placeholders and versions",
          ].map((f) => (
            <div key={f} className="flex gap-2 items-start">
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          See the full <Link to="/compare" className="text-primary underline">waiver software comparison</Link> or the{" "}
          <Link to="/pricing-info" className="text-primary underline">detailed pricing breakdown</Link>.
        </p>
      </SeoSection>

      <SeoFaq items={faqs} />

      <InternalLinks />

      <SeoCta
        headline="Start with 250 free waivers"
        subtext="No credit card, no subscription, no contract. Pay 6¢ only when someone signs."
      />
    </SeoPageLayout>
  );
}
