import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FileText, ArrowRight, Shield, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import { faqSchema, breadcrumbSchema } from "@/lib/structured-data";

interface SeoPageLayoutProps {
  metaTitle: string;
  metaDescription: string;
  canonicalPath?: string;
  children: ReactNode;
}

export function SeoPageLayout({ metaTitle, metaDescription, canonicalPath, children }: SeoPageLayoutProps) {
  useEffect(() => {
    document.title = metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", metaDescription);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = metaDescription;
      document.head.appendChild(meta);
    }

    // Update OG tags dynamically
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (el) el.setAttribute("content", content);
    };
    setMeta("og:title", metaTitle);
    setMeta("og:description", metaDescription);
    setMeta("twitter:title", metaTitle);
    setMeta("twitter:description", metaDescription);
    if (canonicalPath) {
      const fullUrl = `https://www.rentalwaivers.com${canonicalPath}`;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", fullUrl);
      setMeta("og:url", fullUrl);

      // hreflang tags for all supported languages
      const sep = canonicalPath.includes("?") ? "&" : "?";
      const langs = ["en", "es", "fr", "de", "pt", "zh", "ja", "ko", "it", "ar", "hi"];
      const hreflangs = [
        ...langs.map((lang) => ({ lang, href: lang === "en" ? fullUrl : `${fullUrl}${sep}lang=${lang}` })),
        { lang: "x-default", href: fullUrl },
      ];
      // Remove old hreflangs
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
      hreflangs.forEach(({ lang, href }) => {
        const link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = lang;
        link.href = href;
        document.head.appendChild(link);
      });
    }
  }, [metaTitle, metaDescription, canonicalPath]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold">Rental Waivers</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/waiver-software" className="hover:text-foreground transition-colors">Waiver Software</Link>
            <Link to="/industries" className="hover:text-foreground transition-colors">Industries</Link>
            <Link to="/waiver-templates" className="hover:text-foreground transition-colors">Templates</Link>
            <Link to="/compare" className="hover:text-foreground transition-colors">Compare</Link>
            <Link to="/waiver-laws" className="hover:text-foreground transition-colors">Waiver Laws</Link>
            <Link to="/pricing-info" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/login">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}

export function SeoHero({ badge, h1, subtitle, description }: { badge: string; h1: string; subtitle: string; description: string }) {
  return (
    <section className="container py-16 md:py-24 text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-6 bg-primary/5 text-primary border-primary/20">
        <Shield className="h-3 w-3" /> {badge}
      </div>
      <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">{h1}</h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">{subtitle}</p>
      <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/login">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            Start Free — No Monthly Fee <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mt-4">No credit card required · Pay per waiver · Starting at 6¢</p>
    </section>
  );
}

export function SeoSection({ title, children, muted }: { title: string; children: ReactNode; muted?: boolean }) {
  return (
    <section className={`py-16 ${muted ? "border-y bg-muted/30" : ""}`}>
      <div className="container max-w-4xl">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function SeoFaq({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="container max-w-3xl">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        {/* FAQ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(items)) }}
        />
        <div className="space-y-3">
          {items.map((item, i) => (
            <Card key={i} className="cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{item.question}</h3>
                  {open === i ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </div>
                {open === i && <p className="text-sm text-muted-foreground mt-3">{item.answer}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeoCta({ headline, subtext }: { headline: string; subtext: string }) {
  return (
    <section className="py-16 container max-w-3xl text-center">
      <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">{headline}</h2>
      <p className="text-muted-foreground mb-6">{subtext}</p>
      <Link to="/login">
        <Button size="lg" className="gap-2">Get Started Free <ArrowRight className="h-4 w-4" /></Button>
      </Link>
    </section>
  );
}

export function ComparisonTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-3 px-4 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t">
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-4">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
