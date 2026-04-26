import { useParams, Navigate, Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Zap, Shield, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIndustryPage } from "@/lib/industry-pages";
import { stateWaiverLawPages } from "@/lib/state-waiver-laws";
import { matrixUrl } from "@/lib/industry-state-matrix";
import { AiQuestionBox } from "@/components/AiQuestionBox";
import { InternalLinks } from "@/components/InternalLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, howToSchema, serviceSchema } from "@/lib/structured-data";

const icons = [Zap, Shield, Clock, DollarSign];

export default function IndustryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = getIndustryPage(slug || "");
  if (!page) return <Navigate to="/industries" replace />;

  const url = `https://www.rentalwaivers.com/industries/${page.slug}`;

  return (
    <SeoPageLayout metaTitle={page.metaTitle} metaDescription={page.metaDescription} canonicalPath={`/industries/${page.slug}`}>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Industries", url: "https://www.rentalwaivers.com/industries" },
            { name: page.name, url },
          ]),
          howToSchema({
            name: `How to set up digital waivers for ${page.name.toLowerCase()}`,
            description: page.intro.slice(0, 200),
            totalTimeISO: "PT10M",
            steps: page.workflow.map((s) => ({ name: s.title, text: s.description })),
          }),
          serviceSchema({
            name: `${page.name} Waiver Software`,
            description: page.metaDescription,
            serviceType: `${page.name} Liability Waiver Software`,
            url,
          }),
        ]}
      />
      <SeoHero badge="Industry Solution" h1={page.h1} subtitle="Pay per waiver — no monthly fee" description={page.intro} />

      <SeoSection title={`Why ${page.name} Need Specialized Waiver Software`} muted>
        <div className="grid md:grid-cols-2 gap-4">
          {page.painPoints.map((p, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Card key={i}><CardContent className="py-5">
                <div className="flex gap-3 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
                  <div><h3 className="font-semibold text-sm mb-1">{p.title}</h3><p className="text-sm text-muted-foreground">{p.description}</p></div>
                </div>
              </CardContent></Card>
            );
          })}
        </div>
      </SeoSection>

      <SeoSection title="How It Works">
        <div className="space-y-6">
          {page.workflow.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{s.step}</div>
              <div><h3 className="font-semibold mb-1">{s.title}</h3><p className="text-sm text-muted-foreground">{s.description}</p></div>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Fields Your Waiver Should Include" muted>
        <div className="grid md:grid-cols-2 gap-2">
          {page.fieldsNeeded.map((f, i) => (
            <div key={i} className="flex gap-2 items-center text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Real-World Example">
        <Card><CardContent className="py-6">
          <h3 className="font-semibold mb-2">{page.useCaseExample.business}</h3>
          <p className="text-sm text-muted-foreground mb-3">{page.useCaseExample.scenario}</p>
          <p className="text-sm text-muted-foreground"><strong className="text-primary">Result:</strong> {page.useCaseExample.outcome}</p>
        </CardContent></Card>
      </SeoSection>

      <SeoSection title="Legal Considerations" muted>
        <div className="space-y-3">
          {page.legalNotes.map((n, i) => (
            <div key={i} className="flex gap-2 items-start text-sm">
              <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{n}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          <Link to="/waiver-laws" className="text-primary hover:underline">Read state-by-state waiver laws →</Link>
        </p>
      </SeoSection>

      <SeoSection title="Get Started with a Free Template">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">Start with our {page.name.toLowerCase()} waiver template, customize it for your business, and go live in under 10 minutes.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to={`/waiver-templates/${page.relatedTemplate}`}><Button variant="outline" className="gap-2">View Template <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/login"><Button className="gap-2">Start Free <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </SeoSection>

      <SeoFaq items={page.faqItems} />

      <AiQuestionBox
        pageContext={`${page.name} waiver software — ${page.intro.slice(0, 100)}`}
        suggestedQuestions={[`How much does ${page.name.toLowerCase()} waiver software cost?`, "Can customers sign before they arrive?", "Is this legally binding?"]}
      />

      <SeoCta headline={`Get your ${page.name.toLowerCase()} waivers digital today`} subtext="250 free credits. No monthly fee. Set up in under 10 minutes." />

      <InternalLinks currentSlug={slug} pageType="landing" />
    </SeoPageLayout>
  );
}
