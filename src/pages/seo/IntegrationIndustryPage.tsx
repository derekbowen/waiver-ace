import { useParams, Navigate, Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import {
  getIntegrationIndustryPair,
  platformIndustryTitle,
  platformIndustryDescription,
  platformIndustryIntro,
  platformIndustryFaq,
} from "@/lib/integration-matrix";
import { allIndustryPages } from "@/lib/industry-pages";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/structured-data";
import { InternalLinks } from "@/components/InternalLinks";

export default function IntegrationIndustryPage() {
  const { platformSlug = "", industrySlug = "" } = useParams<{ platformSlug: string; industrySlug: string }>();
  const pair = getIntegrationIndustryPair(platformSlug, industrySlug);
  if (!pair) return <Navigate to="/integrations" replace />;
  const { platform: p, industry: i } = pair;

  const path = `/integrations/${p.slug}/${i.slug}`;
  const url = `https://www.rentalwaivers.com${path}`;
  const faqItems = platformIndustryFaq(p, i);
  const siblings = allIndustryPages.filter((x) => x.slug !== i.slug).slice(0, 8);

  return (
    <SeoPageLayout
      metaTitle={platformIndustryTitle(p, i)}
      metaDescription={platformIndustryDescription(p, i)}
      canonicalPath={path}
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Integrations", url: "https://www.rentalwaivers.com/integrations" },
            { name: p.name, url: `https://www.rentalwaivers.com/integrations/${p.slug}` },
            { name: i.name, url },
          ]),
          faqSchema(faqItems),
          serviceSchema({
            name: `${p.name} waiver integration for ${i.name}`,
            description: platformIndustryDescription(p, i),
            serviceType: "Digital liability waiver software integration",
            url,
          }),
        ]}
      />

      <SeoHero
        badge={`${p.name} × ${i.name}`}
        h1={`${p.name} Waiver Integration for ${i.name}`}
        subtitle={`Every booking in ${p.name} becomes a signed liability waiver`}
        description={platformIndustryIntro(p, i)}
      />

      <SeoSection title={`Why ${i.name} Need More Than a ${p.name} Rental Agreement`} muted>
        <div className="space-y-3 max-w-3xl">
          {i.painPoints.slice(0, 3).map((pp) => (
            <div key={pp.title}>
              <h3 className="font-semibold text-sm mb-1">{pp.title}</h3>
              <p className="text-sm text-muted-foreground">{pp.description}</p>
            </div>
          ))}
          <p className="text-sm text-muted-foreground pt-2">
            {p.gaps[1] ?? p.gaps[0]}. That is the exact hole a signed waiver fills.
          </p>
        </div>
      </SeoSection>

      <SeoSection title="How the Automation Runs">
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

      <SeoSection title={`What the ${i.name} Waiver Should Capture`} muted>
        <div className="grid sm:grid-cols-2 gap-3">
          {i.fieldsNeeded.map((f) => (
            <div key={f} className="flex gap-2 text-sm">
              <CheckCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span className="text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          {i.legalNotes.map((n) => (
            <p key={n} className="text-sm text-muted-foreground">
              • {n}
            </p>
          ))}
        </div>
      </SeoSection>

      <SeoSection title={`Data Pulled From ${p.name}`}>
        <div className="flex flex-wrap gap-2">
          {p.fieldsMapped.map((f) => (
            <span key={f} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {f}
            </span>
          ))}
        </div>
        <Card className="mt-6">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            <strong className="text-foreground">Real-world math: </strong>
            {i.useCaseExample.scenario} {i.useCaseExample.outcome}
          </CardContent>
        </Card>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <SeoCta
        headline={`Connect ${p.name} and cover every ${i.name.toLowerCase().replace(/s$/, "")} booking`}
        subtext="250 free signatures, then 6¢ each. No monthly fee — you pay nothing in your off-season."
      />

      <SeoSection title={`Other ${p.name} Waiver Guides`} muted>
        <div className="flex flex-wrap gap-2">
          {siblings.map((s) => (
            <Link
              key={s.slug}
              to={`/integrations/${p.slug}/${s.slug}`}
              className="rounded-full border px-3 py-1.5 text-xs hover:border-primary transition-colors"
            >
              {s.name}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link to={`/integrations/${p.slug}`} className="text-primary inline-flex items-center gap-1">
            {p.name} integration overview <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link to={`/industries/${i.slug}`} className="text-primary inline-flex items-center gap-1">
            {i.name} waiver software <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </SeoSection>

      <InternalLinks currentSlug={`integrations-${p.slug}-${i.slug}`} />
    </SeoPageLayout>
  );
}
