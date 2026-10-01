import { Link } from "react-router-dom";
import { SeoPageLayout, SeoSection, SeoFaq, SeoCta } from "@/components/SeoPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Smartphone,
  Apple,
  QrCode,
  ScanLine,
  Tablet,
  Wallet,
  CheckCircle,
  ArrowRight,
  Bell,
  FileCheck,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";

const faqItems = [
  {
    question: "Is there a RentalWaivers app for iPhone and iPad?",
    answer:
      "Yes. RentalWaivers is available on iOS for iPhone and iPad through the App Store. The app runs your full waiver operation: guests sign, you scan check-in passes, and your whole signed-waiver archive travels with you. There is nothing extra to pay for the app — it uses the same pay-per-waiver credits as the website.",
  },
  {
    question: "What can the iOS app do?",
    answer:
      "Everything the website does, on your phone or tablet. Guests sign waivers on your device or their own phone via QR codes, you scan guest check-in passes with the camera, run a self-service Front Desk mode on an iPad, view and search every signed waiver, and guests can add their check-in pass to Apple Wallet.",
  },
  {
    question: "How much does the app cost?",
    answer:
      "The app itself is free. RentalWaivers has no monthly fee — you pay only when a guest actually signs, about 6 cents per waiver, and new accounts start with free credits. Waiver storage, search, and PDF downloads are always included.",
  },
  {
    question: "Do guests need to download the app to sign?",
    answer:
      "No. Guests never need an app. They scan your QR code or tap your signing link and sign in their phone's browser in under a minute. The app is for you, the operator — it is your portable waiver desk and check-in scanner.",
  },
  {
    question: "Is a waiver signed in the app legally binding?",
    answer:
      "Yes. Electronic signatures carry the same legal weight as ink on paper under the US ESIGN Act and UETA, whether signed in a browser or in the app. Every signature is recorded with the signer's name, contact details, device information, and a tamper-evident timestamp, then locked into a stored PDF.",
  },
  {
    question: "Can I run the app on an iPad at my front desk?",
    answer:
      "Yes. Front Desk mode turns an iPad into a self-service signing station: a big welcome screen, the guest taps to start, reads and signs, and the tablet resets itself for the next guest without ever showing the previous guest's information. Pair it with Apple's Guided Access to keep guests on that one screen.",
  },
  {
    question: "Does the app work when my dock or venue has bad signal?",
    answer:
      "Check-in scanning and viewing your waiver archive keep working with a connection, and guests can sign wherever your WiFi reaches. If coverage is poor at the water's edge, post your QR sign at the check-in counter and have guests sign before they head out.",
  },
  {
    question: "Can guests save their waiver pass to Apple Wallet?",
    answer:
      "Yes. After signing, guests can add their check-in pass to Apple Wallet on iPhone. The pass shows your business name, the activity, everyone covered, the valid-until date, and a code you can scan at arrival to confirm their waiver is on file.",
  },
];

export default function IosAppPage() {
  const url = "https://www.rentalwaivers.com/ios-app";

  return (
    <SeoPageLayout
      metaTitle="Rental Waivers App for iOS & iPad — Download the Waiver App | RentalWaivers"
      metaDescription="Download our rental waivers app for iOS and iPad. Guests sign on the spot, you scan check-in passes with the camera, and your whole waiver archive fits in your pocket. No monthly fee — about 6¢ per signed waiver."
      canonicalPath="/ios-app"
    >
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "https://www.rentalwaivers.com/" },
            { name: "iOS & iPad App", url },
          ]),
          faqSchema(faqItems),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "RentalWaivers — Rental Waivers & Check-In",
            applicationCategory: "BusinessApplication",
            operatingSystem: "iOS, iPadOS",
            url,
            description:
              "Mobile liability waiver app for iPhone and iPad: guests sign on the spot, staff scan check-in passes with the camera, and every signed waiver is stored, searchable, and downloadable as a PDF.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description:
                "Free app. Pay per signed waiver (about 6¢). No monthly fee.",
            },
          },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-muted/40">
        <div className="container max-w-6xl py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            <Smartphone className="h-3.5 w-3.5" /> iPhone · iPad
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Download our rental waivers app
            <br className="hidden md:block" /> for iOS and for iPad.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Run your whole waiver operation from the device already in your pocket.
            Guests sign on the spot, you scan their check-in passes with the camera,
            and every signed waiver lives in your archive — searchable and ready to
            download as a PDF.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/login">
                Start Free on the Web <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/qr-code-waivers">How QR Signing Works</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            The RentalWaivers app is rolling out now on the Apple App Store for iPhone
            and iPad. Start on the web today — your account, waivers, and signed records
            carry straight over.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Free app, no monthly fee</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> About 6¢ per signed waiver</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Legally binding e-signatures</span>
          </div>
        </div>
      </section>

      {/* What it can do */}
      <SeoSection title="What the app can do">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: QrCode,
              title: "Guests sign on your device or their own",
              text: "Open a waiver on your iPhone or iPad and hand it over, or post a printed QR code and let guests sign on their own phones. Either way, the signed copy is emailed to the guest and stored in your account instantly.",
            },
            {
              icon: ScanLine,
              title: "Check-in scanner built in",
              text: "When guests arrive, scan the code on their waiver pass with your device's camera or type it in. The app confirms on the spot that the waiver is on file, who it covers, and whether it's still valid — no paperwork, no guessing.",
            },
            {
              icon: Tablet,
              title: "Front Desk mode for iPad",
              text: "Turn an iPad into a self-service signing station: a big welcome screen, the guest taps to start, reads, signs, and the tablet resets itself for the next person without ever showing the previous guest's information.",
            },
            {
              icon: FileCheck,
              title: "Your whole waiver archive, in your pocket",
              text: "Search every signed waiver by guest name or email, open any record, and download the signed PDF — from the truck, the dock, or the front counter. Records are kept for you; storage and downloads are always included.",
            },
            {
              icon: Wallet,
              title: "Check-in passes for Apple Wallet",
              text: "After signing, guests can add their pass to Apple Wallet on iPhone. It shows your business name, the activity, everyone covered, and the valid-until date — so check-in at arrival takes seconds.",
            },
            {
              icon: Bell,
              title: "Signed and emailed automatically",
              text: "Every completed waiver goes straight to the guest's inbox and to yours if you want a copy. Nothing to file, nothing to scan, nothing to lose.",
            },
          ].map((f) => (
            <Card key={f.title}>
              <CardContent className="pt-6 flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      {/* Who it's for */}
      <SeoSection title="Built for rental businesses that work on their feet" muted>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          If your waivers get signed where the equipment is — a dock, a driveway, a bounce
          house setup, a tour meeting point — the app is the fastest way to collect them.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Kayak & paddleboard rentals",
            "Bounce house companies",
            "ATV & jet ski rentals",
            "Boat charters & tours",
            "Vacation rental hosts",
            "Pool rental marketplaces",
            "Event & party rentals",
            "Bike & e-scooter rentals",
          ].map((use) => (
            <Card key={use}>
              <CardContent className="py-4 text-sm font-medium text-center">{use}</CardContent>
            </Card>
          ))}
        </div>
      </SeoSection>

      {/* Pricing strip */}
      <SeoSection title="Free app. No monthly fee. Pay per signed waiver.">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <Card>
            <CardContent className="pt-6">
              <Apple className="h-6 w-6 mx-auto text-primary mb-3" />
              <div className="text-2xl font-bold font-heading">Free</div>
              <p className="text-sm text-muted-foreground mt-1">The app itself costs nothing on iPhone and iPad.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="h-6 w-6 mx-auto text-primary mb-3" />
              <div className="text-2xl font-bold font-heading">~6¢ / waiver</div>
              <p className="text-sm text-muted-foreground mt-1">You're charged a credit only when a guest actually signs. Drafts and unsigned links are free.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <FileCheck className="h-6 w-6 mx-auto text-primary mb-3" />
              <div className="text-2xl font-bold font-heading">$0 storage</div>
              <p className="text-sm text-muted-foreground mt-1">Unlimited waiver storage, search, and PDF downloads are always included.</p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-8">
          <Button asChild size="lg" variant="outline" className="text-base">
            <Link to="/pricing-info">See Full Pricing</Link>
          </Button>
        </div>
      </SeoSection>

      <SeoFaq items={faqItems} />

      <SeoCta
        headline="Start free today — use the app as soon as it's on the App Store"
        subtext="Create your account on the web now: build your waivers, post your QR codes, and start collecting signatures. Your account works across the website and the iOS app with the same credits and the same records."
      />
    </SeoPageLayout>
  );
}
