import { Link } from "react-router-dom";
import { SeoPageLayout, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode,
  Smartphone,
  Shield,
  Printer,
  ArrowRight,
  CheckCircle,
  Waves,
  Clock,
  FileCheck,
} from "lucide-react";
import { InternalLinks } from "@/components/InternalLinks";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/lib/structured-data";

const faqItems = [
  {
    question: "How does a QR code waiver work?",
    answer:
      "You generate a unique QR code for one of your waivers, print the sign, and post it on your equipment, counter, or rental desk. A guest opens their phone camera, points at the code, taps the link, reads the waiver and signs with their finger. The signed copy is emailed to them and stored in your account instantly.",
  },
  {
    question: "Do guests need to download an app?",
    answer:
      "No. The QR code opens a normal web page in whatever browser the phone already has. There is nothing to install, no account to create, and no password.",
  },
  {
    question: "Is a waiver signed from a QR code legally binding?",
    answer:
      "Yes. Under the US ESIGN Act and UETA, an electronic signature carries the same weight as ink on paper. Every QR signature is recorded with the signer's name, email, a server-side IP address the signer cannot alter, device information, the exact consent wording shown, and a UTC timestamp — then locked into a PDF.",
  },
  {
    question: "Is each QR code unique?",
    answer:
      "Yes. Every QR code is generated with its own random code, permanently tied to one waiver and one account. You can name each one (for example \"Kayak #4\" or \"Front desk\") so you always know which sign a guest scanned, and you can turn any single code off without affecting the others.",
  },
  {
    question: "What does a QR code cost?",
    answer:
      "Generating a printable QR sign is a one-time charge of 5 credits. There is no monthly fee and no subscription. Each waiver actually signed through it costs the normal per-signature credit — roughly 6 cents.",
  },
  {
    question: "Does the guest get a copy of their signed waiver?",
    answer:
      "Yes. The guest enters their own email on the signing screen, so a signed PDF is emailed straight to them and your account keeps a permanent stored record with their real name and contact details.",
  },
  {
    question: "What if there is no cell signal at my dock or trailhead?",
    answer:
      "The guest's phone needs a connection at the moment they sign. If coverage is poor at the water's edge, post the sign where guests check in or where your WiFi reaches, and they can sign before heading out.",
  },
  {
    question: "Can I stop a QR code from being used?",
    answer:
      "Yes. Turn the code off in your dashboard at any time and any future scans stop working immediately. Waivers already signed through it stay in your archive permanently.",
  },
];

export default function QrCodeWaiversPage() {
  const url = "https://www.rentalwaivers.com/qr-code-waivers";

  return (
    <SeoPageLayout
      metaTitle="QR Code Waivers — Guests Scan and Sign On the Spot | RentalWaivers"
      metaDescription="Print a QR code, stick it on your kayaks, bounce house, or front desk, and guests sign your liability waiver on their phone in under a minute. No app, legally binding, 6¢ per signature, no monthly fee."
      canonicalPath="/qr-code-waivers"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "QR Code Waivers", url },
          ]),
          faqSchema(faqItems),
          howToSchema({
            name: "How to set up a QR code waiver",
            description: "Post a printed QR code so guests sign your waiver on their own phone.",
            totalTimeISO: "PT5M",
            steps: [
              { name: "Create your waiver", text: "Build or upload the waiver template you want guests to sign." },
              { name: "Generate a unique QR code", text: "Name the sign — for example Kayak #4 — and generate its unique QR code for a one-time 5 credits." },
              { name: "Print and post it", text: "Print the ready-made sign, laminate it if it lives outdoors, and attach it to your equipment or counter." },
              { name: "Guests scan and sign", text: "The guest points their phone camera at the code, reads the waiver, enters their email and signs." },
              { name: "Keep the record", text: "The signed PDF is emailed to the guest and stored permanently in your Signed Waivers archive." },
            ],
          }),
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-muted/40">
        <div className="container max-w-6xl py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            <QrCode className="h-3.5 w-3.5" /> QR Code Waivers
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Stick a QR Code on It.
            <br className="hidden md:block" /> Guests Sign Before They Touch It.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Print one sign, tape it to your kayak, bounce house, ATV, pool gate or front desk.
            Guests scan with their phone camera and sign your liability waiver in under a minute —
            no app, no paper, no clipboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/signup">
                Get Your QR Code — 250 Free Credits <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/pricing">See Pricing</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Legally binding under ESIGN & UETA</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Signed in about 60 seconds</span>
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Every code unique to your account</span>
          </div>
        </div>
      </section>

      <SeoSection title="How QR Code Waivers Work" muted>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            {
              icon: QrCode,
              title: "1. Generate a unique code",
              text: "Pick the waiver, name the sign (\"Kayak #4\", \"Front desk\"), and generate its own QR code. One-time cost: 5 credits.",
            },
            {
              icon: Printer,
              title: "2. Print and post it",
              text: "Print the ready-made sign on plain paper, laminate it for outdoor use, and attach it wherever guests start their rental.",
            },
            {
              icon: Smartphone,
              title: "3. Guest scans and signs",
              text: "Phone camera, tap the link, read the waiver, type their email and sign with a finger. No app download, no account.",
            },
            {
              icon: FileCheck,
              title: "4. You keep the record",
              text: "The signed PDF is emailed to the guest and filed in your Signed Waivers archive with a full audit trail.",
            },
          ].map((s) => (
            <Card key={s.title}>
              <CardContent className="pt-6">
                <s.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="Why a Scanned Signature Holds Up">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">A real audit trail, not just a picture of a signature</h3>
              <p className="text-sm text-muted-foreground">
                Each signature is stored with the signer's legal name, their own email address, the
                exact consent wording they were shown, their device information, a UTC timestamp,
                and an IP address recorded on our servers — not sent by the phone, so it can't be
                faked. The finished PDF is hashed so any later edit is detectable.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">ESIGN and UETA compliant</h3>
              <p className="text-sm text-muted-foreground">
                US federal law treats an electronic signature the same as ink on paper when the
                signer consents and receives a copy. Guests must scroll to the end of the waiver
                before the signature pad unlocks, tick the electronic-signing consent, and enter an
                email so their copy is delivered automatically.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <QrCode className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Every code is unique and traceable</h3>
              <p className="text-sm text-muted-foreground">
                No shared link that spreads beyond your business. Each printed sign carries its own
                random code tied to one waiver and one account, counts its own scans, and can be
                switched off on its own if a sign goes missing or a piece of equipment is retired.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Smartphone className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Minors handled properly</h3>
              <p className="text-sm text-muted-foreground">
                If your activity allows children, the adult signing can add each minor by name and
                age and confirm they're the parent or legal guardian. If it doesn't, switch minors
                off for that waiver and guests never see the section at all.
              </p>
            </CardContent>
          </Card>
        </div>
      </SeoSection>

      <SeoSection title="Where Operators Post Their QR Codes" muted>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Waves, title: "Kayak, paddleboard and boat rentals", text: "Laminated sign taped to each hull or on the dock post — guests sign before they push off." },
            { icon: Smartphone, title: "Bounce house and party rentals", text: "A card in the delivery kit means the parent signs at drop-off, before the first kid climbs in." },
            { icon: Printer, title: "Vacation rentals and pools", text: "Posted at the pool gate, hot tub, or on the welcome binder inside the property." },
            { icon: QrCode, title: "ATV, e-bike and powersports", text: "One code per machine so you know exactly which unit each rider signed for." },
            { icon: Shield, title: "Gyms, studios and climbing walls", text: "At the front desk for drop-ins and day passes, no clipboard and no data entry afterwards." },
            { icon: FileCheck, title: "Apartments, HOAs and clubhouses", text: "On the amenity door — pool, gym, event room — so residents and guests are covered." },
          ].map((u) => (
            <Card key={u.title}>
              <CardContent className="pt-6">
                <u.icon className="h-7 w-7 text-primary mb-3" />
                <h3 className="font-semibold mb-1.5 text-sm">{u.title}</h3>
                <p className="text-sm text-muted-foreground">{u.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      <SeoSection title="What It Costs">
        <p className="text-muted-foreground">
          There is no subscription. New accounts start with 250 free credits. Generating a printable
          QR sign is a one-time 5 credits, and each waiver actually signed through it costs the normal
          per-signature credit — about 6 cents. Storing, viewing, downloading and printing your signed
          waivers is always free and the records never expire.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link to="/signup">
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <InternalLinks />

      <SeoCta
        headline="Print your first QR code today"
        subtext="Create a waiver, generate a unique QR sign, and start collecting signed, legally binding waivers on your guests' own phones."
      />
    </SeoPageLayout>
  );
}
