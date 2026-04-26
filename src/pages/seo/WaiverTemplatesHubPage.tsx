import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta, ComparisonTable } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowRight, CheckCircle } from "lucide-react";

const templates = [
  { name: "Kayak Rental Waiver", slug: "kayak-rental-waiver-template" },
  { name: "Bike Rental Waiver", slug: "bike-rental-waiver-template" },
  { name: "ATV Rental Waiver", slug: "atv-rental-waiver-template" },
  { name: "Boat Rental Waiver", slug: "boat-rental-waiver-template" },
  { name: "Bounce House Waiver", slug: "bounce-house-rental-waiver-template" },
  { name: "Equipment Rental Waiver", slug: "equipment-rental-waiver-template" },
  { name: "Jet Ski Rental Waiver", slug: "jet-ski-rental-waiver-template" },
  { name: "Scooter Rental Waiver", slug: "scooter-rental-waiver-template" },
  { name: "RV Rental Waiver", slug: "rv-rental-waiver-template" },
  { name: "Paddleboard Rental Waiver", slug: "paddleboard-rental-waiver-template" },
  { name: "Snowmobile Rental Waiver", slug: "snowmobile-rental-waiver-template" },
  { name: "Paintball Waiver", slug: "paintball-waiver-template" },
  { name: "Escape Room Waiver", slug: "escape-room-waiver-template" },
  { name: "Trampoline Park Waiver", slug: "trampoline-park-waiver-template" },
  { name: "Axe Throwing Waiver", slug: "axe-throwing-waiver-template" },
  { name: "Surfboard Rental Waiver", slug: "surfboard-rental-waiver-template" },
  { name: "Segway Tour Waiver", slug: "segway-tour-waiver-template" },
  { name: "Drone Rental Waiver", slug: "drone-rental-waiver-template" },
  { name: "Climbing Gym Waiver", slug: "climbing-gym-waiver-template" },
  { name: "Go-Kart Track Waiver", slug: "go-kart-rental-waiver-template" },
  { name: "Zipline Tour Waiver", slug: "zipline-tour-waiver-template" },
  { name: "Fitness Class Waiver", slug: "fitness-class-waiver-template" },
];

const requiredClauses = [
  "Assumption of Risk — Participant acknowledges the inherent risks of the activity",
  "Release of Liability — Participant releases the operator from negligence claims",
  "Indemnification — Participant agrees to indemnify the operator against third-party claims",
  "Photo/Video Release — Permission to use images for marketing (optional but recommended)",
  "Medical Consent — Authorization for emergency medical treatment",
  "Data Collection Consent — GDPR/CCPA compliance for storing personal information",
  "Governing Law — Which state's laws govern the waiver agreement",
];

export default function WaiverTemplatesHubPage() {
  return (
    <SeoPageLayout
      metaTitle="Free Rental Waiver Templates — Download or Sign Digitally | RentalWaivers"
      metaDescription="Download free, legally-reviewed waiver templates for rental businesses. Kayak, boat, ATV, bike, jet ski, equipment, and more. Customize and go digital in minutes."
      canonicalPath="/waiver-templates"
    >
      <SeoHero
        badge="Free Templates"
        h1="Free Rental Waiver Templates — Download or Sign Digitally"
        subtitle="Legally-reviewed waiver templates for every rental business type"
        description="Start with a professionally-crafted waiver template, customize it for your business, and either download as a PDF or go digital with RentalWaivers in under 5 minutes. Every template includes the essential legal clauses rental businesses need."
      />

      <SeoSection title="Browse by Rental Type" muted>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {templates.map((t) => (
            <Link to={`/waiver-templates/${t.slug}`} key={t.slug}>
              <Card className="h-full hover:border-primary/40 transition-colors text-center group">
                <CardContent className="pt-6 pb-4">
                  <FileText className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">{t.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="What Every Rental Waiver Template Should Include">
        <div className="space-y-3">
          {requiredClauses.map((clause, i) => (
            <div key={i} className="flex gap-3 items-start">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{clause}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6 p-4 bg-muted/50 rounded-lg">
          <strong className="text-foreground">Legal Disclaimer:</strong> These templates are provided for informational purposes and are not a substitute for legal advice. We recommend having an attorney licensed in your state review your waiver before use. Waiver enforceability varies by state — see our <Link to="/waiver-laws" className="text-primary hover:underline">state-by-state waiver law guide</Link> for details.
        </p>
      </SeoSection>

      <SeoSection title="Are These Templates Legally Valid?" muted>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Our templates are crafted following general best practices for liability waiver enforceability under US law. However, waiver law varies significantly by state:</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>Some states enforce waivers broadly (Colorado, California, Texas, Florida)</li>
            <li>Some states restrict waiver scope for certain activities</li>
            <li>Most states do NOT allow waiving a minor's rights — guardian signatures provide limited protection</li>
            <li>No state allows waiving claims for gross negligence or intentional harm</li>
          </ul>
          <p>Electronic signatures are legally binding under the E-SIGN Act (federal) and UETA (adopted by 49 states + DC). When you go digital with RentalWaivers, every signature includes timestamps, IP addresses, and device information that strengthens legal defensibility.</p>
          <Link to="/waiver-laws" className="text-primary hover:underline inline-flex items-center gap-1">Read state-specific waiver laws <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </SeoSection>

      <SeoSection title="Paper Template vs. Digital Waiver">
        <ComparisonTable
          headers={["", "Paper Template", "Digital (RentalWaivers)"]}
          rows={[
            ["Signing Speed", "2–5 minutes with clipboard", "Under 60 seconds on phone"],
            ["Storage", "Filing cabinets (lost, damaged)", "Cloud storage for 7+ years"],
            ["Retrieval", "Manual search through boxes", "Instant search by name/date"],
            ["Legal Evidence", "Faded ink, lost forms", "Timestamped, IP-logged audit trail"],
            ["Weather Resistance", "Vulnerable to water/sun/wind", "100% digital"],
            ["Cost Per Waiver", "Printing + storage + staff time", "Starting at 6¢"],
            ["Pre-Arrival Signing", "Not possible", "Email or text link before arrival"],
            ["Group Signing", "Pass clipboard around", "One link, everyone signs on their phone"],
          ]}
        />
      </SeoSection>

      <SeoSection title="How to Go Digital in 10 Minutes" muted>
        <div className="space-y-6">
          {[
            { step: 1, title: "Pick a Template", desc: "Choose the template that matches your rental type. Download it to review, or click 'Use This Template' to start customizing in our editor." },
            { step: 2, title: "Customize for Your Business", desc: "Add your business name, specific equipment details, local legal requirements, and any custom fields you need (experience level, emergency contacts, etc.)." },
            { step: 3, title: "Start Collecting Signatures", desc: "Share via email, QR code, or kiosk tablet. Customers sign on their phone in under a minute. Every signature is stored securely with a full audit trail." },
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

      <SeoFaq items={[
        { question: "Are these waiver templates free?", answer: "Yes. All templates are free to download and review. You can use them as paper waivers or go digital with RentalWaivers starting at 6¢ per signature." },
        { question: "Can I customize the templates?", answer: "Absolutely. Edit the language, add custom fields, include your logo, and tailor the waiver to your specific business needs and state requirements." },
        { question: "Do I need a lawyer to use these templates?", answer: "While our templates follow general best practices, we always recommend having a licensed attorney in your state review your waiver. Waiver enforceability varies by jurisdiction." },
        { question: "What's the difference between downloading and going digital?", answer: "Downloading gives you a PDF/document you can print and use on paper. Going digital means customers sign electronically on their phone with timestamps, audit trails, and secure cloud storage." },
        { question: "Can I use these templates with other waiver software?", answer: "Yes — the template language works regardless of platform. But RentalWaivers is the only platform built specifically for rental businesses with pay-per-waiver pricing." },
        { question: "Are there templates for minor participants?", answer: "Each template can be customized to include guardian/parent signature fields for minor participants. Most states do not allow minors to waive their own rights." },
        { question: "How often are templates updated?", answer: "We review and update templates periodically to reflect changes in state laws and best practices. Always verify with your attorney that your waiver meets current legal standards." },
        { question: "Can I use one template for multiple activities?", answer: "You can, but we recommend creating separate templates for activities with different risk profiles. A kayak rental waiver should address different risks than an ATV rental waiver." },
      ]} />

      <SeoCta
        headline="Stop printing waivers — go digital today"
        subtext="Pick a template, customize it, and start collecting digital signatures in under 10 minutes."
      />
    </SeoPageLayout>
  );
}
