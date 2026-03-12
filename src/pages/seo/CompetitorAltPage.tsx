import { useParams, Navigate, Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta, ComparisonTable } from "@/components/SeoPageLayout";
import { CheckCircle, XCircle, ArrowRight, Zap, Shield, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { competitorAltPages } from "@/lib/competitor-alt-data";
import { AiQuestionBox } from "@/components/AiQuestionBox";
import { InternalLinks } from "@/components/InternalLinks";

function Check({ val }: { val: boolean }) {
  return val
    ? <CheckCircle className="h-4 w-4 text-primary" />
    : <XCircle className="h-4 w-4 text-muted-foreground/40" />;
}

const featureIcons = [Zap, Shield, Clock, DollarSign];

export default function CompetitorAltPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = competitorAltPages.find((p) => p.slug === slug);

  if (!page) return <Navigate to="/compare" replace />;

  return (
    <SeoPageLayout metaTitle={page.metaTitle} metaDescription={page.metaDescription}>
      {/* Hero */}
      <SeoHero
        badge={`${page.competitorName} Alternative`}
        h1={page.h1}
        subtitle={page.subtitle}
        description={page.heroDescription}
      />

      {/* Mid-page CTA */}
      <section className="container max-w-4xl pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-5 py-3 text-sm">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">{page.competitorName}: <strong className="text-foreground">{page.competitorPricing}</strong></span>
          <span className="text-muted-foreground mx-2">→</span>
          <span className="text-muted-foreground">RentalWaivers: <strong className="text-primary">Pay per waiver, $0/mo</strong></span>
        </div>
      </section>

      {/* Pricing Comparison */}
      <SeoSection title={`Pricing: RentalWaivers vs ${page.competitorName}`} muted>
        <p className="text-sm text-muted-foreground mb-6">{page.competitorPricingDetail}</p>
        <ComparisonTable
          headers={["Monthly Waivers", "RentalWaivers", page.competitorName]}
          rows={page.pricingComparison.map((r) => [r.waivers, r.rentalWaivers, r.competitor])}
        />
        <p className="text-sm text-muted-foreground mt-4">
          <strong className="text-foreground">Key insight:</strong> With {page.competitorName}, you pay the same whether you process 1,000 waivers or zero. With RentalWaivers, your off-season cost is <strong className="text-primary">$0</strong>.
        </p>
      </SeoSection>

      {/* Feature Comparison */}
      <SeoSection title={`Feature Comparison: RentalWaivers vs ${page.competitorName}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-muted">
                <th className="text-left py-3 px-4 font-semibold">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-primary">RentalWaivers</th>
                <th className="text-center py-3 px-4 font-semibold">{page.competitorName}</th>
              </tr>
            </thead>
            <tbody>
              {page.features.map((f, i) => (
                <tr key={i} className="border-t">
                  <td className="py-3 px-4 font-medium">{f.feature}</td>
                  <td className="py-3 px-4 text-center"><Check val={f.rentalWaivers} /></td>
                  <td className="py-3 px-4 text-center"><Check val={f.competitor} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SeoSection>

      {/* Why Rental Businesses Switch */}
      <SeoSection title={`Why Rental Businesses Switch from ${page.competitorName}`} muted>
        <div className="grid md:grid-cols-2 gap-4">
          {page.painPoints.map((p, i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <h3 className="font-semibold text-sm mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      {/* Rental-Specific Features */}
      <SeoSection title="Rental-Specific Features You Won't Find Elsewhere">
        <div className="grid md:grid-cols-2 gap-6">
          {page.rentalFeatures.map((f, i) => {
            const Icon = featureIcons[i % featureIcons.length];
            return (
              <div key={i} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SeoSection>

      {/* Migration */}
      <SeoSection title={`Switch from ${page.competitorName} in 20 Minutes`} muted>
        <div className="space-y-4">
          {page.migrationSteps.map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/login">
            <Button size="lg" className="gap-2">
              Start Free — No Credit Card <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </SeoSection>

      {/* Social Proof */}
      <SeoSection title="Built for Rental Businesses Like Yours">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { quote: "We switched from a monthly subscription and saved over $400 in the first year. The QR code check-in is a game changer at our dock.", business: "Lake Kayak Rentals" },
            { quote: "Setup took 15 minutes. Our seasonal bike rental shop doesn't pay a cent during winter. That's how it should work.", business: "Mountain Bike Co." },
            { quote: "Group waivers for family ATV rides — one link, everyone signs. Way easier than our old system.", business: "Desert ATV Tours" },
          ].map((t, i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <p className="text-sm text-muted-foreground italic mb-3">"{t.quote}"</p>
                <p className="text-xs font-semibold text-foreground">— {t.business}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      {/* FAQ */}
      <SeoFaq items={page.faqItems} />

      {/* CTA */}
      <SeoCta headline={page.ctaHeadline} subtext={page.ctaSubtext} />

      {/* Internal Links */}
      <section className="border-t py-10">
        <div className="container max-w-4xl">
          <p className="text-sm text-muted-foreground">
            <Link to="/compare" className="text-primary hover:underline">Compare all waiver software</Link>
            {" · "}
            <Link to="/pricing-info" className="text-primary hover:underline">See our pay-per-use pricing</Link>
            {" · "}
            <Link to="/rental-waiver-software" className="text-primary hover:underline">Built for rental businesses</Link>
            {" · "}
            <Link to="/industries" className="text-primary hover:underline">Browse by rental type</Link>
          </p>
        </div>
      </section>
    </SeoPageLayout>
  );
}
