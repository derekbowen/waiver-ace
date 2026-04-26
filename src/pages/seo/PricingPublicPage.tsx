import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta, ComparisonTable } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Coins, Zap, Shield, Clock } from "lucide-react";

const packages = [
  { credits: "200", price: "$20", per: "10¢", best: "" },
  { credits: "550", price: "$50", per: "9¢", best: "" },
  { credits: "1,250", price: "$100", per: "8¢", best: "Most Popular" },
  { credits: "8,000", price: "$500", per: "6¢", best: "Best Value" },
];

export default function PricingPublicPage() {
  return (
    <SeoPageLayout
      metaTitle="RentalWaivers Pricing — Pay Per Waiver, No Subscription Required"
      metaDescription="RentalWaivers charges per waiver signed — not per month. Starting at 6¢ per signature. No monthly fees, no contracts, no off-season charges. See pricing."
      canonicalPath="/pricing-info"
    >
      <SeoHero
        badge="Simple Pricing"
        h1="Pay Per Waiver — Not Per Month"
        subtitle="No subscription. No contracts. No off-season charges."
        description="Most waiver software charges $18–$260+ per month whether you use it or not. RentalWaivers charges only when a waiver is actually signed. Buy credits in bulk, use them when you need them, and never pay for months you're closed."
      />

      <section className="container max-w-4xl pb-16">
        <div className="grid md:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.credits} className={`text-center relative ${pkg.best ? "border-primary shadow-lg" : ""}`}>
              {pkg.best && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                  {pkg.best}
                </div>
              )}
              <CardContent className="pt-8 pb-6">
                <div className="text-3xl font-bold text-primary">{pkg.credits}</div>
                <div className="text-sm text-muted-foreground mb-4">credits</div>
                <div className="text-2xl font-bold mb-1">{pkg.price}</div>
                <div className="text-sm text-muted-foreground mb-6">{pkg.per} per waiver</div>
                <Link to="/login">
                  <Button className="w-full gap-2" variant={pkg.best ? "default" : "outline"}>
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">Credits never expire · 250 free credits on signup · No credit card required</p>
      </section>

      <SeoSection title="How Credits Work" muted>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Coins className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">1 Credit = 1 Signed Waiver</h3>
                <p className="text-sm text-muted-foreground">You're only charged when a waiver is actually signed by a customer. Sending waivers, creating templates, and managing your dashboard are all free.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Credits Never Expire</h3>
                <p className="text-sm text-muted-foreground">Buy credits during your busy season and use them whenever. No deadline, no pressure. They're yours until you use them.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Auto-Recharge Available</h3>
                <p className="text-sm text-muted-foreground">Set a threshold and your account automatically recharges when credits run low. Never miss a waiver during peak season.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">250 Free Welcome Credits</h3>
                <p className="text-sm text-muted-foreground">Every new account starts with 250 free credits. Test the entire platform before spending a dollar.</p>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">What's Included (Free)</h3>
            <div className="space-y-2">
              {[
                "Unlimited waiver templates",
                "QR code generation",
                "Email waiver delivery",
                "Group signing links",
                "Mobile-optimized signing",
                "Dashboard & analytics",
                "Kiosk mode",
                "Audit trails & PDF storage",
                "7-year secure storage",
                "API & webhook access",
                "Team member accounts",
                "Customer support",
              ].map((item) => (
                <div key={item} className="flex gap-2 items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SeoSection>

      <SeoSection title="How Much Will You Actually Pay?">
        <p className="text-sm text-muted-foreground mb-6">Real-world cost examples for different rental businesses:</p>
        <ComparisonTable
          headers={["Business Type", "Annual Waivers", "RentalWaivers Cost", "Smartwaiver Cost", "You Save"]}
          rows={[
            ["Small kayak shop (seasonal)", "400", "$32", "$588 ($49/mo)", "$556 (95%)"],
            ["Bike rental (urban, year-round)", "2,000", "$160", "$1,188 ($99/mo)", "$1,028 (87%)"],
            ["Boat rental marina", "1,200", "$96", "$588 ($49/mo)", "$492 (84%)"],
            ["Multi-location ATV operator", "5,000", "$375", "$3,120 ($260/mo)", "$2,745 (88%)"],
            ["Bounce house rental (seasonal)", "300", "$24", "$216 ($18/mo)", "$192 (89%)"],
            ["Vacation rental host", "150", "$15", "$216 ($18/mo)", "$201 (93%)"],
          ]}
        />
        <p className="text-sm text-muted-foreground mt-4">
          <strong className="text-foreground">The savings compound for seasonal businesses.</strong> With subscription platforms, you pay the same amount during your off-season as your peak season. With RentalWaivers, off-season cost = $0.
        </p>
      </SeoSection>

      <SeoSection title="Subscription vs. Pay-Per-Waiver" muted>
        <ComparisonTable
          headers={["", "Monthly Subscription", "RentalWaivers (Pay-Per-Use)"]}
          rows={[
            ["Off-season cost", "$18–$260/month", "$0"],
            ["Low-volume months", "Same price as peak", "Pay only for what you use"],
            ["Scaling up", "Jump to next tier ($$$)", "Just buy more credits"],
            ["Commitment", "Monthly/annual contracts", "No contracts, ever"],
            ["Getting started", "Credit card required", "250 free credits, no card"],
            ["Cancellation", "Fees or data loss risk", "Nothing to cancel"],
          ]}
        />
      </SeoSection>

      <SeoFaq items={[
        { question: "Do I need a credit card to sign up?", answer: "No. Create your account and receive 250 free credits immediately. No credit card, no commitment. You only pay when you need more credits." },
        { question: "Do credits expire?", answer: "No. Credits never expire. Buy them when you need them and use them at your own pace." },
        { question: "What counts as a credit?", answer: "One credit is used when a waiver is signed by a customer. Creating templates, sending waivers, viewing your dashboard, and all other features are free." },
        { question: "Can I get a refund on unused credits?", answer: "Credits are non-refundable but never expire. We recommend starting with a smaller package and scaling up as needed." },
        { question: "Is there a free trial?", answer: "Better than a trial — every new account gets 250 free credits with full platform access. Use them to test everything before purchasing." },
        { question: "Do you offer enterprise pricing?", answer: "For organizations processing 10,000+ waivers per month, contact us for volume pricing. We can create custom credit packages for high-volume operators." },
        { question: "How does auto-recharge work?", answer: "Set a credit threshold (e.g., 10 credits) and choose a package to auto-purchase when your balance drops below that threshold. Your saved payment method is charged automatically so you never run out during peak season." },
      ]} />

      <SeoCta
        headline="Start free — 250 credits on us"
        subtext="No credit card. No monthly fee. No contracts. Just waivers that work."
      />
    </SeoPageLayout>
  );
}
