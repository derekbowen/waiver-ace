import { Link } from "react-router-dom";
import { SeoPageLayout, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Smartphone, Clock, CheckCircle, ArrowRight, Home, Users, Scale, CalendarDays } from "lucide-react";
import { InternalLinks } from "@/components/InternalLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/lib/structured-data";
import heroImage from "@/assets/hero-rental-agreement.jpg";

const faqItems = [
  {
    question: "What is the difference between a rental agreement and a waiver?",
    answer:
      "A rental agreement (or lease agreement) sets the business terms: dates, price, deposits, house rules, and what happens if something is damaged. A liability waiver releases you from injury claims. You need both — the agreement defines the deal, the waiver protects you when a guest gets hurt using your property or equipment.",
  },
  {
    question: "Do I need a rental agreement if I already use Airbnb or VRBO?",
    answer:
      "Yes. Platform terms govern the guest's relationship with the platform, not with you. Your own rental agreement is a direct contract with the guest covering your specific rules, deposits, and damage responsibility — and it's the document that matters in small claims court or a dispute.",
  },
  {
    question: "Is an electronically signed rental agreement legally binding?",
    answer:
      "Yes. Under the US ESIGN Act and UETA, electronic signatures carry the same legal weight as ink on paper. RentalWaivers records a timestamp, IP address, device information, and consent with every signature, and produces a SHA-256 verified PDF as proof.",
  },
  {
    question: "When should the guest sign the rental agreement?",
    answer:
      "Immediately after booking confirmation — before you send door codes or check-in instructions. RentalWaivers emails the signing link automatically when a booking is confirmed, including through the Guesty integration, so no guest arrives unsigned.",
  },
  {
    question: "Can I collect the rental agreement and the waiver together?",
    answer:
      "Yes. Most operators attach both documents to the same signing flow so the guest signs everything in one session on their phone, in about a minute. Both signed PDFs are stored together with a full audit trail.",
  },
  {
    question: "What clauses should every rental agreement include?",
    answer:
      "At minimum: exact rental dates and check-in/check-out times, total price and deposit terms, occupancy limits, house rules, damage responsibility beyond normal wear, cancellation policy, and a signature block. Have an attorney licensed in your property's state review your final version.",
  },
];

export default function RentalAgreementPage() {
  const url = "https://www.rentalwaivers.com/p/rental-agreement";

  return (
    <SeoPageLayout
      metaTitle="Rental Agreement & Lease Agreement Templates — Sign Digitally | RentalWaivers"
      metaDescription="Create and e-sign rental agreements and lease agreements online. Pair your rental agreement with a liability waiver, send automatically at booking, and get tamper-proof signed PDFs — 6¢ per signature, no monthly fee."
      canonicalPath="/p/rental-agreement"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Rental Agreement", url },
          ]),
          faqSchema(faqItems),
          howToSchema({
            name: "How to get a rental agreement signed online",
            description: "Send and sign a rental agreement digitally in minutes.",
            totalTimeISO: "PT10M",
            steps: [
              { name: "Upload your agreement", text: "Start from your existing rental or lease agreement and upload it as a template." },
              { name: "Send at booking", text: "The signing link goes out automatically by email when a reservation is confirmed." },
              { name: "Guest signs on their phone", text: "No app, no printing — the guest reads and signs in about 60 seconds." },
              { name: "Store the signed PDF", text: "Every signed agreement becomes a tamper-proof PDF with a timestamp, IP, and device audit trail." },
            ],
          }),
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="A rental agreement on a desk with house keys and a phone showing a digital signature"
            className="h-full w-full object-cover"
            width={1920}
            height={1024}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        <div className="relative container max-w-6xl py-24 md:py-36 text-center">
          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white mb-6">
            Rental & Lease Agreements
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Get Every Rental Agreement Signed<br className="hidden md:block" /> Before the Keys Change Hands
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Your rental agreement sets the rules. Your waiver sets the protection. Send both automatically the moment a booking is confirmed, and hold a signed, tamper-proof PDF for every guest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/signup">Start Free — No Monthly Fee <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/p/vacation-rental-waiver">See the Companion Waiver</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Legally binding under ESIGN & UETA</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Guests sign in 60 seconds</span>
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Tamper-proof audit trail</span>
          </div>
        </div>
      </section>

      <SeoSection title="Rental Agreement + Waiver: The Two Documents Every Rental Needs" muted>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">The Rental Agreement (or Lease Agreement)</h3>
              <p className="text-sm text-muted-foreground">
                The business contract: rental dates, price, security deposit, occupancy limits, house rules, and who pays for damage. Whether you call it a rental agreement or a lease agreement, it's the document that wins disputes and small-claims cases.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">The Liability Waiver</h3>
              <p className="text-sm text-muted-foreground">
                The injury protection: the guest acknowledges the risks of your pool, hot tub, dock, or equipment and releases you from covered injury claims. An agreement handles money — only a waiver handles lawsuits.
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          RentalWaivers lets you send both in one signing flow. Pair this page with our{" "}
          <Link to="/p/vacation-rental-waiver" className="text-primary underline underline-offset-4">vacation rental waiver</Link>{" "}
          and every booking closes with a complete, signed paper trail.
        </p>
      </SeoSection>

      <SeoSection title="What Every Rental Agreement Should Cover">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: CalendarDays, title: "Dates & Money", desc: "Exact rental dates, check-in/check-out times, total price, payment schedule, and security deposit terms." },
            { icon: Home, title: "Property & Damage", desc: "Responsibility for damage beyond normal wear, missing items, and the condition report at handover." },
            { icon: Users, title: "Occupancy & Rules", desc: "Maximum guests, visitor policy, quiet hours, pets, smoking, and named minors in the party." },
            { icon: Scale, title: "Cancellation & Liability", desc: "Cancellation and refund terms, plus a reference to the liability waiver the guest signs alongside." },
          ].map((c) => (
            <Card key={c.title}>
              <CardContent className="pt-6">
                <c.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="How It Works" muted>
        <div className="space-y-6">
          {[
            { step: 1, title: "Upload Your Agreement", desc: "Bring your existing rental agreement or lease agreement and upload it as a reusable template with placeholders for guest name, dates, and property details." },
            { step: 2, title: "Send Automatically at Booking", desc: "Connect your booking flow — including Guesty — and the signing link goes out by email the moment a reservation is confirmed, before door codes or check-in instructions." },
            { step: 3, title: "Guests Sign on Their Phone", desc: "No app download, no printing, no scanning. The guest reads, fills in their details, and draws a signature in under 60 seconds." },
            { step: 4, title: "Tamper-Proof Storage", desc: "Every signed agreement becomes a SHA-256 verified PDF with timestamps, IP address, and device information — ready if a dispute ever lands." },
          ].map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{s.step}</div>
              <div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="6¢ Per Signature. No Monthly Fee.">
        <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-sm text-muted-foreground">
          <p>
            Most e-signature tools charge $15–$40 per user per month whether you sign anything or not. Rentals are seasonal — why pay through your slow months? <strong className="text-foreground">RentalWaivers charges only when a document is actually signed.</strong>
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "6¢", label: "Per signed document" },
              { value: "$0", label: "Monthly fee, ever" },
              { value: "250", label: "Free signatures to start" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-heading text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <p>
            See the <Link to="/pricing-info" className="text-primary underline underline-offset-4">full pricing breakdown</Link> or how we compare as the{" "}
            <Link to="/cheapest-waiver-software" className="text-primary underline underline-offset-4">cheapest waiver software</Link>.
          </p>
        </div>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <SeoCta
        headline="Get your rental agreement signed before the next check-in"
        subtext="Upload your agreement, pair it with a waiver, and automate signing at booking. 6¢ per signature, no monthly fee, 250 free credits to start."
      />

      <InternalLinks currentSlug="rental-agreement" />
    </SeoPageLayout>
  );
}
