import { Link } from "react-router-dom";
import { SeoPageLayout, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Smartphone, Clock, CheckCircle, ArrowRight, Users, PartyPopper, CloudSun } from "lucide-react";
import { InternalLinks } from "@/components/InternalLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/lib/structured-data";
import heroVideo from "@/assets/bounce-house-hero.mp4.asset.json";
import heroPoster from "@/assets/bounce-house-hero-poster.jpg";

const faqItems = [
  {
    question: "What is a bounce house rental waiver?",
    answer: "A bounce house rental waiver is a liability waiver the booking parent or event organizer signs before the inflatable is delivered or inflated. It acknowledges the known risks of inflatables — falls, collisions, sprains, and weather-related incidents — and releases your rental business from liability for covered injuries. It also documents the safety rules: age and weight limits, supervision requirements, and no-flip/no-stunt rules.",
  },
  {
    question: "Is a bounce house liability waiver legally enforceable?",
    answer: "In most states, a well-drafted waiver signed by a parent or guardian before the event protects you from ordinary negligence claims — but enforceability varies by state, and gross negligence is generally never waivable. Have an attorney licensed in your state review your final version, and always carry liability insurance alongside the waiver.",
  },
  {
    question: "Should every parent sign, or just the person who booked?",
    answer: "At minimum, the booking parent signs and accepts responsibility for every child at the party. The strongest protection is having each parent or guardian sign individually for their own children — RentalWaivers group signing sends one link and every parent signs on their own phone in under a minute.",
  },
  {
    question: "Can a parent legally sign a waiver for their child?",
    answer: "In most states a parent or guardian can sign on behalf of a minor, though a handful of states limit pre-injury waivers for children. Name each minor on the waiver, have the guardian attest to the specific risks, and keep a tamper-proof audit trail showing who signed and when.",
  },
  {
    question: "When should the waiver go out?",
    answer: "Immediately after booking — days before the event, not at the door. RentalWaivers emails the signing link automatically when the rental is confirmed, so every family is covered before the bounce house is even inflated. For walk-ups and school events, kiosk mode with a QR code lets parents sign on arrival.",
  },
  {
    question: "What does it cost?",
    answer: "RentalWaivers starts at 6¢ per signed waiver with no monthly fee. Most bounce house operators pay a few dollars a month — a fraction of one hour of rental revenue — compared with waiver software that charges $18–$260/month whether you book parties or not.",
  },
];

export default function BounceHouseWaiverPage() {
  const url = "https://www.rentalwaivers.com/waivers/bounce-house-rental-waivers";

  return (
    <SeoPageLayout
      metaTitle="Bounce House Rental Waiver & Liability Waiver | RentalWaivers"
      metaDescription="Free bounce house rental waiver with digital signing. Protect your inflatable business with a bounce house liability waiver parents sign before the party — 6¢ per waiver, no monthly fee."
      canonicalPath="/waivers/bounce-house-rental-waivers"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Bounce House Rental Waiver", url },
          ]),
          faqSchema(faqItems),
          howToSchema({
            name: "How to set up a bounce house rental waiver",
            description: "Create and automate a bounce house liability waiver for every booking in minutes.",
            totalTimeISO: "PT10M",
            steps: [
              { name: "Start from the template", text: "Use our free bounce house waiver template covering jumping injuries, age and weight limits, capacity, and supervision rules." },
              { name: "Customize your rules", text: "Name your specific inflatables, safety rules, and weather/anchor requirements. Have a local attorney review the final version." },
              { name: "Automate delivery", text: "Connect your booking flow — RentalWaivers emails the signing link to the booking parent the moment a rental is confirmed." },
              { name: "Collect signatures before setup", text: "Parents sign on their phone in under a minute. Group signing covers every family at the party, with a tamper-proof PDF audit trail for each." },
            ],
          }),
        ]}
      />

      {/* Video hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <video
            src={heroVideo.url}
            poster={heroPoster}
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
            For Bounce House & Inflatable Rental Operators
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Bounce House Rental Waiver —<br className="hidden md:block" /> Every Party Covered Before Kids Bounce
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
            One overturned bounce house or a fractured arm can end a rental business. Get a bounce house liability waiver parents sign on their phone before you ever inflate — with safety rules, age limits, and supervision requirements built in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/signup">Get the Free Template <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/waiver-templates/bounce-house-rental-waiver-template">View the Waiver Template</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> 6¢ per waiver, no monthly fee</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Parents sign in 60 seconds</span>
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Tamper-proof audit trail</span>
          </div>
        </div>
      </section>

      <SeoSection title="Why Every Bounce House Rental Needs a Liability Waiver" muted>
        <div className="space-y-4 text-sm text-muted-foreground max-w-3xl">
          <p>
            Inflatables are the highest-energy product in the party rental industry — and among the most litigated. Sprained ankles, broken arms, collisions between jumpers of different sizes, and wind-related tip-overs are all documented injury patterns. When a child is hurt at a backyard birthday, the lawsuit names <strong className="text-foreground">your rental business</strong>, not the parents who were watching.
          </p>
          <p>
            A bounce house liability waiver is your contract with the customer: it documents that they were warned about the specific risks, that they agreed to your safety rules (age and weight limits, adult supervision at all times, no flips, anchoring requirements), and that they release you from liability for covered injuries. Courts routinely enforce waivers that are specific, clearly written, and signed before the incident — which is exactly why the signature has to happen <em>before</em> delivery, not at the door amid party chaos.
          </p>
        </div>
      </SeoSection>

      <SeoSection title="What Your Bounce House Rental Waiver Must Cover">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: PartyPopper, title: "Jumping Injuries", desc: "Sprains, fractures, and collisions between jumpers — the most common claims. Require acknowledgment of the specific risks of inflatable play." },
            { icon: Users, title: "Minors & Guardians", desc: "Every child named, every parent or guardian signing. Group signing lets each family sign individually from one shared link." },
            { icon: Shield, title: "Safety Rules", desc: "Age and weight limits, capacity, constant adult supervision, no flips or stunts, no shoes, and separation by age group." },
            { icon: CloudSun, title: "Setup & Weather", desc: "Professional anchoring, approved surfaces, and a hard rule against use in wind or rain — the leading cause of catastrophic inflatable accidents." },
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
          Our <Link to="/waiver-templates/bounce-house-rental-waiver-template" className="text-primary underline underline-offset-4">free bounce house waiver template</Link> includes all of these clauses, plus assumption of risk, release of liability, and indemnification language you can customize per inflatable.
        </p>
      </SeoSection>

      <SeoSection title="How It Works" muted>
        <div className="space-y-6">
          {[
            { step: 1, title: "Start From the Template", desc: "Download the free bounce house rental waiver template and customize it — name your inflatables, your safety rules, and your weather policy. Generic 'premises' language is weaker in court." },
            { step: 2, title: "Automate Delivery at Booking", desc: "Upload your waiver to RentalWaivers and connect your booking flow. The signing link goes to the booking parent automatically by email the moment the rental is confirmed — days before the party." },
            { step: 3, title: "Every Parent Signs on Their Phone", desc: "No app, no printing, no chasing signatures at the door. The booking parent shares one link and each parent or guardian signs for their own children in under 60 seconds." },
            { step: 4, title: "Tamper-Proof Records", desc: "Every signed waiver becomes a PDF with timestamps, IP address, and device information — a complete audit trail ready if a claim ever comes." },
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

      <SeoSection title="Built for Walk-Ups, Schools, and Big Events Too">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Smartphone, title: "Kiosk Mode & QR Codes", desc: "For festivals, school fairs, and walk-up rentals: post a QR code and parents sign on their own phone before their child jumps." },
            { icon: FileText, title: "Custom Fields", desc: "Log the inflatable, delivery address, event date, and supervisor name on every waiver so each signature maps to a specific rental." },
            { icon: Users, title: "Group Signing", desc: "One link covers the whole party — every family signs individually, and you see who has and hasn't signed before setup day." },
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

      <SeoSection title="6¢ Per Waiver. No Monthly Fee." muted>
        <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-sm text-muted-foreground">
          <p>
            Waiver software typically charges $18–$260/month whether you book parties or not. Bounce house rentals are seasonal — why pay through the slow months? <strong className="text-foreground">RentalWaivers charges only when a waiver is signed.</strong>
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
        headline="Get your bounce house waiver in place before the next booking"
        subtext="Free template, digital signing, automatic delivery. 6¢ per waiver, no monthly fee — every party covered before you inflate."
      />

      <InternalLinks currentSlug="bounce-house-rental-waivers" />
    </SeoPageLayout>
  );
}
