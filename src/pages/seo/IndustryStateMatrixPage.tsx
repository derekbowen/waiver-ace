import { useParams, Navigate, Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Scale, Shield, AlertTriangle, ArrowRight, MapPin } from "lucide-react";
import {
  getMatrixPage,
  matrixUrl,
  matrixMetaTitle,
  matrixMetaDescription,
  matrixIntro,
  matrixChecklist,
  matrixFaq,
} from "@/lib/industry-state-matrix";
import { stateWaiverLawPages } from "@/lib/state-waiver-laws";
import { allIndustryPages } from "@/lib/industry-pages";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbSchema,
  legalServiceSchema,
  serviceSchema,
  faqSchema,
} from "@/lib/structured-data";
import { AiQuestionBox } from "@/components/AiQuestionBox";
import { InternalLinks } from "@/components/InternalLinks";

const enfBadge = {
  strong: "Generally Enforceable",
  moderate: "Enforceable with Care",
  challenging: "Challenging — Legal Counsel Advised",
};
const enfColor = {
  strong: "text-primary",
  moderate: "text-yellow-600",
  challenging: "text-destructive",
};

export default function IndustryStateMatrixPage() {
  const { industrySlug = "", stateSlug = "" } = useParams<{
    industrySlug: string;
    stateSlug: string;
  }>();

  const pair = getMatrixPage(industrySlug, stateSlug);
  if (!pair) return <Navigate to="/industries" replace />;

  const { industry, state } = pair;
  const url = `https://www.rentalwaivers.com${matrixUrl(industrySlug, stateSlug)}`;
  const title = matrixMetaTitle(industry, state);
  const description = matrixMetaDescription(industry, state);
  const intro = matrixIntro(industry, state);
  const checklist = matrixChecklist(industry, state);
  const faqs = matrixFaq(industry, state);

  // Adjacent state suggestions: pull 4 other states from the relatedStates list of this state
  const nearbyStates = state.relatedStates.slice(0, 4);
  // Adjacent verticals: from related siblings (if any) plus a couple of fallbacks
  const siblingIndustries = (industry.relatedSiblings ?? []).slice(0, 3);

  return (
    <SeoPageLayout
      metaTitle={title}
      metaDescription={description}
      canonicalPath={matrixUrl(industrySlug, stateSlug)}
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Industries", url: "https://www.rentalwaivers.com/industries" },
            {
              name: industry.name,
              url: `https://www.rentalwaivers.com/industries/${industry.slug}`,
            },
            { name: state.state, url },
          ]),
          legalServiceSchema({
            state: state.state,
            description: `${industry.name} liability waiver guidance for ${state.state} operators. ${state.enforcementSummary.slice(0, 160)}`,
            url,
          }),
          serviceSchema({
            name: `${industry.name} Waiver Software in ${state.state}`,
            description,
            serviceType: `${industry.name} Liability Waiver Software`,
            areaServed: state.state,
            url,
          }),
          faqSchema(faqs),
        ]}
      />

      <SeoHero
        badge={`${state.state} • ${industry.name}`}
        h1={`${industry.name} Liability Waivers in ${state.state}`}
        subtitle={enfBadge[state.enforceability]}
        description={intro}
      />

      <SeoSection title="Quick Facts" muted>
        <div className="grid md:grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-5">
              <div className="flex gap-3 items-start">
                <Scale className={`h-5 w-5 shrink-0 mt-0.5 ${enfColor[state.enforceability]}`} />
                <div>
                  <h3 className="font-semibold text-sm mb-1">{state.state} enforceability</h3>
                  <p className="text-xs text-muted-foreground">{enfBadge[state.enforceability]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex gap-3 items-start">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Vertical</h3>
                  <p className="text-xs text-muted-foreground">{industry.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div className="flex gap-3 items-start">
                <Shield className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Pricing</h3>
                  <p className="text-xs text-muted-foreground">From 6¢ / waiver, no monthly fee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SeoSection>

      <SeoSection title={`How ${state.state} Courts Treat ${industry.name} Waivers`}>
        <Card>
          <CardContent className="py-5">
            <p className="text-sm text-muted-foreground">{state.enforcementSummary}</p>
          </CardContent>
        </Card>
        <div className="space-y-4 mt-6">
          {state.keyStatutes.slice(0, 3).map((s, i) => (
            <div key={i}>
              <h3 className="font-semibold text-sm">{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection
        title={`What Your ${state.state} ${industry.name} Waiver Should Include`}
        muted
      >
        <div className="space-y-3">
          {checklist.map((item, i) => (
            <div key={i} className="flex gap-2 items-start text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title={`${industry.name}-Specific Risk Language`}>
        <p className="text-sm text-muted-foreground mb-4">
          Generic "recreational activity" language is one of the most common reasons waivers
          get struck down. Your {industry.name.toLowerCase()} waiver should explicitly name the
          activity-specific hazards your customers face:
        </p>
        <div className="grid md:grid-cols-2 gap-2">
          {industry.fieldsNeeded.map((f, i) => (
            <div key={i} className="flex gap-2 items-center text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link
            to={`/industries/${industry.slug}`}
            className="text-sm text-primary hover:underline"
          >
            See the full {industry.name} waiver guide →
          </Link>
        </div>
      </SeoSection>

      <SeoSection title={`Minors & Parental Consent in ${state.state}`} muted>
        <div className="flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{state.minorRules}</p>
        </div>
      </SeoSection>

      <SeoSection title="The Gross-Negligence Carve-Out">
        <div className="flex gap-3 items-start">
          <Shield className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{state.grossNegligence}</p>
        </div>
      </SeoSection>

      <SeoSection title={`${state.state} Best Practices for ${industry.name} Operators`} muted>
        <div className="space-y-3">
          {state.bestPractices.map((b, i) => (
            <div key={i} className="flex gap-2 items-start text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Get a Compliant Waiver Live Today">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Start with our {industry.name.toLowerCase()} template, layer in {state.state}-specific
            clauses, and go live in under 10 minutes. No monthly fee, no setup cost.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to={`/waiver-templates/${industry.relatedTemplate}`}>
              <Button variant="outline" className="gap-2">
                View Template <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </SeoSection>

      <SeoFaq items={faqs} />

      <AiQuestionBox
        pageContext={`${industry.name} waivers in ${state.state}. ${intro.slice(0, 140)}`}
        suggestedQuestions={[
          `Are ${industry.name.toLowerCase()} waivers enforceable in ${state.state}?`,
          `What does a ${state.state} ${industry.name.toLowerCase()} waiver need to include?`,
          `Can parents sign for minors in ${state.state}?`,
        ]}
      />

      <SeoSection title="Other States for This Vertical" muted>
        <div className="flex flex-wrap gap-2">
          {nearbyStates.map((s) => (
            <Link
              key={s}
              to={matrixUrl(industry.slug, s)}
              className="text-sm px-3 py-1.5 rounded-full border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              {industry.name} in {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
      </SeoSection>

      {siblingIndustries.length > 0 && (
        <SeoSection title={`Related Verticals in ${state.state}`}>
          <div className="flex flex-wrap gap-2">
            {siblingIndustries.map((sibSlug) => {
              const sib = allIndustryPages.find((i) => i.slug === sibSlug);
              if (!sib) return null;
              return (
                <Link
                  key={sibSlug}
                  to={matrixUrl(sibSlug, state.slug)}
                  className="text-sm px-3 py-1.5 rounded-full border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {sib.name} in {state.state}
                </Link>
              );
            })}
          </div>
        </SeoSection>
      )}

      <SeoSection title={`All ${state.state} Verticals`} muted>
        <div className="flex flex-wrap gap-2">
          {allIndustryPages.slice(0, 12).map((ind) => (
            <Link
              key={ind.slug}
              to={matrixUrl(ind.slug, state.slug)}
              className="text-xs px-2.5 py-1 rounded-full border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              {ind.name} in {state.state}
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          <Link to={`/waiver-laws/${state.slug}`} className="text-primary hover:underline">
            Read the full {state.state} waiver-law guide →
          </Link>
        </p>
      </SeoSection>

      <SeoCta
        headline={`Ship a compliant ${state.state} ${industry.name.toLowerCase()} waiver this week`}
        subtext="Pay-per-waiver pricing from 6¢. No monthly fee, no contract."
      />

      <InternalLinks currentSlug={industrySlug} pageType="landing" />
    </SeoPageLayout>
  );
}
