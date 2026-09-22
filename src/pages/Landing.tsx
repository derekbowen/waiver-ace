import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { JsonLd } from "@/components/JsonLd";
import { faqSchema, softwareApplicationSchema } from "@/lib/structured-data";
import { LANDING_FAQS } from "@/lib/landing-faqs";
import { Footer } from "@/components/Footer";

import { SiteNav } from "@/components/marketing/SiteNav";
import { Hero } from "@/components/marketing/Hero";
import { IntegrationContext } from "@/components/marketing/IntegrationContext";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { UseCases } from "@/components/marketing/UseCases";
import { GuestyPreview } from "@/components/marketing/GuestyPreview";
import { Capabilities } from "@/components/marketing/Capabilities";
import { PricingSection } from "@/components/marketing/PricingSection";
import { SecuritySection } from "@/components/marketing/SecuritySection";
import { DirectorySection } from "@/components/marketing/DirectorySection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { FinalCta } from "@/components/marketing/FinalCta";

export default function Landing() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-ink-inverse"
      >
        Skip to content
      </a>

      <SiteNav />

      <main id="main">
        <Hero />
        <IntegrationContext />
        <HowItWorks />
        <UseCases />
        <GuestyPreview />
        <Capabilities />
        <PricingSection />
        <SecuritySection />
        <DirectorySection />
        <FaqSection />
        <FinalCta />
      </main>

      {/* Organization schema is emitted once in index.html <head> — do not duplicate it here */}
      <JsonLd data={[softwareApplicationSchema(), faqSchema(LANDING_FAQS)]} />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
