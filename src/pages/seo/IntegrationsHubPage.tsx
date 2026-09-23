import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Plug } from "lucide-react";
import { integrationPlatforms } from "@/lib/integration-pages";
import { allIndustryPages } from "@/lib/industry-pages";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";
import { InternalLinks } from "@/components/InternalLinks";

const faqItems = [
  {
    question: "Which rental software does RentalWaivers connect to?",
    answer:
      "Guesty, Hostaway, Lodgify, OwnerRez, Hospitable, Uplisting, Smoobu, Escapia, Streamline and TRACK. Anything else can connect through our REST API, webhooks, or a no-code Zapier or Make automation.",
  },
  {
    question: "Why does my property management software need a waiver tool at all?",
    answer:
      "Property management platforms handle bookings, messaging and rental agreements. A rental agreement sets the terms of the stay; a liability waiver releases you from injury claims. They are different documents, and almost no PMS produces a signed waiver with a legal audit trail.",
  },
  {
    question: "How fast is setup?",
    answer:
      "Most connections take under 15 minutes: authorize the platform, choose a waiver template, map the guest name, email and arrival date, and turn it on.",
  },
  {
    question: "What does the integration cost?",
    answer: "Nothing extra. Integrations are included — you pay 6¢ per signed waiver with no monthly fee, and the first 250 signatures are free.",
  },
];

export default function IntegrationsHubPage() {
  return (
    <SeoPageLayout
      metaTitle="Waiver Integrations for Rental & Property Management Software | RentalWaivers"
      metaDescription="Connect Guesty, Hostaway, Lodgify, OwnerRez, Hospitable, Uplisting, Smoobu, Escapia, Streamline or TRACK and send a signed liability waiver automatically on every booking. 6¢ per waiver, no monthly fee."
      canonicalPath="/integrations"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "Integrations", url: "https://www.rentalwaivers.com/integrations" },
          ]),
          faqSchema(faqItems),
        ]}
      />

      <SeoHero
        badge="Integrations"
        h1="Waiver Integrations for Rental & Property Management Software"
        subtitle="Your booking system already knows who's coming. It just can't get them to sign."
        description="RentalWaivers plugs into the software you already run and sends a liability waiver automatically the moment a booking is confirmed — prefilled with the guest's name, email and stay dates, signed on their phone in about 60 seconds, and stored as a tamper-proof PDF with a full audit trail."
      />

      <SeoSection title="Supported Platforms" muted>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrationPlatforms.map((p) => (
            <Link key={p.slug} to={`/integrations/${p.slug}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Plug className="h-6 w-6 text-primary mb-3" />
                  <h2 className="font-semibold mb-1.5">{p.name} Waiver Integration</h2>
                  <p className="text-sm text-muted-foreground mb-3">{p.category}</p>
                  <span className="text-sm font-medium text-primary inline-flex items-center gap-1">
                    See how it works <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="By Platform and Business Type">
        <p className="text-sm text-muted-foreground mb-5 max-w-3xl">
          Every platform below is paired with the rental business types we support, so you can see exactly what the
          waiver needs to say for your operation.
        </p>
        <div className="space-y-6">
          {integrationPlatforms.map((p) => (
            <div key={p.slug}>
              <h3 className="font-semibold mb-2">
                <Link to={`/integrations/${p.slug}`} className="text-primary underline underline-offset-4">
                  {p.name}
                </Link>
              </h3>
              <div className="flex flex-wrap gap-2">
                {allIndustryPages.map((i) => (
                  <Link
                    key={i.slug}
                    to={`/integrations/${p.slug}/${i.slug}`}
                    className="rounded-full border px-3 py-1 text-xs hover:border-primary transition-colors"
                  >
                    {i.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <SeoCta
        headline="Connect your booking software tonight"
        subtext="Setup takes about 15 minutes. 250 free signatures, then 6¢ each with no monthly fee."
      />

      <InternalLinks currentSlug="integrations" />
    </SeoPageLayout>
  );
}
