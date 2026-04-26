import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta, ComparisonTable } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, XCircle, Minus } from "lucide-react";

const competitors = [
  { name: "Smartwaiver", slug: "smartwaiver-alternative", pricing: "$18–$260+/mo", focus: "Generic", angle: "No monthly fee vs $18–$260/mo lock-in", priority: "P1" },
  { name: "WaiverForever", slug: "waiverforever-alternative", pricing: "Monthly subscription", focus: "Generic", angle: "Pay-per-use vs subscription lock", priority: "P1" },
  { name: "WaiverFile", slug: "waiverfile-alternative", pricing: "$19+/mo", focus: "Generic", angle: "Rental-built vs generic tool", priority: "P1" },
  { name: "WaiverSign", slug: "waiversign-alternative", pricing: "$10–$12/mo", focus: "Generic", angle: "Flexible credits vs only 2 tiers", priority: "P1" },
  { name: "Wherewolf", slug: "wherewolf-alternative", pricing: "Custom/enterprise", focus: "Activity operators", angle: "Affordable vs enterprise pricing", priority: "P2" },
  { name: "Jotform", slug: "jotform-waiver-alternative", pricing: "Free–$99/mo", focus: "Form tool", angle: "Purpose-built vs form hack", priority: "P2" },
  { name: "DocuSign", slug: "docusign-waiver-alternative", pricing: "$15–$45+/mo", focus: "Contracts", angle: "Waiver-native vs contract overkill", priority: "P2" },
  { name: "PandaDoc", slug: "pandadoc-waiver-alternative", pricing: "$19+/mo", focus: "Sales docs", angle: "Simple pricing vs complex platform", priority: "P2" },
];

const features = [
  { feature: "QR Code Signing", rw: true, sw: true, wf: true, wfile: false, jot: false },
  { feature: "Group Waivers", rw: true, sw: true, wf: true, wfile: false, jot: false },
  { feature: "Pay-Per-Use Pricing", rw: true, sw: false, wf: false, wfile: false, jot: false },
  { feature: "Rental-Specific Templates", rw: true, sw: false, wf: false, wfile: false, jot: false },
  { feature: "Kiosk Mode", rw: true, sw: true, wf: true, wfile: true, jot: false },
  { feature: "Audit Trail", rw: true, sw: true, wf: true, wfile: true, jot: false },
  { feature: "API Access", rw: true, sw: true, wf: true, wfile: false, jot: true },
  { feature: "No Monthly Fee", rw: true, sw: false, wf: false, wfile: false, jot: false },
  { feature: "Seasonal Pause (Free)", rw: true, sw: false, wf: false, wfile: false, jot: false },
  { feature: "Multi-Location", rw: true, sw: true, wf: true, wfile: false, jot: false },
];

function Check({ val }: { val: boolean }) {
  return val
    ? <CheckCircle className="h-4 w-4 text-primary" />
    : <XCircle className="h-4 w-4 text-muted-foreground/40" />;
}

export default function CompareHubPage() {
  return (
    <SeoPageLayout
      metaTitle="Compare Waiver Software | RentalWaivers vs Competitors (2025)"
      metaDescription="Compare RentalWaivers to Smartwaiver, WaiverForever, WaiverFile, DocuSign, and more. See pricing, features, and why rental businesses switch to pay-per-waiver."
      canonicalPath="/compare"
    >
      <SeoHero
        badge="Honest Comparisons"
        h1="Compare Waiver Software for Rental Businesses"
        subtitle="See how RentalWaivers stacks up against every major competitor"
        description="We believe in transparent comparisons. Every competitor has strengths — we'll be honest about when they might be the better fit. But for rental businesses that need seasonal flexibility, pay-per-use pricing, and rental-specific features, we think the choice is clear."
      />

      <SeoSection title="Quick Competitor Overview" muted>
        <div className="space-y-3">
          {competitors.map((c) => (
            <Link to={`/alternatives/${c.slug}`} key={c.slug}>
              <Card className="hover:border-primary/40 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{c.name} Alternative</h3>
                      <p className="text-sm text-muted-foreground">{c.angle}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{c.pricing}</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Feature Comparison Matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-muted">
                <th className="text-left py-3 px-4 font-semibold">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-primary">RentalWaivers</th>
                <th className="text-center py-3 px-4 font-semibold">Smartwaiver</th>
                <th className="text-center py-3 px-4 font-semibold">WaiverForever</th>
                <th className="text-center py-3 px-4 font-semibold">WaiverFile</th>
                <th className="text-center py-3 px-4 font-semibold">Jotform</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={i} className="border-t">
                  <td className="py-3 px-4 font-medium">{f.feature}</td>
                  <td className="py-3 px-4 text-center"><Check val={f.rw} /></td>
                  <td className="py-3 px-4 text-center"><Check val={f.sw} /></td>
                  <td className="py-3 px-4 text-center"><Check val={f.wf} /></td>
                  <td className="py-3 px-4 text-center"><Check val={f.wfile} /></td>
                  <td className="py-3 px-4 text-center"><Check val={f.jot} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SeoSection>

      <SeoSection title="Pricing Comparison" muted>
        <p className="text-sm text-muted-foreground mb-6">What each platform costs at different waiver volumes per month:</p>
        <ComparisonTable
          headers={["Monthly Waivers", "RentalWaivers", "Smartwaiver", "WaiverForever", "WaiverFile", "WaiverSign"]}
          rows={[
            ["50 waivers", "$5", "$18/mo", "$18/mo", "$19/mo", "$10/mo"],
            ["100 waivers", "$10", "$18/mo", "$18/mo", "$19/mo", "$10/mo"],
            ["500 waivers", "$40", "$49/mo", "$99/mo", "$49/mo", "$12/mo"],
            ["1,000 waivers", "$80", "$99/mo", "$99/mo", "$99/mo", "$12/mo"],
            ["2,500 waivers", "$150", "$260/mo", "$260/mo", "Custom", "$12/mo"],
            ["Off-season (0)", "$0", "$18–$260/mo", "$18–$260/mo", "$19–$99/mo", "$10–$12/mo"],
          ]}
        />
        <p className="text-sm text-muted-foreground mt-4">
          <strong className="text-foreground">Key insight:</strong> With subscription platforms, you pay the same amount whether you process 1,000 waivers or zero. With RentalWaivers, your off-season cost is $0.
        </p>
      </SeoSection>

      <SeoSection title="What Makes RentalWaivers Different">
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Best For RentalWaivers</h3>
            <ul className="space-y-2">
              {[
                "Seasonal rental operations (kayak, ski, boat)",
                "Small-to-mid size rental businesses",
                "Multi-activity operators (bikes + kayaks + SUPs)",
                "Cost-conscious operators who hate paying for idle months",
                "Businesses that want rental-specific templates",
                "Operators who need QR code check-in at the counter",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">When a Competitor Might Be Better</h3>
            <ul className="space-y-2">
              {[
                "Very high volume year-round (10,000+ waivers/month) — flat-rate subscriptions may be cheaper",
                "Enterprise with 50+ locations — Wherewolf's enterprise support may fit better",
                "Need advanced form logic beyond waivers — Jotform's form builder is more flexible",
                "Need full contract management — DocuSign handles complex multi-party contracts",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <Minus className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SeoSection>

      <SeoFaq items={[
        { question: "Why should I switch from Smartwaiver?", answer: "If you're a seasonal rental business paying $49+/month year-round, switching to RentalWaivers' pay-per-waiver model could save you 50-90% annually. You only pay when waivers are signed — $0 during your off-season." },
        { question: "Is it hard to switch waiver providers?", answer: "No. Create your waiver template in RentalWaivers (under 10 minutes), update your QR codes or email links, and you're live. There's no data migration needed — new waivers are collected in the new system." },
        { question: "Can I try RentalWaivers before committing?", answer: "Yes. Sign up free and receive 250 welcome credits — no credit card required. Test the entire platform before spending a dollar." },
        { question: "What if I need more features than RentalWaivers offers?", answer: "We're honest about our focus: rental businesses. If you need advanced form logic, complex contract workflows, or enterprise-scale operations, one of our competitors may be a better fit. We'd rather you choose the right tool than the wrong one." },
        { question: "How does pay-per-waiver pricing work?", answer: "Buy credits in bulk (200 for $20 up to 8,000 for $500). One credit is used each time a waiver is signed. Credits never expire. No monthly fees, no contracts." },
      ]} />

      <SeoCta
        headline="Try RentalWaivers free — 250 credits on us"
        subtext="No credit card. No monthly fee. No commitment. See why rental businesses are switching."
      />
    </SeoPageLayout>
  );
}
