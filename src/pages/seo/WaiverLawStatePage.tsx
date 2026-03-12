import { useParams, Navigate, Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, Scale, ArrowRight } from "lucide-react";
import { getStateLawPage } from "@/lib/state-waiver-laws";
import { AiQuestionBox } from "@/components/AiQuestionBox";
import { InternalLinks } from "@/components/InternalLinks";

const badgeMap = { strong: "Generally Enforceable", moderate: "Enforceable with Care", challenging: "Challenging — Legal Counsel Advised" };
const badgeColor = { strong: "text-primary", moderate: "text-yellow-600", challenging: "text-destructive" };

export default function WaiverLawStatePage() {
  const { state } = useParams<{ state: string }>();
  const page = getStateLawPage(state || "");
  if (!page) return <Navigate to="/waiver-laws" replace />;

  return (
    <SeoPageLayout metaTitle={page.metaTitle} metaDescription={page.metaDescription}>
      <SeoHero badge="Legal Guide" h1={page.h1} subtitle={badgeMap[page.enforceability]} description={page.overview} />

      <SeoSection title="Enforceability Summary" muted>
        <Card><CardContent className="py-5">
          <div className="flex gap-3 items-start">
            <Scale className={`h-5 w-5 shrink-0 mt-0.5 ${badgeColor[page.enforceability]}`} />
            <p className="text-sm text-muted-foreground">{page.enforcementSummary}</p>
          </div>
        </CardContent></Card>
      </SeoSection>

      <SeoSection title="Key Statutes & Case Law">
        <div className="space-y-4">
          {page.keyStatutes.map((s, i) => (
            <div key={i}><h3 className="font-semibold text-sm">{s.name}</h3><p className="text-sm text-muted-foreground">{s.description}</p></div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Minors & Parental Waivers" muted>
        <div className="flex gap-3 items-start"><AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">{page.minorRules}</p></div>
      </SeoSection>

      <SeoSection title="Gross Negligence">
        <div className="flex gap-3 items-start"><Shield className="h-5 w-5 text-destructive shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">{page.grossNegligence}</p></div>
      </SeoSection>

      <SeoSection title={`${page.state}-Specific Rental Considerations`} muted>
        <p className="text-sm text-muted-foreground">{page.rentalSpecific}</p>
      </SeoSection>

      <SeoSection title="Best Practices for Drafting">
        <div className="space-y-3">
          {page.bestPractices.map((b, i) => (
            <div key={i} className="flex gap-2 items-start text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Related State Guides" muted>
        <div className="flex flex-wrap gap-2">
          {page.relatedStates.map((s) => (
            <Link key={s} to={`/waiver-laws/${s}`} className="text-sm px-3 py-1.5 rounded-full border hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground">
              {s.charAt(0).toUpperCase() + s.slice(1)} waiver laws
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoFaq items={page.faqItems} />

      <AiQuestionBox
        pageContext={`${page.state} waiver laws — ${page.overview.slice(0, 100)}`}
        suggestedQuestions={[`Are waivers enforceable in ${page.state}?`, `Can parents sign waivers for minors in ${page.state}?`, "Do I need a lawyer to create a waiver?"]}
      />

      <SeoCta headline={`Get a compliant ${page.state} waiver live today`} subtext="Legally-reviewed templates with full audit trails. No monthly fee." />

      <InternalLinks currentSlug={state} pageType="landing" />
    </SeoPageLayout>
  );
}
