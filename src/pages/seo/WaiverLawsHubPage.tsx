import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Scale, Shield, AlertTriangle, Users } from "lucide-react";

const strongStates = [
  { state: "California", note: "Generally enforces waivers with clear, unambiguous language. Cannot waive gross negligence." },
  { state: "Florida", note: "Strong waiver enforcement tradition. Specific PWC/watercraft rental regulations. Cannot waive gross negligence." },
  { state: "Texas", note: "Pro-business approach. Waivers generally enforceable with proper drafting. Specific equine liability protections." },
  { state: "Colorado", note: "Very waiver-friendly. Strong enforceability for recreational activities. Specific ski area protections." },
];

const challengeStates = [
  { state: "Montana", note: "Courts have narrowed waiver enforceability in some recreational contexts." },
  { state: "Virginia", note: "More scrutiny on waiver language and conspicuousness." },
  { state: "New York", note: "General Obligations Law §5-326 voids waivers for certain recreational facilities." },
  { state: "Louisiana", note: "Civil law system treats waivers differently than common law states." },
];

export default function WaiverLawsHubPage() {
  return (
    <SeoPageLayout
      metaTitle="Liability Waiver Laws by State | What Rental Businesses Need to Know"
      metaDescription="Are liability waivers enforceable in your state? Learn state-by-state waiver laws for rental businesses — what to include, what to avoid, and how to stay protected."
    >
      <SeoHero
        badge="Legal Guide"
        h1="Liability Waiver Laws by State — What Rental Businesses Need to Know"
        subtitle="Understanding waiver enforceability is the first step to protecting your business"
        description="Liability waiver law varies significantly from state to state. What's enforceable in Colorado might face challenges in New York. This guide gives rental business owners a clear overview of waiver law across the US — so you can draft waivers that actually protect you."
      />

      <SeoSection title="Are Liability Waivers Enforceable?" muted>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Generally, yes</strong> — but with important exceptions. Liability waivers are contracts, and courts interpret them under contract law principles. At the federal level, two laws establish the legal framework for electronic waivers:</p>
          <div className="grid md:grid-cols-2 gap-4 my-6">
            <Card>
              <CardContent className="pt-6">
                <Scale className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">E-SIGN Act (2000)</h3>
                <p className="text-sm text-muted-foreground">Federal law establishing that electronic signatures and records cannot be denied legal effect solely because they are electronic. Applies nationwide.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">UETA (State Level)</h3>
                <p className="text-sm text-muted-foreground">Adopted by 49 states plus DC. Provides the state-level framework ensuring electronic transactions carry the same weight as paper.</p>
              </CardContent>
            </Card>
          </div>
          <p>These laws mean digital waivers signed on a phone are just as legally valid as ink-on-paper waivers. The key is <em>how</em> the waiver is drafted and presented.</p>
        </div>
      </SeoSection>

      <SeoSection title="What Makes a Waiver Legally Enforceable?">
        <div className="space-y-4">
          {[
            { title: "Clear and Conspicuous Language", desc: "The waiver must be written in plain, understandable language. Courts disfavor buried or obscured liability releases. The release clause should be prominent — not hidden in paragraph 47 of a 50-paragraph document." },
            { title: "Specific Risk Disclosure", desc: "The waiver should identify the specific risks associated with the activity. A kayak rental waiver should mention drowning, capsizing, and cold water exposure — not just generic 'risks of participation.'" },
            { title: "No Gross Negligence Protection", desc: "No state allows a business to waive liability for gross negligence or intentional harm. Your waiver protects against ordinary negligence claims — not reckless behavior by your staff." },
            { title: "No Public Policy Violation", desc: "Waivers cannot violate public policy. Some states restrict waivers for essential services or activities where there's a significant power imbalance between parties." },
            { title: "Capacity and Voluntariness", desc: "The signer must have the legal capacity to sign (age, mental competence) and must sign voluntarily. Coerced or rushed waivers face enforceability challenges." },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">{i + 1}</div>
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="States With Strong Waiver Enforcement" muted>
        <div className="space-y-4">
          {strongStates.map((s) => (
            <Card key={s.state}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{s.state}</h3>
                    <p className="text-sm text-muted-foreground">{s.note}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="States Where Waivers Face Challenges">
        <div className="space-y-4">
          {challengeStates.map((s) => (
            <Card key={s.state}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{s.state}</h3>
                    <p className="text-sm text-muted-foreground">{s.note}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">Even in these states, well-drafted waivers provide meaningful protection. Consult a local attorney to ensure your waiver meets your state's specific requirements.</p>
      </SeoSection>

      <SeoSection title="Minors and Waivers" muted>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex gap-3 items-start">
            <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="mb-3"><strong className="text-foreground">In most states, minors cannot waive their own legal rights.</strong> A parent or guardian can sign on behalf of a minor, but the enforceability of that parental waiver varies significantly by state.</p>
              <p className="mb-3">Some states (like California) have held that a parent's pre-injury waiver on behalf of a minor is enforceable. Others (like many Northeast states) are more skeptical.</p>
              <p>For rental businesses that serve families — kayak rentals, bounce houses, ski shops — this is critical. Always include a separate guardian signature field and consult your attorney about your state's position on parental waivers.</p>
            </div>
          </div>
        </div>
      </SeoSection>

      <SeoSection title="Digital Signatures and Waiver Law">
        <div className="space-y-4 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Electronic signatures are legally equivalent to ink signatures</strong> for liability waivers under both the E-SIGN Act and UETA. Courts have consistently upheld digital waivers when they meet the same substantive requirements as paper waivers.</p>
          <p>In fact, digital waivers are often <em>stronger</em> in court because they capture evidence that paper cannot:</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>Exact timestamp of signature</li>
            <li>IP address of the signing device</li>
            <li>Browser and device information</li>
            <li>Complete audit trail (when sent, opened, signed)</li>
            <li>Tamper-proof PDF storage with hash verification</li>
          </ul>
          <p>When an insurance company asks "can you prove they signed?" — a digital waiver with full audit trail is far more convincing than a smudged piece of paper from a filing cabinet.</p>
        </div>
      </SeoSection>

      <SeoFaq items={[
        { question: "Are digital waivers legally binding?", answer: "Yes. Under the E-SIGN Act and UETA, electronic signatures carry the same legal weight as ink signatures in all 50 US states. Digital waivers with proper audit trails are often stronger in court than paper waivers." },
        { question: "Can a parent sign a waiver for a minor?", answer: "In most states, a parent or guardian can sign a liability waiver on behalf of a minor. However, the enforceability varies by state. Always include a separate guardian signature field and consult your local attorney." },
        { question: "Can a waiver protect against all lawsuits?", answer: "No. Waivers protect against ordinary negligence claims but cannot protect against gross negligence, intentional harm, or violations of public policy. A waiver reduces your litigation risk significantly but is not absolute immunity." },
        { question: "Do I need a lawyer to create a waiver?", answer: "While our templates follow general best practices, we strongly recommend having a licensed attorney in your state review your waiver. State-specific requirements can significantly impact enforceability." },
        { question: "How long should I keep signed waivers?", answer: "Most attorneys recommend keeping signed waivers for at least the applicable statute of limitations in your state (typically 2-6 years for personal injury). RentalWaivers stores signed waivers for 7 years by default." },
        { question: "Does my waiver need to mention specific risks?", answer: "Yes. Courts strongly favor waivers that identify the specific risks of the activity rather than using generic language. A kayak rental waiver should mention drowning, capsizing, and weather-related risks specifically." },
        { question: "What if someone signs but didn't read the waiver?", answer: "Courts generally hold that a signer is bound by the terms of a waiver they signed, whether they read it or not — as long as the waiver was presented clearly and conspicuously. Digital waivers that require scrolling through the full text strengthen this defense." },
        { question: "Are waivers enforceable for high-risk activities?", answer: "Generally yes — in fact, waivers are most commonly used and enforced for high-risk activities like water sports, off-road vehicles, and equestrian activities. The key is proper drafting with specific risk disclosures." },
      ]} />

      <SeoCta
        headline="Get a compliant digital waiver live today"
        subtext="Legally-reviewed templates. Full audit trails. No monthly fee."
      />
    </SeoPageLayout>
  );
}
