import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSearch, Shield, AlertTriangle, CheckCircle, Coins, Zap, FileText,
  BadgeCheck, Pencil, Briefcase, ShieldCheck, BookOpen, ArrowRight, Target,
  Download, Clock, Scale, Brain,
} from "lucide-react";

const PRICING_TIERS = [
  { label: "Base Scan", credits: "10 / page", desc: "Risk score, clause analysis, red flags, missing clauses, and negotiation points", icon: FileSearch },
  { label: "AI Verification", credits: "+10", desc: "A second AI reviews the first analysis for accuracy and missed risks", icon: BadgeCheck },
  { label: "Redline Suggestions", credits: "+10", desc: "Specific text changes to strengthen your legal position", icon: Pencil },
  { label: "Executive Brief", credits: "+5", desc: "One-page C-level summary with recommendation and action items", icon: Briefcase },
  { label: "Compliance Check", credits: "+10", desc: "GDPR, CCPA, SOC2, HIPAA regulatory gap analysis", icon: ShieldCheck },
  { label: "Playbook Comparison", credits: "+10", desc: "Grade every clause against industry best-practice language", icon: BookOpen },
];

const FEATURES = [
  { title: "Instant Risk Scoring", desc: "Get a 0-100 risk score in under 60 seconds. Know exactly where you stand before you sign.", icon: Target },
  { title: "Clause-by-Clause Breakdown", desc: "Every clause is extracted, categorized, and rated for risk level — low, medium, high, or critical.", icon: FileText },
  { title: "Missing Clause Detection", desc: "AI identifies standard clauses that are absent from the contract and explains why they matter.", icon: AlertTriangle },
  { title: "Negotiation Playbook", desc: "Actionable suggestions for every clause that needs improvement, prioritized by impact.", icon: Scale },
  { title: "Multi-Pass AI Analysis", desc: "Stack up to 5 premium add-ons for deeper analysis. Each add-on runs a specialized AI pass.", icon: Brain },
  { title: "PDF Report Export", desc: "Download a formatted PDF report of the full analysis — perfect for sharing with legal teams.", icon: Download },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Paste Your Contract", desc: "Copy and paste the full text of any contract — rental agreements, vendor contracts, NDAs, leases, and more." },
  { step: "2", title: "Choose Your Add-ons", desc: "Select which premium AI passes you want: verification, redlines, compliance check, playbook comparison, or executive brief." },
  { step: "3", title: "Get Your Report", desc: "In under 90 seconds, receive a complete risk analysis with actionable insights. Download the PDF and share with your team." },
];

const FAQ_DATA = [
  { question: "How much does a contract scan cost?", answer: "The base scan costs 10 credits per page (approximately 3,000 characters). Premium add-ons cost between 5-10 credits each. A typical 5-page contract with all add-ons enabled costs approximately 95 credits." },
  { question: "What types of contracts can I scan?", answer: "The Contract Risk Scanner handles any English-language contract — rental agreements, vendor contracts, NDAs, service agreements, employment contracts, lease agreements, partnership agreements, and more." },
  { question: "Is this legal advice?", answer: "No. The Contract Risk Scanner is an AI-powered analysis tool that identifies potential risks and provides suggestions. It does not constitute legal advice. Always consult with a licensed attorney for legal decisions." },
  { question: "How accurate is the AI analysis?", answer: "The base scan uses frontier-class AI models (GPT/Gemini) that perform well on legal text comprehension. For maximum confidence, enable the AI Verification add-on which runs a second independent AI review and reports a confidence score." },
  { question: "Can I download the results?", answer: "Yes. Every completed scan includes a Download PDF Report button that generates a formatted, printable PDF containing the full analysis and all add-on results." },
  { question: "How are pages calculated?", answer: "One page is approximately 3,000 characters of text. The scanner estimates pages automatically as you paste text, so you know the cost before you scan." },
  { question: "What happens to my contract data?", answer: "Your contract text is processed in real-time and the analysis is stored securely in your account. We do not use your contract data to train AI models. You can delete scan records at any time." },
];

export default function ContractScannerPage() {
  return (
    <SeoPageLayout
      metaTitle="AI Contract Risk Scanner — Instant Legal Risk Analysis | RentalWaivers"
      metaDescription="Upload any contract and get an instant AI risk analysis. Clause extraction, red flag detection, compliance checks, and negotiation points — all for 10 credits per page."
      canonicalPath="/contract-scanner-info"
    >
      <SeoHero
        badge="AI-Powered"
        h1="Contract Risk Scanner: Know What You're Signing in 60 Seconds"
        subtitle="Paste any contract. Get instant risk scoring, clause analysis, and negotiation points."
        description="Stop reading 30-page contracts line by line. Our AI scans every clause, flags hidden risks, identifies missing protections, and gives you a plain-English action plan — all in under 90 seconds."
      />

      {/* Social proof bar */}
      <SeoSection title="Trusted by Businesses Everywhere">
        <div className="flex flex-wrap justify-center gap-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" />AI-powered by GPT & Gemini</div>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Enterprise-grade security</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Results in under 90 seconds</div>
          <div className="flex items-center gap-2"><Coins className="h-4 w-4 text-primary" />Pay only for what you scan</div>
        </div>
      </SeoSection>

      {/* How It Works */}
      <SeoSection title="How It Works" muted>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step) => (
            <Card key={step.step} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">{step.step}</div>
                <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      {/* Features */}
      <SeoSection title="What You Get in Every Scan">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <f.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-heading font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      {/* Credit Pricing */}
      <SeoSection title="Transparent Credit Pricing" muted>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          No subscriptions. No hidden fees. Pay per scan with credits — start with the base analysis and stack premium add-ons when you need deeper insights.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRICING_TIERS.map((tier, idx) => (
            <Card key={tier.label} className={idx === 0 ? "border-primary/40 bg-primary/5" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <tier.icon className="h-5 w-5 text-primary" />
                  <span className="flex items-center gap-1 text-sm font-bold text-primary">
                    <Coins className="h-3.5 w-3.5" />
                    {tier.credits}
                  </span>
                </div>
                <h3 className="font-heading font-semibold mb-1">{tier.label}</h3>
                <p className="text-xs text-muted-foreground">{tier.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Example cost */}
        <Card className="mt-8 max-w-xl mx-auto border-primary/20">
          <CardContent className="py-6">
            <h4 className="font-heading font-semibold text-center mb-4">Example: 5-Page Vendor Contract</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Base scan (5 pages × 10)</span><span className="font-medium">50 credits</span></div>
              <div className="flex justify-between text-muted-foreground"><span>+ AI Verification</span><span>10 credits</span></div>
              <div className="flex justify-between text-muted-foreground"><span>+ Redline Suggestions</span><span>10 credits</span></div>
              <div className="flex justify-between text-muted-foreground"><span>+ Executive Brief</span><span>5 credits</span></div>
              <div className="flex justify-between text-muted-foreground"><span>+ Compliance Check</span><span>10 credits</span></div>
              <div className="flex justify-between text-muted-foreground"><span>+ Playbook Comparison</span><span>10 credits</span></div>
              <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span className="text-primary">95 credits</span></div>
            </div>
          </CardContent>
        </Card>
      </SeoSection>

      {/* Use cases */}
      <SeoSection title="Who Uses the Contract Scanner?">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Rental Operators", desc: "Review vendor and supplier agreements before signing to protect your business." },
            { title: "Property Managers", desc: "Scan lease templates, contractor agreements, and insurance documents." },
            { title: "Small Business Owners", desc: "Understand what you're agreeing to without paying $500/hr for a lawyer." },
            { title: "Freelancers & Consultants", desc: "Check client contracts for unfavorable terms, IP ownership, and payment clauses." },
          ].map((uc) => (
            <Card key={uc.title}>
              <CardContent className="pt-6">
                <h3 className="font-heading font-semibold mb-1">{uc.title}</h3>
                <p className="text-xs text-muted-foreground">{uc.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      {/* Deep content for SEO */}
      <SeoSection title="Why AI Contract Analysis Matters" muted>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>Businesses sign an average of 20-40 contracts per year, and most decision-makers admit they don't read every clause carefully. Hidden auto-renewal terms, one-sided indemnification clauses, and missing liability caps cost businesses thousands of dollars — and they only discover the problem when it's too late.</p>
          <p>Traditional legal review costs $300-$600 per hour. For a standard vendor contract, that means $1,500-$3,000 in legal fees for a single review. AI contract analysis doesn't replace your attorney — it gives you a detailed risk map before you involve legal counsel, saving time and ensuring nothing gets missed.</p>
          <p>Our Contract Risk Scanner uses frontier-class AI models (the same technology behind GPT and Gemini) fine-tuned for legal text comprehension. Each scan extracts every clause, assigns a risk rating, identifies missing standard protections, and generates plain-English negotiation suggestions your team can act on immediately.</p>
          <p>For businesses that handle multiple contracts regularly, the credit-based pricing model is significantly more cost-effective than per-contract flat fees. A typical 5-page contract analyzed with all premium add-ons costs 95 credits — less than $6 depending on your credit package. Compare that to hiring a paralegal for the same work.</p>
        </div>
      </SeoSection>

      <SeoFaq items={FAQ_DATA} />

      <SeoCta
        headline="Ready to Know What You're Signing?"
        subtext="Paste your first contract and get an AI risk analysis in under 90 seconds. No subscription required — pay only for what you scan."
      />
    </SeoPageLayout>
  );
}
