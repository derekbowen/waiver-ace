import { useParams, Navigate, Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, Scale, ArrowRight, TrendingUp, Gavel } from "lucide-react";
import { getStateLawPage } from "@/lib/state-waiver-laws";
import { allIndustryPages } from "@/lib/industry-pages";
import { matrixUrl } from "@/lib/industry-state-matrix";
import {
  uniqueHeroSubhead,
  exposureCallout,
  statuteDeepDive,
  relatedStatesComparison,
  statePlaybook,
  businessImplications,
  industryHotspot,
} from "@/lib/state-page-enrichment";
import { AiQuestionBox } from "@/components/AiQuestionBox";
import { InternalLinks } from "@/components/InternalLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, legalServiceSchema } from "@/lib/structured-data";

const badgeMap = {
  strong: "Generally Enforceable",
  moderate: "Enforceable with Care",
  challenging: "Challenging — Legal Counsel Advised",
};
const badgeColor = {
  strong: "text-primary",
  moderate: "text-yellow-600",
  challenging: "text-destructive",
};
const tierDot = {
  strong: "bg-primary",
  moderate: "bg-yellow-500",
  challenging: "bg-destructive",
};

export default function WaiverLawStatePage() {
  const { state } = useParams<{ state: string }>();
  const page = getStateLawPage(state || "");
  if (!page) return <Navigate to="/waiver-laws" replace />;

  const url = `https://www.rentalwaivers.com/waiver-laws/${page.slug ?? state}`;
  const exposure = exposureCallout(page);
  const statutes = statuteDeepDive(page);
  const comparisons = relatedStatesComparison(page);
  const playbook = statePlaybook(page);
  const implications = businessImplications(page);
  const hotspot = industryHotspot(page);

  return (
    <SeoPageLayout
      metaTitle={page.metaTitle}
      metaDescription={page.metaDescription}
      canonicalPath={`/waiver-laws/${page.slug ?? state}`}
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Waiver Laws", url: "https://www.rentalwaivers.com/waiver-laws" },
            { name: `${page.state} Waiver Laws`, url },
          ]),
          legalServiceSchema({ state: page.state, description: page.overview, url }),
        ]}
      />

      <SeoHero
        badge="Legal Guide"
        h1={page.h1}
        subtitle={badgeMap[page.enforceability]}
        description={uniqueHeroSubhead(page)}
      />

      {/* Unique exposure / risk callout — varies per tier with $ ranges */}
      <SeoSection title={`${page.state} risk profile for rental operators`} muted>
        <Card>
          <CardContent className="py-5 space-y-3">
            <div className="flex items-start gap-3">
              <TrendingUp className={`h-5 w-5 shrink-0 mt-0.5 ${badgeColor[page.enforceability]}`} />
              <div>
                <h3 className="font-semibold text-sm mb-1">{exposure.headline}</h3>
                <p className="text-sm text-muted-foreground">{exposure.detail}</p>
              </div>
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground border-t pt-3">
              Settlement benchmark · <span className="text-foreground normal-case">{exposure.settlement}</span>
            </div>
          </CardContent>
        </Card>
      </SeoSection>

      <SeoSection title="Enforceability summary">
        <div className="flex gap-3 items-start">
          <Scale className={`h-5 w-5 shrink-0 mt-0.5 ${badgeColor[page.enforceability]}`} />
          <p className="text-sm text-muted-foreground">{page.enforcementSummary}</p>
        </div>
      </SeoSection>

      {/* Deep-dive on each statute / case — unique narrative per state */}
      <SeoSection title={`${page.state} key statutes & case law — practical impact`} muted>
        <div className="space-y-5">
          {statutes.map((s, i) => (
            <Card key={i}>
              <CardContent className="py-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">{s.name}</h3>
                </div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.lead}</p>
                <p className="text-sm text-muted-foreground">{s.description}</p>
                <p className="text-sm border-l-2 border-primary/40 pl-3 italic">
                  Practical impact: {s.practicalImpact}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      <SeoSection title={`What this means for your ${page.state} business`}>
        <p className="text-sm text-muted-foreground leading-relaxed">{implications}</p>
      </SeoSection>

      {hotspot && (
        <SeoSection title={hotspot.label} muted>
          <div className="flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{hotspot.body}</p>
          </div>
        </SeoSection>
      )}

      <SeoSection title="Minors & parental waivers">
        <div className="flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{page.minorRules}</p>
        </div>
      </SeoSection>

      <SeoSection title="Gross negligence — the line you cannot cross" muted>
        <div className="flex gap-3 items-start">
          <Shield className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{page.grossNegligence}</p>
        </div>
      </SeoSection>

      <SeoSection title={`${page.state}-specific rental considerations`}>
        <p className="text-sm text-muted-foreground">{page.rentalSpecific}</p>
      </SeoSection>

      {/* Numbered playbook — every step interpolates the state */}
      <SeoSection title={`The 7-step ${page.state} waiver playbook`} muted>
        <ol className="space-y-4">
          {playbook.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </SeoSection>

      <SeoSection title="Best practices for drafting">
        <div className="space-y-3">
          {page.bestPractices.map((b, i) => (
            <div key={i} className="flex gap-2 items-start text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>
      </SeoSection>

      {/* Comparison vs. related states — unique per pair */}
      {comparisons.length > 0 && (
        <SeoSection title={`How ${page.state} compares to neighboring jurisdictions`} muted>
          <div className="space-y-3">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                to={`/waiver-laws/${c.slug}`}
                className="block border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${tierDot[c.tier]}`} />
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className="text-xs text-muted-foreground">· {badgeMap[c.tier]}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{c.note}</p>
              </Link>
            ))}
          </div>
        </SeoSection>
      )}

      <SeoFaq items={page.faqItems} />

      <SeoSection title={`${page.state} waivers by industry`} muted>
        <p className="text-sm text-muted-foreground mb-4">
          Pick your rental vertical for {page.state}-specific drafting guidance, required risk language, and pricing:
        </p>
        <div className="flex flex-wrap gap-2">
          {allIndustryPages.map((ind) => (
            <Link
              key={ind.slug}
              to={matrixUrl(ind.slug, page.slug)}
              className="text-xs px-2.5 py-1 rounded-full border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              {ind.name}
            </Link>
          ))}
        </div>
      </SeoSection>

      <AiQuestionBox
        pageContext={`${page.state} waiver laws — ${page.overview.slice(0, 100)}`}
        suggestedQuestions={[
          `Are waivers enforceable in ${page.state}?`,
          `Can parents sign waivers for minors in ${page.state}?`,
          `What's the gross-negligence rule in ${page.state}?`,
        ]}
      />

      <SeoCta
        headline={`Get a compliant ${page.state} waiver live today`}
        subtext="Legally-reviewed templates with full audit trails. No monthly fee."
      />

      <InternalLinks currentSlug={state} pageType="landing" />
    </SeoPageLayout>
  );
}
