import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta, ComparisonTable } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Smartphone, QrCode, Shield, Wifi, MapPin, Code, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WaiverSoftwarePage() {
  return (
    <SeoPageLayout
      metaTitle="Waiver Software: Digital Waivers for Any Business | RentalWaivers"
      metaDescription="Everything you need to know about waiver software — how it works, key features, pricing models, and legal validity. Replace paper waivers with secure digital signing."
      canonicalPath="/waiver-software"
    >
      <SeoHero
        badge="Complete Guide"
        h1="Waiver Software: The Complete Guide for Businesses That Collect Waivers"
        subtitle="Replace paper waivers with secure, legally-binding digital signatures"
        description="Whether you run a rental shop, recreation center, or tour company, waiver software eliminates paper chaos, reduces liability risk, and creates a professional check-in experience. This guide covers everything you need to make the right choice."
      />

      <SeoSection title="What Is Waiver Software?" muted>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>Waiver software is a digital platform that replaces traditional paper liability waivers with electronic forms that customers sign on any device — phone, tablet, or computer. Instead of printing, filing, and storing physical documents, businesses create digital waiver templates, distribute them via email, QR code, or kiosk, and store signed copies securely in the cloud.</p>
          <p>Modern waiver software captures far more than just a signature. Each signed waiver includes a timestamp, IP address, device information, and a complete audit trail — creating a legally defensible record that's superior to paper in every way. Under the federal E-SIGN Act and the Uniform Electronic Transactions Act (UETA), electronic signatures carry the same legal weight as ink signatures in all 50 US states.</p>
          <p>The shift from paper to digital isn't just about convenience. Paper waivers get lost, damaged by weather, and are nearly impossible to search through when you need one during an insurance claim. Digital waivers are instantly searchable, permanently stored, and accessible from anywhere.</p>
        </div>
      </SeoSection>

      <SeoSection title="Types of Businesses That Need Waivers">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[
            { name: "Rental Businesses", desc: "Kayak, bike, boat, ATV, jet ski, scooter, equipment, and vehicle rentals", link: "/rental-waiver-software" },
            { name: "Recreation & Activities", desc: "Gyms, rock climbing, trampoline parks, escape rooms, and adventure sports", link: "/industries" },
            { name: "Tours & Experiences", desc: "Guided tours, zip lines, horseback riding, and outdoor adventure operators", link: "/industries" },
            { name: "Short-Term Rentals", desc: "Airbnb hosts, vacation rentals, and property managers with amenities", link: "/industries" },
            { name: "Events & Parties", desc: "Bounce house rentals, party equipment, event venues, and festival operators", link: "/industries" },
            { name: "Fitness & Wellness", desc: "Yoga studios, personal trainers, martial arts schools, and wellness centers", link: "/industries" },
          ].map((item) => (
            <Link to={item.link} key={item.name}>
              <Card className="h-full hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Any business where customers participate in activities with inherent risk needs liability waivers. <Link to="/industries" className="text-primary hover:underline">Browse all industries →</Link></p>
      </SeoSection>

      <SeoSection title="Key Features to Look For" muted>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: QrCode, title: "QR Code Signing", desc: "Display a QR code at your check-in counter. Customers scan with their phone and sign in under 60 seconds — no app download required." },
            { icon: Smartphone, title: "Mobile-First Signing", desc: "Waivers must work flawlessly on every phone and tablet. If your waiver software requires desktop, you're losing signers." },
            { icon: Shield, title: "Audit Trail & Legal Defense", desc: "Every signature should include timestamp, IP address, device info, and browser data. This is what protects you in court." },
            { icon: Wifi, title: "Offline Capability", desc: "For outdoor and remote operations, offline signing is critical. Waivers should queue and sync when connectivity returns." },
            { icon: MapPin, title: "Multi-Location Support", desc: "Manage templates and signed waivers across multiple locations from a single dashboard." },
            { icon: Code, title: "API & Integrations", desc: "Connect waiver software to your booking platform, CRM, or property management system for fully automated workflows." },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="How Waiver Software Pricing Works">
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Waiver software pricing falls into two models: <strong className="text-foreground">monthly subscriptions</strong> and <strong className="text-foreground">pay-per-waiver</strong>. The right choice depends on your volume and seasonality.</p>
          <ComparisonTable
            headers={["Model", "How It Works", "Best For", "Typical Cost"]}
            rows={[
              ["Monthly Subscription", "Fixed fee regardless of usage", "High-volume, year-round operations", "$18–$260+/month"],
              ["Pay-Per-Waiver", "Pay only when a waiver is signed", "Seasonal, variable-volume, or cost-conscious ops", "6¢–10¢ per waiver"],
            ]}
          />
          <p>For rental businesses — especially seasonal operations like kayak, boat, and ski rentals — the pay-per-waiver model often saves 40–70% annually compared to subscriptions. You're not paying $49/month through the winter when your shop is closed.</p>
          <Link to="/pricing-info" className="text-primary hover:underline inline-flex items-center gap-1">See RentalWaivers pricing <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </SeoSection>

      <SeoSection title="Are Digital Waivers Legally Binding?" muted>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Yes.</strong> Electronic signatures are legally binding in all 50 US states under two key laws:</p>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong className="text-foreground">E-SIGN Act (Federal, 2000)</strong> — Establishes that electronic signatures and records cannot be denied legal effect simply because they are electronic.</li>
            <li><strong className="text-foreground">UETA (Adopted by 49 states + DC)</strong> — Provides the state-level framework that electronic transactions and signatures carry the same weight as paper.</li>
          </ul>
          <p>What makes a digital waiver <em>enforceable</em> goes beyond just having a signature. Courts look for: clear and conspicuous language, specific risks disclosed, voluntary consent, and a proper audit trail proving who signed, when, and how.</p>
          <p>This is where quality waiver software matters — capturing timestamps, IP addresses, and device information creates the evidentiary record that holds up in court.</p>
          <Link to="/waiver-laws" className="text-primary hover:underline inline-flex items-center gap-1">Read state-by-state waiver laws <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </SeoSection>

      <SeoSection title="How to Set Up a Digital Waiver">
        <div className="space-y-6">
          {[
            { step: 1, title: "Create Your Waiver Template", desc: "Start with a pre-built rental waiver template or paste your existing liability language. Add custom fields for participant info, emergency contacts, and safety acknowledgments." },
            { step: 2, title: "Choose Your Distribution Method", desc: "Send waivers via email when customers book, display a QR code at your check-in counter, embed a signing link on your website, or set up a tablet kiosk." },
            { step: 3, title: "Customers Sign on Any Device", desc: "Participants open the waiver on their phone, read the terms, provide their full name, initials, and drawn signature — all in under 60 seconds." },
            { step: 4, title: "Waivers Stored Securely", desc: "Every signed waiver is stored as a tamper-proof PDF with a complete audit trail. Search, download, and access records anytime from your dashboard." },
          ].map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Top Waiver Software Options (2025)" muted>
        <ComparisonTable
          headers={["Software", "Pricing", "Rental Focus", "Best For"]}
          rows={[
            ["RentalWaivers", "Pay-per-waiver (6¢–10¢)", "✅ Built for rentals", "Seasonal & rental businesses"],
            ["Smartwaiver", "$18–$260+/month", "❌ Generic", "High-volume year-round ops"],
            ["WaiverForever", "$18–$260/month", "❌ Generic", "Activity-focused businesses"],
            ["WaiverFile", "$19+/month", "❌ Generic", "Small businesses"],
            ["WaiverSign", "$10–$12/month", "❌ Generic", "Budget-conscious, low volume"],
            ["Jotform", "Free–$99/month", "❌ Form tool", "DIY form builders"],
            ["DocuSign", "$15–$45+/month", "❌ Contract tool", "Legal/enterprise contracts"],
          ]}
        />
        <p className="text-sm text-muted-foreground mt-4">
          <Link to="/compare" className="text-primary hover:underline">See detailed comparisons →</Link>
        </p>
      </SeoSection>

      <SeoSection title="Free Templates to Get Started">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { name: "Kayak Rental", slug: "kayak-rental-waiver-template" },
            { name: "Boat Rental", slug: "boat-rental-waiver-template" },
            { name: "Bike Rental", slug: "bike-rental-waiver-template" },
            { name: "ATV Rental", slug: "atv-rental-waiver-template" },
          ].map((t) => (
            <Link to={`/waiver-templates/${t.slug}`} key={t.slug}>
              <Card className="hover:border-primary/40 transition-colors text-center">
                <CardContent className="pt-6">
                  <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">{t.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Link to="/waiver-templates" className="text-sm text-primary hover:underline inline-flex items-center gap-1">Browse all waiver templates <ArrowRight className="h-3 w-3" /></Link>
      </SeoSection>

      <SeoFaq items={[
        { question: "What is waiver software?", answer: "Waiver software is a digital platform that lets businesses create, distribute, and store liability waivers electronically. Customers sign on any device, and signed waivers are stored securely in the cloud with full audit trails." },
        { question: "Are digital waivers legally binding?", answer: "Yes. Under the E-SIGN Act and UETA, electronic signatures carry the same legal weight as ink signatures in all 50 US states. Quality waiver software captures timestamps, IP addresses, and device info for legal defensibility." },
        { question: "How much does waiver software cost?", answer: "Costs range from $10–$260+/month for subscription models. RentalWaivers uses a pay-per-waiver model starting at 6¢ per signature — no monthly fees." },
        { question: "Can customers sign on their phone?", answer: "Yes. Modern waiver software is mobile-first. Customers sign on their phone in under 60 seconds without downloading an app." },
        { question: "How do I send waivers to customers?", answer: "Via email, SMS text link, QR code at your location, embedded on your website, or through a tablet kiosk at check-in." },
        { question: "Can I use my existing waiver language?", answer: "Absolutely. Paste your existing liability waiver text into the template editor, or start with one of our pre-built templates and customize it." },
        { question: "How long are signed waivers stored?", answer: "RentalWaivers stores signed waivers for 7 years by default, configurable up to 99 years. Every waiver is stored as a tamper-proof PDF." },
        { question: "Do I need a subscription?", answer: "Not with RentalWaivers. Pay only when waivers are signed — perfect for seasonal businesses that don't want to pay through the off-season." },
        { question: "What's the difference between waiver software and e-signature tools?", answer: "Waiver software is purpose-built for liability waivers — with features like QR code signing, group waivers, kiosk mode, and audit trails. E-signature tools like DocuSign are designed for contracts and are overkill for waivers." },
        { question: "Can I collect waivers offline?", answer: "Some waiver software supports offline signing where waivers are collected without internet and synced later. This is critical for outdoor rental operations in remote areas." },
      ]} />

      <SeoCta
        headline="Start collecting digital waivers today"
        subtext="No monthly fees. No contracts. Pay per waiver. Set up in under 5 minutes."
      />
    </SeoPageLayout>
  );
}
