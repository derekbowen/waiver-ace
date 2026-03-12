import { useParams, Link, useNavigate } from "react-router-dom";
import { getLandingPageBySlug } from "@/lib/seo-landing-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { AiQuestionBox } from "@/components/AiQuestionBox";
import { InternalLinks } from "@/components/InternalLinks";
import {
  Shield, Zap, Smartphone, FileText, Users, CheckSquare, Send,
  Globe, ClipboardList, Cloud, Coins, MonitorSmartphone, Heart,
  Thermometer, ListChecks, Waves, Wrench, Hash, Calendar, MapPin,
  PenTool, Clock, Gauge, Camera, Layers, LayoutDashboard, Code,
  Webhook, Home, Link2, BellRing, CheckCircle, UserCheck, Droplets,
  ArrowRight, ChevronDown, ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";

const iconMap: Record<string, any> = {
  shield: Shield, zap: Zap, smartphone: Smartphone, "file-text": FileText,
  users: Users, "check-square": CheckSquare, send: Send, globe: Globe,
  clipboard: ClipboardList, cloud: Cloud, coins: Coins, monitor: MonitorSmartphone,
  "heart-pulse": Heart, thermometer: Thermometer, "list-checks": ListChecks,
  waves: Waves, wrench: Wrench, hash: Hash, calendar: Calendar, "map-pin": MapPin,
  "pen-tool": PenTool, clock: Clock, gauge: Gauge, camera: Camera, layers: Layers,
  "layout-dashboard": LayoutDashboard, code: Code, webhook: Webhook, home: Home,
  link: Link2, bell: BellRing, "check-circle": CheckCircle, "user-check": UserCheck,
  droplets: Droplets, "qr-code": Smartphone, "id-card": FileText,
};

export default function SeoLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const page = getLandingPageBySlug(slug || "");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (page) {
      document.title = page.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", page.metaDescription);
      else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = page.metaDescription;
        document.head.appendChild(meta);
      }
    }
  }, [page]);

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-4">This landing page doesn't exist.</p>
          <Button onClick={() => navigate("/")} variant="outline">Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold">Rental Waivers</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">Docs</Link>
            <Link to="/login">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-6 bg-primary/5 text-primary border-primary/20">
          <Shield className="h-3 w-3" /> Legally Binding Digital Waivers
        </div>
        <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">
          {page.h1}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
          {page.subheading}
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
          {page.heroDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Start Sending Waivers <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/docs">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              View Documentation
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-4">No credit card required · Pay per waiver · Starting at 6¢</p>
      </section>

      {/* Pain Points */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container max-w-5xl">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">
            The Problem with Paper Waivers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {page.painPoints.map((point, i) => (
              <Card key={i} className="border-destructive/10">
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 mb-4">
                    <span className="text-lg font-bold text-destructive">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 container max-w-5xl">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">
          Built for {page.title.replace(" Waivers", "")} Operators
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {page.features.map((feature, i) => {
            const Icon = iconMap[feature.icon] || Shield;
            return (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container max-w-3xl">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">
            How It Works
          </h2>
          <div className="space-y-6">
            {page.howItWorks.map((step) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Highlight */}
      <section className="py-16 container max-w-3xl text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-muted-foreground mb-8">No monthly fees. No subscriptions. Pay per waiver.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { credits: "200", price: "$20", per: "10¢/ea" },
            { credits: "550", price: "$50", per: "9¢/ea" },
            { credits: "1,250", price: "$100", per: "8¢/ea" },
            { credits: "8,000", price: "$500", per: "6¢/ea" },
          ].map((pkg) => (
            <Card key={pkg.credits} className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{pkg.credits}</div>
                <div className="text-xs text-muted-foreground mb-2">credits</div>
                <div className="font-semibold">{pkg.price}</div>
                <div className="text-xs text-muted-foreground">{pkg.per}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Link to="/login">
          <Button className="mt-8 gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container max-w-3xl">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {page.faqItems.map((item, i) => (
              <Card key={i} className="cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{item.question}</h3>
                    {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  </div>
                  {openFaq === i && (
                    <p className="text-sm text-muted-foreground mt-3">{item.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 container max-w-3xl text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
          {page.ctaHeadline}
        </h2>
        <p className="text-muted-foreground mb-6">{page.ctaSubtext}</p>
        <Link to="/login">
          <Button size="lg" className="gap-2">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* AI Q&A */}
      <AiQuestionBox
        pageContext={`${page.title} - ${page.subheading}`}
        suggestedQuestions={[
          `Are ${page.title.toLowerCase()} legally binding?`,
          `How much do digital ${page.title.toLowerCase()} cost?`,
          "Can guests sign waivers on their phone?",
        ]}
      />

      {/* Internal Links */}
      <InternalLinks currentSlug={slug} pageType="landing" />

      <Footer />
    </div>
  );
}
