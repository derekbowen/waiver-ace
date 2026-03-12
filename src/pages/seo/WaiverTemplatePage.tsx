import { useParams, Navigate, Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { CheckCircle, FileText, ArrowRight, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWaiverTemplatePage } from "@/lib/waiver-template-pages";
import { AiQuestionBox } from "@/components/AiQuestionBox";
import { InternalLinks } from "@/components/InternalLinks";

export default function WaiverTemplatePage() {
  const { slug } = useParams<{ slug: string }>();
  const page = getWaiverTemplatePage(slug || "");
  if (!page) return <Navigate to="/waiver-templates" replace />;

  return (
    <SeoPageLayout metaTitle={page.metaTitle} metaDescription={page.metaDescription}>
      <SeoHero badge="Free Template" h1={page.h1} subtitle="Legally-reviewed, customizable, and ready to go digital" description={page.intro} />

      <SeoSection title="Risks This Waiver Should Address" muted>
        <div className="grid md:grid-cols-2 gap-3">
          {page.risks.map((r, i) => (
            <div key={i} className="flex gap-2 items-start text-sm">
              <Shield className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{r}</span>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Essential Clauses">
        <div className="space-y-6">
          {page.clauses.map((c, i) => (
            <div key={i}>
              <h3 className="font-semibold text-sm mb-1">{i + 1}. {c.title}</h3>
              <p className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-4">{c.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6 p-3 bg-muted/50 rounded-lg">
          <strong className="text-foreground">Disclaimer:</strong> This template is for informational purposes only. Have an attorney licensed in your state review your waiver before use.
        </p>
      </SeoSection>

      <SeoSection title="Recommended Custom Fields" muted>
        <div className="grid md:grid-cols-2 gap-2">
          {page.customFields.map((f, i) => (
            <div key={i} className="flex gap-2 items-center text-sm">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Best Practices for This Waiver Type">
        <div className="space-y-3">
          {page.bestPractices.map((b, i) => (
            <div key={i} className="flex gap-3 items-start text-sm">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</div>
              <span className="text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Go Digital in 5 Minutes" muted>
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Stop printing this template. Use it digitally with RentalWaivers — customers sign on their phone in 60 seconds, and every signature includes timestamps, IP addresses, and a tamper-proof audit trail.
          </p>
          <Link to="/login"><Button size="lg" className="gap-2">Use This Template Online <ArrowRight className="h-4 w-4" /></Button></Link>
          <p className="text-xs text-muted-foreground">250 free credits · No credit card · Starting at 6¢/waiver</p>
        </div>
      </SeoSection>

      <SeoFaq items={page.faqItems} />

      <AiQuestionBox
        pageContext={`${page.name} template — ${page.intro.slice(0, 100)}`}
        suggestedQuestions={[`Is a ${page.name.toLowerCase()} legally binding?`, "What clauses should I customize?", "Can minors sign this waiver?"]}
      />

      <SeoCta headline={`Get your ${page.name.toLowerCase()} live today`} subtext="Customize this template and start collecting digital signatures in under 5 minutes." />

      <InternalLinks currentSlug={slug} pageType="landing" />
    </SeoPageLayout>
  );
}
