import { Link } from "react-router-dom";
import { SeoPageLayout, SeoHero, SeoSection, SeoFaq, SeoCta, ComparisonTable } from "@/components/SeoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Smartphone, WifiOff, MapPin, Users, FileText, ArrowRight, Clock, DollarSign, Shield } from "lucide-react";

export default function RentalWaiverSoftwarePage() {
  return (
    <SeoPageLayout
      metaTitle="Rental Waiver Software — No Monthly Fee, Pay Per Signature | RentalWaivers"
      metaDescription="Waiver software built specifically for rental businesses. QR code signing, mobile waivers, group signing, and audit trails. Pay only when waivers are signed — no subscription."
    >
      <SeoHero
        badge="Built for Rental Businesses"
        h1="Rental Waiver Software — No Monthly Fee, Pay Per Signature"
        subtitle="The only waiver platform built specifically for rental businesses"
        description="Kayak shops, boat rental marinas, ATV outfitters, bike rental companies, and equipment rental centers all have one thing in common: they need waivers that work at check-in speed. RentalWaivers is built for the way rental businesses actually operate — seasonal, high-volume, and mobile-first."
      />

      <SeoSection title="How RentalWaivers Works" muted>
        <div className="space-y-6">
          {[
            { step: 1, title: "Create Your Rental Waiver", desc: "Use our template editor to build your liability waiver. Start from a rental-specific template or paste your existing language. Add custom fields for equipment type, rental period, experience level, and safety acknowledgments." },
            { step: 2, title: "Share with Renters", desc: "Send waivers via email when customers book, display a QR code at your rental counter, or set up a kiosk tablet. Waivers can be sent manually or automatically through our API and integrations." },
            { step: 3, title: "Renters Sign on Any Device", desc: "Customers open the waiver on their phone, read the terms, and provide their legal name, initials, and drawn signature. The entire process takes under 60 seconds — no app download required." },
            { step: 4, title: "Secure Storage & Instant Access", desc: "Every signed waiver is stored as a tamper-proof PDF with timestamps, IP addresses, and device information. Search and access any waiver instantly from your dashboard." },
          ].map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{s.step}</div>
              <div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Pay Per Waiver — Not Per Month">
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Most waiver software charges $18–$260/month whether you use it or not. That's a terrible deal for seasonal rental businesses. A kayak shop in Colorado might process 400 waivers during summer and zero in winter — why pay $49/month through December?</p>
          <p><strong className="text-foreground">RentalWaivers charges only when a waiver is signed.</strong> Buy credits in bulk, use them when you need them, and never pay for months you're closed.</p>

          <div className="bg-muted/50 rounded-lg p-6 my-6">
            <h3 className="font-semibold text-foreground mb-3">Real Example: Kayak Rental Shop in Austin</h3>
            <ComparisonTable
              headers={["", "RentalWaivers", "Smartwaiver ($49/mo)"]}
              rows={[
                ["Spring/Summer (400 waivers)", "400 credits = $32", "$294 (6 months)"],
                ["Fall/Winter (0 waivers)", "$0", "$294 (6 months)"],
                ["Annual Total", "$32", "$588"],
                ["Annual Savings", "—", "Save $556/year (95%)"],
              ]}
            />
          </div>

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
                  <div className="font-semibold text-foreground">{pkg.price}</div>
                  <div className="text-xs text-muted-foreground">{pkg.per}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Link to="/pricing-info" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">See full pricing details <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </SeoSection>

      <SeoSection title="Features Built for Rental Operations" muted>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: QrCode, title: "QR Code Check-In", desc: "Display a QR code at your rental counter or launch point. Customers scan with their phone and sign the waiver in under 60 seconds — no paper, no waiting." },
            { icon: Smartphone, title: "Mobile-First Signing", desc: "Every waiver is optimized for phone signing. Guests don't need to download an app or create an account. Open, read, sign, done." },
            { icon: Users, title: "Group Waivers", desc: "One shared link for the whole group — each participant signs individually with their own name and signature. Perfect for tour groups and multi-rider bookings." },
            { icon: WifiOff, title: "Works Without WiFi", desc: "Remote boat launches and outdoor rental locations often lack reliable internet. Collect waivers offline and sync when you're back online." },
            { icon: MapPin, title: "Multi-Location Dashboard", desc: "Manage waivers across multiple rental locations from one dashboard. Each location gets its own templates and QR codes." },
            { icon: Clock, title: "Seasonal Flexibility", desc: "No monthly fees means you never pay during your off-season. Buy credits when you need them, use them when you're busy." },
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

      <SeoSection title="Rental Types We Serve">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Kayak Rentals", slug: "kayak-rental-waiver-software" },
            { name: "Bike Rentals", slug: "bike-rental-waiver-software" },
            { name: "Boat Rentals", slug: "boat-rental-waiver-software" },
            { name: "Jet Ski Rentals", slug: "jet-ski-rental-waiver-software" },
            { name: "ATV Rentals", slug: "atv-rental-waiver-software" },
            { name: "Scooter Rentals", slug: "scooter-rental-waiver-software" },
            { name: "Equipment Rentals", slug: "equipment-rental-waiver-software" },
            { name: "Bounce Houses", slug: "bounce-house-rental-waiver-software" },
            { name: "Ski Rentals", slug: "ski-rental-waiver-software" },
            { name: "Paddleboard Rentals", slug: "paddleboard-rental-waiver-software" },
            { name: "Golf Cart Rentals", slug: "golf-cart-rental-waiver-software" },
            { name: "RV Rentals", slug: "rv-rental-waiver-software" },
          ].map((v) => (
            <Link to={`/industries/${v.slug}`} key={v.slug}>
              <Card className="hover:border-primary/40 transition-colors text-center">
                <CardContent className="py-4">
                  <p className="text-sm font-medium">{v.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Link to="/industries" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-4">Browse all industries <ArrowRight className="h-3 w-3" /></Link>
      </SeoSection>

      <SeoSection title="Replacing Paper Waivers at Your Rental Desk" muted>
        <ComparisonTable
          headers={["", "Paper Waivers", "RentalWaivers Digital"]}
          rows={[
            ["Signing Experience", "Clipboard, pen, waiting in line", "Scan QR → sign on phone in 60 sec"],
            ["Storage", "Filing cabinets, boxes, lost forms", "Cloud storage for 7+ years"],
            ["Search & Retrieval", "Dig through boxes manually", "Instant search by name, email, date"],
            ["Legal Defensibility", "Faded ink, missing forms", "Timestamped, IP-logged, audit trail"],
            ["Weather Resistance", "Water, sun, wind damage", "100% digital, immune to elements"],
            ["Cost", "Printing + storage + staff time", "Starting at 6¢ per waiver"],
          ]}
        />
      </SeoSection>

      <SeoSection title="Why Rental Businesses Leave Smartwaiver">
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Smartwaiver is the biggest name in waiver software, but it wasn't built for rental businesses. Their pricing model — $18 to $260+ per month — punishes seasonal operations. A ski rental shop paying $49/month through July isn't getting value.</p>
          <p>Common complaints from rental operators who switch to RentalWaivers:</p>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong className="text-foreground">Paying for months they're closed</strong> — Monthly subscriptions don't pause for off-season</li>
            <li><strong className="text-foreground">Overpaying at low volume</strong> — 50 waivers in a slow month still costs $49</li>
            <li><strong className="text-foreground">No rental-specific features</strong> — Smartwaiver is built for gyms and activity centers, not rental desks</li>
            <li><strong className="text-foreground">Complex setup</strong> — Rental ops need fast, simple onboarding</li>
          </ul>
          <Link to="/compare" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">See full competitor comparisons <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </SeoSection>

      <SeoFaq items={[
        { question: "Is RentalWaivers specifically built for rental businesses?", answer: "Yes. While any business can use RentalWaivers, the platform is designed around the unique needs of rental operations — seasonal volume, QR code check-in, group signing, and pay-per-use pricing that doesn't penalize off-season months." },
        { question: "How much does RentalWaivers cost?", answer: "Pay-per-waiver starting at 6¢. Buy credits in bulk: 200 for $20, 550 for $50, 1,250 for $100, or 8,000 for $500. No monthly fees, no contracts, no off-season charges." },
        { question: "Can I switch from Smartwaiver or WaiverForever?", answer: "Yes. Create your waiver template in RentalWaivers (or paste your existing language), and you can start collecting digital waivers immediately. The entire setup takes under 10 minutes." },
        { question: "Do renters need to download an app?", answer: "No. Renters sign on their phone's web browser. No app download, no account creation — just open the link and sign." },
        { question: "What about minors?", answer: "Include a guardian signature field in your waiver template. The parent or guardian signs on behalf of the minor, with their own name and signature captured separately." },
        { question: "Can I use this for seasonal operations?", answer: "Absolutely — that's one of the biggest advantages. Buy credits in spring, use them through summer, and pay nothing through winter. No subscription to cancel or pause." },
        { question: "How do group bookings work?", answer: "Create a group signing link that you can share with the entire group. Each participant signs individually with their own name and signature. One link handles parties of any size." },
        { question: "Are these waivers legally binding?", answer: "Yes. Electronic signatures are legally binding under the E-SIGN Act and UETA. Every waiver captures full name, drawn signature, timestamp, IP address, and device information for maximum legal defensibility." },
        { question: "What integrations do you support?", answer: "RentalWaivers offers a REST API and webhooks for integration with any booking platform. We also support marketplace integrations with platforms like Hospitable for property managers." },
        { question: "How long are signed waivers stored?", answer: "7 years by default, configurable up to 99 years. Every signed waiver is stored as a tamper-proof PDF with SHA-256 hash verification." },
      ]} />

      <SeoCta
        headline="Get your rental waiver live today"
        subtext="First 250 waivers free on signup. No credit card. No monthly fee."
      />
    </SeoPageLayout>
  );
}
