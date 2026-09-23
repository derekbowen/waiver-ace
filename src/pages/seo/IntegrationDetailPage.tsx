import { useParams, Navigate, Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { getIntegrationPlatform } from "@/lib/integration-pages";
import { allIndustryPages } from "@/lib/industry-pages";
import { stateWaiverLawPages } from "@/lib/state-waiver-laws";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/lib/structured-data";
import { InternalLinks } from "@/components/InternalLinks";

export default function IntegrationDetailPage() {
  const { platformSlug = "" } = useParams<{ platformSlug: string }>();
  const p = getIntegrationPlatform(platformSlug);
  if (!p) return <Navigate to="/integrations" replace />;

  const url = `https://www.rentalwaivers.com/integrations/${p.slug}`;
  const faqItems = [
    {
      question: `Does ${p.name} have a built-in liability waiver?`,
      answer: `No. ${p.name} is ${p.category.toLowerCase()}. ${p.gaps[0]}. RentalWaivers adds the signed waiver layer without changing your ${p.name} workflow.`,
    },
    {
      question: `How does the ${p.name} waiver integration work?`,
      answer: `We connect through ${p.connectionMethod}. When ${p.trigger}, the signing link goes out to the guest with their details prefilled. They sign on their phone and you get a tamper-proof PDF.`,
    },
    {
      question: `What guest data does the waiver pull from ${p.name}?`,
      answer: p.fieldsMapped.join(", ") + ".",
    },
    {
      question: `Does this replace my ${p.name} rental agreement?`,
      answer: `No, and it shouldn't. The rental agreement covers payment, dates and house rules. The waiver covers injury liability. Most operators send both.`,
    },
    {
      question: `What does the ${p.name} integration cost?`,
      answer: `Nothing extra. You pay 6¢ per signed waiver with no monthly fee, and the first 250 signatures are free.`,
    },
    ...p.faqExtra,
  ];

  return (
    <SeoPageLayout
      metaTitle={`${p.name} Waiver Integration — Auto-Send Liability Waivers on Every Booking | RentalWaivers`}
      metaDescription={`Connect ${p.name} to RentalWaivers and send a liability waiver automatically when ${p.trigger}. Prefilled guest data, minors and guardian consent, tamper-proof PDF. 6¢ per waiver, no monthly fee.`}
      canonicalPath={`/integrations/${p.slug}`}
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Integrations", url: "https://www.rentalwaivers.com/integrations" },
            { name: `${p.name} Integration`, url },
          ]),
          faqSchema(faqItems),
          howToSchema({
            name: `How to send liability waivers automatically from ${p.name}`,
            description: `Connect ${p.name} to RentalWaivers so every booking produces a signed liability waiver.`,
            totalTimeISO: "PT15M",
            steps: p.workflow.map((w) => ({ name: w.title, text: w.description })),
          }),
        ]}
      />

      <SeoHero
        badge={`${p.name} Integration`}
        h1={`${p.name} Waiver Integration — Signed Liability Waivers on Every Booking`}
        subtitle={`Built for ${p.audience}`}
        description={`${p.name} handles the booking. RentalWaivers handles the part that protects you if someone gets hurt. We connect through ${p.connectionMethod}, and when ${p.trigger}, the guest gets a signing link with their name, email and dates already filled in. They sign on their phone in about 60 seconds, and the signed PDF is stored with a timestamp, IP address and device record.`}
      />

      <SeoSection title={`What ${p.name} Doesn't Cover`} muted>
        <div className="space-y-3 max-w-3xl">
          {p.gaps.map((g) => (
            <div key={g} className="flex gap-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />
              <span className="text-muted-foreground">{g}</span>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="What the Integration Gives You">
        <div className="grid md:grid-cols-2 gap-4">
          {p.strengths.map((s) => (
            <Card key={s}>
              <CardContent className="pt-6 flex gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">{s}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Setup in Four Steps" muted>
        <div className="space-y-6">
          {p.workflow.map((w) => (
            <div key={w.step} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                {w.step}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{w.title}</h3>
                <p className="text-sm text-muted-foreground">{w.description}</p>
              </div>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title={`Booking Data Mapped From ${p.name}`}>
        <div className="flex flex-wrap gap-2">
          {p.fieldsMapped.map((f) => (
            <span key={f} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {f}
            </span>
          ))}
        </div>
      </SeoSection>

      <SeoSection title={`${p.name} Waivers by Business Type`} muted>
        <div className="flex flex-wrap gap-2">
          {allIndustryPages.map((i) => (
            <Link
              key={i.slug}
              to={`/integrations/${p.slug}/${i.slug}`}
              className="rounded-full border px-3 py-1.5 text-xs hover:border-primary transition-colors"
            >
              {i.name}
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoSection title={`${p.name} Waivers by State`}>
        <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
          Waiver enforceability varies by state. Pick yours to see how {p.name} bookings and local waiver rules fit
          together.
        </p>
        <div className="flex flex-wrap gap-2">
          {stateWaiverLawPages.map((s) => (
            <Link
              key={s.slug}
              to={`/integrations/${p.slug}/state/${s.slug}`}
              className="rounded-full border px-3 py-1.5 text-xs hover:border-primary transition-colors"
            >
              {s.state}
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <SeoCta
        headline={`Connect ${p.name} and stop chasing signatures`}
        subtext="250 free signatures, then 6¢ each. No monthly fee, no setup cost."
      />

      <div className="container max-w-5xl pb-8">
        <Link to="/integrations" className="text-sm text-primary inline-flex items-center gap-1">
          All integrations <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <InternalLinks currentSlug={`integrations-${p.slug}`} />
    </SeoPageLayout>
  );
}
