import { useParams, Navigate, Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, ArrowRight } from "lucide-react";
import {
  getIntegrationStatePair,
  platformStateTitle,
  platformStateDescription,
  platformStateIntro,
  platformStateFaq,
} from "@/lib/integration-matrix";
import { stateWaiverLawPages } from "@/lib/state-waiver-laws";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";
import { InternalLinks } from "@/components/InternalLinks";

export default function IntegrationStatePage() {
  const { platformSlug = "", stateSlug = "" } = useParams<{ platformSlug: string; stateSlug: string }>();
  const pair = getIntegrationStatePair(platformSlug, stateSlug);
  if (!pair) return <Navigate to="/integrations" replace />;
  const { platform: p, state: s } = pair;

  const path = `/integrations/${p.slug}/state/${s.slug}`;
  const url = `https://www.rentalwaivers.com${path}`;
  const faqItems = platformStateFaq(p, s);
  const nearby = stateWaiverLawPages.filter((x) => x.slug !== s.slug).slice(0, 10);

  return (
    <SeoPageLayout
      metaTitle={platformStateTitle(p, s)}
      metaDescription={platformStateDescription(p, s)}
      canonicalPath={path}
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Integrations", url: "https://www.rentalwaivers.com/integrations" },
            { name: p.name, url: `https://www.rentalwaivers.com/integrations/${p.slug}` },
            { name: s.state, url },
          ]),
          faqSchema(faqItems),
        ]}
      />

      <SeoHero
        badge={`${p.name} · ${s.state}`}
        h1={`${p.name} Liability Waivers in ${s.state}`}
        subtitle={`Automatic waiver signing for ${s.state} rentals booked through ${p.name}`}
        description={platformStateIntro(p, s)}
      />

      <SeoSection title={`${s.state} Waiver Rules That Affect Your Template`} muted>
        <div className="space-y-4 max-w-3xl">
          {s.keyStatutes.slice(0, 3).map((k) => (
            <div key={k.name} className="flex gap-3">
              <Scale className="h-4 w-4 shrink-0 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-sm mb-1">{k.name}</h3>
                <p className="text-sm text-muted-foreground">{k.description}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">
            This is general information, not legal advice. Have an attorney licensed in {s.state} review your final
            waiver.
          </p>
        </div>
      </SeoSection>

      <SeoSection title={`How ${p.name} Bookings Trigger the Waiver`}>
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
        <Card className="mt-6">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Connection method: {p.connectionMethod}. Trigger: {p.trigger}. Guest data mapped:{" "}
            {p.fieldsMapped.join(", ")}.
          </CardContent>
        </Card>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <SeoCta
        headline={`Get every ${s.state} booking signed before check-in`}
        subtext={`Connect ${p.name} in about 15 minutes. 250 free signatures, then 6¢ each with no monthly fee.`}
      />

      <SeoSection title={`${p.name} Waivers in Other States`} muted>
        <div className="flex flex-wrap gap-2">
          {nearby.map((x) => (
            <Link
              key={x.slug}
              to={`/integrations/${p.slug}/state/${x.slug}`}
              className="rounded-full border px-3 py-1.5 text-xs hover:border-primary transition-colors"
            >
              {x.state}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link to={`/integrations/${p.slug}`} className="text-primary inline-flex items-center gap-1">
            {p.name} integration overview <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link to={`/waiver-laws/${s.slug}`} className="text-primary inline-flex items-center gap-1">
            {s.state} waiver laws <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </SeoSection>

      <InternalLinks currentSlug={`integrations-${p.slug}-${s.slug}`} />
    </SeoPageLayout>
  );
}
