import { Link } from "react-router-dom";
import { SeoPageLayout, SeoSection, SeoFaq, SeoCta, ComparisonTable } from "@/components/SeoPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Shield, Clock, CheckCircle, ArrowRight, FileText, Smartphone } from "lucide-react";
import { InternalLinks } from "@/components/InternalLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/lib/structured-data";
import heroPoster from "@/assets/hero-lifestyle.jpg";

const PDF = "/templates/rental-liability-waiver-template.pdf";

const faqItems = [
  {
    question: "What is a rental waiver?",
    answer:
      "A rental waiver is a signed agreement in which the renter acknowledges the risks of the property or equipment they are renting and releases the owner from liability for injuries covered by the waiver. It is separate from the rental agreement, which covers dates, payment, and conditions of use.",
  },
  {
    question: "Is there a free rental liability waiver template?",
    answer:
      "Yes. You can download our free rental liability waiver template as a PDF on this page — no email required. It includes assumption of risk, release of liability, minors and guardian clauses, damage responsibility, and indemnification.",
  },
  {
    question: "Is a rental liability waiver legally enforceable?",
    answer:
      "In most states a clearly written waiver protects the owner against ordinary negligence claims. It generally will not protect against gross negligence or willful misconduct, and a few states limit waivers further. Have an attorney licensed in your state review your final version.",
  },
  {
    question: "Should renters sign on paper or digitally?",
    answer:
      "Digital signing is stronger evidence. A paper waiver can be lost, smudged, or disputed. A digital waiver records the timestamp, IP address, and device alongside the signature, producing a tamper-proof PDF audit trail.",
  },
  {
    question: "How much does rental waiver software cost?",
    answer:
      "Most platforms charge $18 to $260 per month whether or not you rent anything. RentalWaivers charges 6 cents per signed waiver with no monthly fee, and your first 250 signatures are free.",
  },
  {
    question: "What kinds of rental businesses use this waiver?",
    answer:
      "Vacation rentals and short-term rentals, bounce house and party rentals, boat, kayak and jet ski rentals, ATV and powersports rentals, bike and e-bike rentals, and tool or equipment rental yards.",
  },
  {
    question: "Does every renter in the group need to sign?",
    answer:
      "At minimum the person who booked signs and accepts responsibility for the whole party, with minors listed by name. For higher-risk activities, having every adult sign gives the strongest protection — group signing links do this in one send.",
  },
];

export default function RentalLiabilityWaiverPage() {
  const url = "https://www.rentalwaivers.com/p/rental-liability-waiver";

  return (
    <SeoPageLayout
      metaTitle="Rental Liability Waiver — Free Template (PDF) & Digital Signing | RentalWaivers"
      metaDescription="Free rental liability waiver template in PDF, plus digital signing for any rental business. Renters sign on their phone in 60 seconds. 6¢ per waiver, no monthly fee."
      canonicalPath="/p/rental-liability-waiver"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Rental Liability Waiver", url },
          ]),
          faqSchema(faqItems),
          howToSchema({
            name: "How to create a rental liability waiver",
            description: "Create, customize, and collect a rental liability waiver for any rental business.",
            totalTimeISO: "PT10M",
            steps: [
              { name: "Download the free template", text: "Start from the free rental liability waiver PDF template on this page." },
              { name: "Customize it", text: "Name your specific property, equipment, and hazards. Generic language is weaker than specific language." },
              { name: "Have it reviewed", text: "Have an attorney licensed in your state review the final wording." },
              { name: "Collect signatures digitally", text: "Upload it to RentalWaivers and send a signing link, QR code, or kiosk waiver. Renters sign in 60 seconds and you get a tamper-proof PDF." },
            ],
          }),
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPoster} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-background" />
        </div>
        <div className="relative container max-w-5xl py-20 md:py-28 text-center">
          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white mb-6">
            Free Template + Digital Signing
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Rental Liability Waiver
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-4">
            A rental liability waiver is the signed agreement where your renter accepts the risks of your property or
            equipment and releases you from liability for covered injuries.
          </p>
          <p className="text-base text-white/70 max-w-2xl mx-auto mb-8">
            Download the free PDF template below — or skip the paperwork entirely and have renters sign on their phone
            in 60 seconds for 6¢ a waiver, with no monthly fee.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base">
              <a href={PDF} download>
                <Download className="mr-2 h-4 w-4" /> Download Free PDF Template
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Link to="/signup">
                Send Waivers Digitally <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> No email required</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Signs in 60 seconds</span>
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Tamper-proof audit trail</span>
          </div>
        </div>
      </section>

      <SeoSection title="What a Rental Liability Waiver Includes" muted>
        <div className="space-y-4 text-sm text-muted-foreground max-w-3xl">
          <p>
            Every enforceable rental waiver does four things: it identifies the specific risks, it states that the
            renter accepts them, it releases the owner from liability for covered claims, and it is signed with proof of
            who signed and when. The free template below contains all nine standard clauses:
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {[
            { t: "Assumption of risk", d: "The renter acknowledges the specific hazards of your property or equipment." },
            { t: "Release of liability", d: "Releases you from claims arising from ordinary negligence, to the extent state law allows." },
            { t: "Minors & guardians", d: "Names each minor in the party and records the guardian's acceptance of responsibility." },
            { t: "Rules & safety", d: "Occupancy limits, no impairment, supervision around water, fire, and machinery." },
            { t: "Damage responsibility", d: "Financial responsibility for damage beyond normal wear and tear." },
            { t: "Indemnification", d: "The renter covers costs if a claim is brought by them or their party." },
            { t: "Medical authorization", d: "Permission to arrange emergency treatment if someone is hurt." },
            { t: "Governing law", d: "The state whose law applies, plus a severability clause." },
            { t: "Signature & proof", d: "Signature, printed name, date, and contact details — plus timestamp and IP when signed digitally." },
          ].map((c) => (
            <Card key={c.t}>
              <CardContent className="pt-6">
                <FileText className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1.5">{c.t}</h3>
                <p className="text-sm text-muted-foreground">{c.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <Button asChild variant="outline">
            <a href={PDF} download>
              <Download className="mr-2 h-4 w-4" /> Download the free rental liability waiver (PDF)
            </a>
          </Button>
        </div>
      </SeoSection>

      <SeoSection title="Paper PDF vs. Digital Rental Waiver">
        <div className="space-y-4 text-sm text-muted-foreground max-w-3xl mb-6">
          <p>
            A printed waiver is better than nothing, but it only helps if you can produce it years later and prove who
            signed it. Here is how the two compare in practice:
          </p>
        </div>
        <ComparisonTable
          headers={["", "Printed PDF waiver", "Digital rental waiver"]}
          rows={[
            ["Cost", "Free (plus printing)", "6¢ per signed waiver, no monthly fee"],
            ["Signed before arrival", "Rarely — signed at the counter", "Yes — link sent at booking confirmation"],
            ["Proof of who signed", "A signature on paper", "Signature + timestamp + IP + device"],
            ["Storage", "Binder or scanner", "Searchable, stored automatically"],
            ["Group & minors", "Manual, often incomplete", "Group links and named minors built in"],
            ["Lost waivers", "Common", "None — nothing to misplace"],
          ]}
        />
      </SeoSection>

      <SeoSection title="Rental Waivers by Business Type" muted>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "Vacation & short-term rentals", to: "/p/vacation-rental-waiver" },
            { label: "Bounce house & party rentals", to: "/waivers/bounce-house-rental-waivers" },
            { label: "Rental waiver software", to: "/rental-waiver-software" },
            { label: "Rental agreement templates", to: "/p/rental-agreement" },
            { label: "All waiver templates", to: "/waiver-templates" },
            { label: "Waiver laws by state", to: "/waiver-laws" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:border-primary transition-colors"
            >
              {l.label}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Collect It Digitally for 6¢ a Signature">
        <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-sm text-muted-foreground">
          <p>
            Upload the template, send a link when a booking is confirmed, or post a QR code at your counter. Renters
            read, add their party and minors, and sign on their phone — no app, no printing.{" "}
            <strong className="text-foreground">Your first 250 signatures are free, and there is never a monthly fee.</strong>
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "6¢", label: "Per signed waiver" },
              { value: "$0", label: "Monthly fee, ever" },
              { value: "250", label: "Free signatures to start" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-heading text-2xl md:text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="flex items-center gap-2 pt-2">
            <Smartphone className="h-4 w-4 text-primary" /> Average signing time: 60 seconds on a phone.
          </p>
        </div>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <SeoCta
        headline="Get your rental liability waiver signed before the next rental"
        subtext="Free PDF template, or digital signing at 6¢ per waiver with no monthly fee and 250 free signatures."
      />

      <InternalLinks currentSlug="rental-liability-waiver" />
    </SeoPageLayout>
  );
}
