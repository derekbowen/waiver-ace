import { Link } from "react-router-dom";
import { SeoPageLayout, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Smartphone, Clock, CheckCircle, ArrowRight, Home, Waves, Flame, Users } from "lucide-react";
import { InternalLinks } from "@/components/InternalLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/lib/structured-data";
import heroVideo from "@/assets/vacation-rental-hero.mp4.asset.json";

const faqItems = [
  {
    question: "What is a vacation rental waiver?",
    answer: "A vacation rental waiver is a legal document guests sign before or during their stay, acknowledging the risks of using your property and its amenities (pools, hot tubs, docks, grills) and releasing you from liability for injuries covered by the waiver. It's separate from your rental agreement and your insurance.",
  },
  {
    question: "Doesn't Airbnb's AirCover or VRBO's protection cover me?",
    answer: "Not fully. Platform protection programs have exclusions, caps, and a claims process the platform controls — and they don't stop a guest from suing you directly. A signed waiver is your own contract with the guest and your first line of defense.",
  },
  {
    question: "Is this vacation rental waiver template free?",
    answer: "Yes. Download it free and customize it for your property, or go digital with RentalWaivers starting at 6¢ per signed waiver with no monthly fee.",
  },
  {
    question: "When should guests sign the waiver?",
    answer: "Right after booking confirmation — before they receive check-in instructions or door codes. RentalWaivers sends the signing link automatically so no guest arrives unsigned.",
  },
  {
    question: "Is a vacation rental waiver legally enforceable?",
    answer: "In most states, a well-drafted waiver protects you from ordinary negligence claims, but enforceability varies by state. Have an attorney licensed in your property's state review your final version.",
  },
  {
    question: "Should every guest sign, or just the person who booked?",
    answer: "At minimum, the booking guest signs and accepts responsibility for everyone in their party, with minors listed by name. For higher-risk amenities like pools and docks, having each adult sign provides the strongest protection.",
  },
];

export default function VacationRentalWaiverPage() {
  const url = "https://www.rentalwaivers.com/p/vacation-rental-waiver";

  return (
    <SeoPageLayout
      metaTitle="Vacation Rental Waiver — Free Template & Digital Signing | RentalWaivers"
      metaDescription="Free vacation rental waiver template for hosts. Protect your property from guest injury claims — pools, hot tubs, docks, and more. Collect e-signatures automatically, 6¢ per waiver."
      canonicalPath="/p/vacation-rental-waiver"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Vacation Rental Waiver", url },
          ]),
          faqSchema(faqItems),
          howToSchema({
            name: "How to set up a vacation rental waiver",
            description: "Create and automate a vacation rental waiver for your property in minutes.",
            totalTimeISO: "PT10M",
            steps: [
              { name: "Start from the template", text: "Use our free vacation rental waiver template covering pools, hot tubs, docks, and occupancy rules." },
              { name: "Customize for your property", text: "Name your specific amenities, hazards, and house rules. Have a local attorney review the final version." },
              { name: "Automate delivery", text: "Connect your booking flow — RentalWaivers emails or texts the signing link when a booking is confirmed." },
              { name: "Collect signatures before check-in", text: "Guests sign on their phone in under a minute. You get a tamper-proof PDF with a full audit trail." },
            ],
          }),
        ]}
      />

      {/* Video hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <video
            src={heroVideo.url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        <div className="relative container max-w-6xl py-24 md:py-36 text-center">
          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white mb-6">
            For Vacation Rental Hosts
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Vacation Rental Waiver —<br className="hidden md:block" /> Protect Your Property From Guest Injury Claims
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            A guest slips by the pool. A child is hurt on the dock. Platform protection won't stop a lawsuit — a signed waiver can. Get our free vacation rental waiver template and collect signatures automatically before every check-in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/signup">Get the Free Template <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/waiver-templates/vacation-rental-waiver-template">View the Waiver Template</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> No monthly fee</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Guests sign in 60 seconds</span>
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Tamper-proof audit trail</span>
          </div>
        </div>
      </section>

      <SeoSection title="Why Platform Protection Isn't Enough" muted>
        <div className="space-y-4 text-sm text-muted-foreground max-w-3xl">
          <p>
            AirCover and similar programs sound reassuring — until you file a claim. They're platform-controlled programs with exclusions, caps, and adjusters who work for the platform, not for you. They may reimburse some property damage, but they <strong className="text-foreground">don't prevent a guest from suing you personally</strong> for an injury on your property.
          </p>
          <p>
            A vacation rental waiver is a direct contract between you and your guest. The guest acknowledges the risks of your property — the pool, the hot tub, the stairs, the dock — and releases you from liability for covered claims. Combined with proper insurance, it's how professional property managers protect themselves on every single stay.
          </p>
        </div>
      </SeoSection>

      <SeoSection title="What Your Vacation Rental Waiver Must Cover">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Waves, title: "Water & Amenities", desc: "Pools, hot tubs, docks, and waterfronts — the highest-severity risks. Name them explicitly, with supervision and no-diving rules." },
            { icon: Flame, title: "Fire & Equipment", desc: "Grills, fire pits, fireplaces, and wood stoves. Assign responsibility for safe operation and unattended-fire damage." },
            { icon: Users, title: "Guests & Minors", desc: "Occupancy limits, visitor responsibility, and named minors with guardian acknowledgment for children in the party." },
            { icon: Home, title: "Property & Damage", desc: "Financial responsibility for damage beyond normal wear, house-rules acknowledgment, and security deposit terms." },
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
        <p className="text-sm text-muted-foreground mt-6">
          Our <Link to="/waiver-templates/vacation-rental-waiver-template" className="text-primary underline underline-offset-4">free vacation rental waiver template</Link> includes all of these clauses, plus assumption of risk, release of liability, and indemnification language.
        </p>
      </SeoSection>

      <SeoSection title="How It Works" muted>
        <div className="space-y-6">
          {[
            { step: 1, title: "Start From the Template", desc: "Download the free vacation rental waiver template and customize it for your property — name your pool, hot tub, dock, and house rules specifically. Generic 'premises' language is weaker in court." },
            { step: 2, title: "Automate Delivery at Booking", desc: "Upload your waiver to RentalWaivers and connect your booking flow. The signing link goes out automatically by email when a reservation is confirmed — before door codes or check-in instructions." },
            { step: 3, title: "Guests Sign on Their Phone", desc: "No app download, no printing. Guests read, fill in their party details (including minors), and draw their signature in under 60 seconds." },
            { step: 4, title: "Tamper-Proof Storage", desc: "Every signed waiver becomes a PDF with timestamps, IP address, and device information — a complete audit trail ready if you ever need it." },
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

      <SeoSection title="6¢ Per Waiver. No Monthly Fee.">
        <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-sm text-muted-foreground">
          <p>
            Most waiver software charges $18–$260/month whether you book guests or not. Vacation rentals are seasonal — why pay through your slow months? <strong className="text-foreground">RentalWaivers charges only when a waiver is signed.</strong>
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "6¢", label: "Per signed waiver" },
              { value: "$0", label: "Monthly fee, ever" },
              { value: "60s", label: "Average signing time" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-heading text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <SeoCta
        title="Get Your Vacation Rental Waiver in Place Tonight"
        description="Free template, digital signing, automatic delivery. 6¢ per waiver, no monthly fee — protect your property before the next check-in."
        primaryLabel="Create Your Free Account"
        primaryHref="/signup"
        secondaryLabel="View the Free Template"
        secondaryHref="/waiver-templates/vacation-rental-waiver-template"
      />

      <InternalLinks currentSlug="vacation-rental-waiver" />
    </SeoPageLayout>
  );
}
