import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import {
  ArrowRight,
  Code,
  Webhook,
  Key,
  FileText,
  BookOpen,
  CreditCard,
  Users,
  HelpCircle,
  Scale,
  Send,
  Globe,
  LayoutTemplate,
  UserCircle,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const codeBlock = (code: string) => (
  <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 text-sm overflow-x-auto font-mono">
    <code>{code}</code>
  </pre>
);

const inlineCode = (text: string) => (
  <code className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono">{text}</code>
);

const sections = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "sending-waivers", label: "Sending Waivers", icon: Send },
  { id: "marketplace", label: "Marketplace Integration", icon: Globe },
  { id: "customer-portal", label: "Customer Portal", icon: UserCircle },
  { id: "billing", label: "Credits & Billing", icon: CreditCard },
  { id: "api-reference", label: "API Reference", icon: Code },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "team", label: "Team Management", icon: Users },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "legal", label: "Legal", icon: Scale },
];

export default function Docs() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("getting-started");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Rental Waivers" className="h-8 w-8" />
              <span className="font-heading text-lg font-bold tracking-tight">Rental Waivers</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Docs
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-16 bottom-0 left-0 z-40 w-64 border-r bg-background overflow-y-auto transition-transform duration-200",
            "md:translate-x-0 md:block",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* ==================== GETTING STARTED ==================== */}
            <section id="getting-started" className="mb-20 scroll-mt-24">
              <h1 className="font-heading text-4xl font-bold tracking-tight mb-4">
                Knowledge Base
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Everything you need to set up, integrate, and manage waivers for your rental
                marketplace. From first sign-up to advanced API usage.
              </p>

              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Getting Started
              </h2>

              <p className="text-muted-foreground mb-6">
                Get up and running with Rental Waivers in under 5 minutes. Every new organization
                gets <strong>5 free starter credits</strong> so you can test the full flow before
                purchasing.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Create your account</p>
                    <p className="text-sm text-muted-foreground">
                      Sign up at rentalwaivers.com with your email or Google account. Verify your
                      email to unlock all features.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Create your organization</p>
                    <p className="text-sm text-muted-foreground">
                      Go to Settings and create your organization. This is your workspace where
                      templates, envelopes, and team members live. Give it a clear name (e.g., "Pool
                      Paradise Rentals").
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Build your first waiver template</p>
                    <p className="text-sm text-muted-foreground">
                      Pick a preset (pool, vacation rental, equipment, or event) or start from
                      scratch. Templates support variables like {"{{customer_name}}"} and{" "}
                      {"{{date}}"} that get filled in automatically when you send a waiver.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Send your first waiver</p>
                    <p className="text-sm text-muted-foreground">
                      Enter a signer's email, fill in the template variables, and hit Send. The
                      signer receives an email with a signing link. You'll see the status update in
                      real time on your dashboard. Your 5 free starter credits cover this.
                    </p>
                  </div>
                </div>
              </div>

              <Card className="bg-accent/30">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <strong>5 free credits:</strong> Every new organization starts with 5 complimentary
                    credits. Each credit covers one signer on one envelope. Use them to test the full
                    send-sign-complete workflow before purchasing a credit package.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* ==================== TEMPLATES ==================== */}
            <section id="templates" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5" /> Templates
              </h2>

              <p className="text-muted-foreground mb-6">
                Templates are the foundation of every waiver you send. A template defines the legal
                language, layout, and variable placeholders that get filled in when you create an
                envelope.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Creating a Template</h3>
              <p className="text-muted-foreground mb-4">
                Navigate to Templates in the sidebar and click "New Template." You can start from one
                of the four preset categories or create a blank template.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Preset Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-medium mb-1">Pool Waiver</p>
                    <p className="text-sm text-muted-foreground">
                      Covers pool safety rules, drowning risk acknowledgment, supervision
                      requirements, and liability release for pool rentals.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-medium mb-1">Vacation Rental Waiver</p>
                    <p className="text-sm text-muted-foreground">
                      Property damage liability, house rules acceptance, occupancy limits, and guest
                      conduct agreements for short-term rentals.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-medium mb-1">Equipment Rental Waiver</p>
                    <p className="text-sm text-muted-foreground">
                      Covers equipment condition acknowledgment, damage liability, proper usage
                      requirements, and return condition terms.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-medium mb-1">Event Waiver</p>
                    <p className="text-sm text-muted-foreground">
                      Injury risk acknowledgment, photo/video release, conduct expectations, and
                      liability release for hosted events.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="font-heading text-lg font-semibold mb-3">Template Variables</h3>
              <p className="text-muted-foreground mb-4">
                Use double-curly-brace placeholders in your template body. These are replaced with
                real values when you send a waiver (via the dashboard or API).
              </p>
              <div className="rounded-lg border overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-accent/50">
                      <th className="px-4 py-2 text-left font-medium">Variable</th>
                      <th className="px-4 py-2 text-left font-medium">Example Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">{"{{customer_name}}"}</td>
                      <td className="px-4 py-2 text-muted-foreground">Jane Smith</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">{"{{date}}"}</td>
                      <td className="px-4 py-2 text-muted-foreground">March 15, 2026</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">{"{{time}}"}</td>
                      <td className="px-4 py-2 text-muted-foreground">2:00 PM</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">{"{{host_name}}"}</td>
                      <td className="px-4 py-2 text-muted-foreground">Pool Paradise LLC</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">{"{{address}}"}</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        123 Pool Lane, Riverside, CA
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">{"{{state}}"}</td>
                      <td className="px-4 py-2 text-muted-foreground">California</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">{"{{rules}}"}</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        No diving. No glass. Children under 12 must be supervised.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                You can add any custom variable you like. Just use the{" "}
                {inlineCode("{{variable_name}}")} syntax in your template and provide the value when
                sending.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Template Versioning</h3>
              <p className="text-muted-foreground mb-4">
                Every time you edit and save a template, a new version is created. Previously sent
                waivers always reference the version they were sent with, so updating a template never
                retroactively changes signed documents. You can view version history from the template
                detail page.
              </p>
            </section>

            {/* ==================== SENDING WAIVERS ==================== */}
            <section id="sending-waivers" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <Send className="h-5 w-5" /> Sending Waivers
              </h2>

              <p className="text-muted-foreground mb-6">
                There are three ways to send waivers: manually from the dashboard, in bulk via CSV
                upload, or as a group waiver with a single shared link.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Manual Send</h3>
              <p className="text-muted-foreground mb-4">
                From the dashboard, click "New Waiver," select a template, enter the signer's name and
                email, fill in any template variables, and hit Send. The signer receives an email with
                a secure signing link. One credit is deducted per signer at send time.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Bulk Send</h3>
              <p className="text-muted-foreground mb-4">
                Need to send waivers to many people at once? Use the Bulk Send feature. Upload a CSV
                file with columns for signer email, signer name, and any template variables. Rental
                Waivers creates one envelope per row and sends all signing emails at once. Credits are
                deducted for each signer in the batch.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Group Waivers</h3>
              <p className="text-muted-foreground mb-4">
                Group waivers let you generate a single link that multiple people can use to sign the
                same waiver. This is ideal for events, pool parties, or any situation where a whole
                party needs to sign. Share the link via text, email, or QR code. Each person who signs
                through the group link creates their own completed envelope. One credit is consumed per
                person who signs.
              </p>

              <Card className="bg-accent/30">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <strong>Credit deduction timing:</strong> Credits are deducted at the moment you
                    send a waiver (or when each signer submits via a group link), not when the signer
                    completes it. If a waiver is canceled before signing, the credit is refunded to
                    your balance.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* ==================== MARKETPLACE INTEGRATION ==================== */}
            <section id="marketplace" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5" /> Marketplace Integration
              </h2>

              <p className="text-muted-foreground mb-6">
                Rental Waivers is designed to plug into any rental or booking marketplace. Whether you
                use a managed platform like ShareTribe, a no-code builder like Bubble, or an
                automation layer like Zapier or Make, you can trigger waiver sends automatically when a
                booking is confirmed.
              </p>

              {/* ShareTribe Flex */}
              <h3 className="font-heading text-xl font-semibold mb-3">ShareTribe Flex</h3>
              <p className="text-muted-foreground mb-4">
                ShareTribe Flex (now Sharetribe) supports custom transaction process webhooks. You can
                fire a waiver automatically when a booking transitions to "confirmed."
              </p>
              <ol className="list-decimal pl-6 text-sm text-muted-foreground space-y-2 mb-4">
                <li>
                  In your Sharetribe backend (e.g., FTW or custom server), add a webhook handler for
                  the {inlineCode("transition/confirm-payment")} transition.
                </li>
                <li>
                  Generate an API key in Rental Waivers under Settings &rarr; API Keys.
                </li>
                <li>
                  In the webhook handler, call {inlineCode("POST /envelopes")} with the guest's email,
                  name, booking ID, listing ID, and any template variables from the transaction data.
                </li>
                <li>
                  Optionally set {inlineCode("send_email: false")} and embed the returned{" "}
                  {inlineCode("signing_url")} directly in your booking confirmation page or email.
                </li>
                <li>
                  Configure a Rental Waivers webhook to receive {inlineCode("envelope.completed")} and
                  update the transaction status in Sharetribe.
                </li>
              </ol>
              {codeBlock(`// Sharetribe transaction webhook handler (Node.js / Express)
app.post('/webhooks/sharetribe', async (req, res) => {
  const { transaction } = req.body;

  if (transaction.attributes.lastTransition === 'transition/confirm-payment') {
    const { customer, listing, booking } = transaction.relationships;

    const response = await fetch(RENTAL_WAIVERS_API + '/envelopes', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.RENTAL_WAIVERS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: process.env.WAIVER_TEMPLATE_ID,
        signer_email: customer.attributes.email,
        signer_name: customer.attributes.profile.displayName,
        booking_id: transaction.id,
        listing_id: listing.id,
        send_email: true,
        payload: {
          customer_name: customer.attributes.profile.displayName,
          date: booking.attributes.start,
          host_name: listing.attributes.title,
          state: listing.attributes.publicData.state || 'California',
          rules: listing.attributes.publicData.rules || 'Follow all posted rules.',
        },
      }),
    });

    const envelope = await response.json();
    console.log('Waiver sent:', envelope.signing_url);
  }

  res.status(200).send('ok');
});`)}

              {/* Bubble.io */}
              <h3 className="font-heading text-xl font-semibold mt-10 mb-3">Bubble.io</h3>
              <p className="text-muted-foreground mb-4">
                Bubble's API Connector plugin lets you call the Rental Waivers API without writing
                code.
              </p>
              <ol className="list-decimal pl-6 text-sm text-muted-foreground space-y-2 mb-4">
                <li>
                  Install the <strong>API Connector</strong> plugin from the Bubble plugin marketplace.
                </li>
                <li>
                  Add a new API called "Rental Waivers." Set authentication to "Private key in header"
                  with header name {inlineCode("x-api-key")} and your API key as the value.
                </li>
                <li>
                  Create a call named "Send Waiver" with method POST and URL set to your base URL +{" "}
                  {inlineCode("/envelopes")}. Define the JSON body with dynamic parameters for
                  template_id, signer_email, signer_name, and payload fields.
                </li>
                <li>
                  In your booking workflow, add a "Plugins &rarr; Rental Waivers - Send Waiver" action
                  after payment is confirmed. Map your booking data to the API parameters.
                </li>
                <li>
                  To receive webhook callbacks, use Bubble's Backend Workflows (requires a paid plan).
                  Create an API workflow endpoint and paste the URL into Rental Waivers webhook
                  settings.
                </li>
              </ol>

              {/* Zapier */}
              <h3 className="font-heading text-xl font-semibold mt-10 mb-3">Zapier</h3>
              <p className="text-muted-foreground mb-4">
                Connect any booking app to Rental Waivers with a two-step Zap. No code required.
              </p>
              <ol className="list-decimal pl-6 text-sm text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Trigger:</strong> Choose your booking platform as the trigger app (e.g.,
                  "Calendly - New Event," "Acuity - New Appointment," or a generic Webhook trigger).
                </li>
                <li>
                  <strong>Action:</strong> Add a "Webhooks by Zapier" action. Choose "Custom Request"
                  with method POST.
                </li>
                <li>
                  Set the URL to your Rental Waivers API base URL +{" "}
                  {inlineCode("/envelopes")}.
                </li>
                <li>
                  Add a header: {inlineCode("x-api-key")} with your API key, and{" "}
                  {inlineCode("Content-Type: application/json")}.
                </li>
                <li>
                  In the body, map the trigger fields to the JSON structure. Example:
                </li>
              </ol>
              {codeBlock(`{
  "template_id": "your-template-uuid",
  "signer_email": "{{trigger_email}}",
  "signer_name": "{{trigger_name}}",
  "booking_id": "{{trigger_booking_id}}",
  "send_email": true,
  "payload": {
    "customer_name": "{{trigger_name}}",
    "date": "{{trigger_date}}"
  }
}`)}

              {/* Make / Integromat */}
              <h3 className="font-heading text-xl font-semibold mt-10 mb-3">Make (Integromat)</h3>
              <p className="text-muted-foreground mb-4">
                Make's visual scenario builder works similarly to Zapier. Use a Webhook module as the
                trigger and an HTTP module for the API call.
              </p>
              <ol className="list-decimal pl-6 text-sm text-muted-foreground space-y-2 mb-4">
                <li>
                  Create a new scenario. Add a <strong>Webhooks &rarr; Custom webhook</strong> module
                  as the trigger (or use your booking platform's native Make module).
                </li>
                <li>
                  Add an <strong>HTTP &rarr; Make a request</strong> module.
                </li>
                <li>
                  Set method to POST, URL to your Rental Waivers base URL +{" "}
                  {inlineCode("/envelopes")}.
                </li>
                <li>
                  Under Headers, add {inlineCode("x-api-key")} and{" "}
                  {inlineCode("Content-Type: application/json")}.
                </li>
                <li>
                  Set Body type to "Raw" and content type to "JSON (application/json)." Paste the
                  envelope JSON and map fields from the trigger module.
                </li>
                <li>
                  Turn on the scenario. Test it with a sample booking.
                </li>
              </ol>

              {/* Generic REST API */}
              <h3 className="font-heading text-xl font-semibold mt-10 mb-3">Generic REST API</h3>
              <p className="text-muted-foreground mb-4">
                Any platform that can make HTTP requests or fire webhooks can integrate with Rental
                Waivers. The pattern is always the same:
              </p>
              <ol className="list-decimal pl-6 text-sm text-muted-foreground space-y-2 mb-4">
                <li>Booking is created on your platform.</li>
                <li>
                  Your backend (or automation tool) calls{" "}
                  {inlineCode("POST /envelopes")} with the guest's info and your API key in the{" "}
                  {inlineCode("x-api-key")} header.
                </li>
                <li>
                  Rental Waivers sends the signing email (or you embed the{" "}
                  {inlineCode("signing_url")} yourself).
                </li>
                <li>Guest signs the waiver on any device.</li>
                <li>
                  Your webhook endpoint receives {inlineCode("envelope.completed")} and you update your
                  system.
                </li>
              </ol>
            </section>

            {/* ==================== CUSTOMER PORTAL ==================== */}
            <section id="customer-portal" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <UserCircle className="h-5 w-5" /> Customer Portal
              </h2>

              <p className="text-muted-foreground mb-4">
                The Customer Portal is a self-service page at{" "}
                {inlineCode("/my-waivers")} where signers can look up their own waivers. No login or
                account is needed.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">How It Works</h3>
              <ol className="list-decimal pl-6 text-sm text-muted-foreground space-y-2 mb-4">
                <li>
                  The signer visits the /my-waivers page and enters their email address.
                </li>
                <li>
                  Rental Waivers looks up all envelopes associated with that email across all
                  organizations.
                </li>
                <li>
                  The signer sees a list of their waivers with status (sent, signed, completed,
                  etc.), the template name, and the date.
                </li>
                <li>
                  They can open any completed waiver to view or download it as a PDF.
                </li>
              </ol>

              <Card className="bg-accent/30">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <strong>Privacy note:</strong> The portal only reveals waiver existence and status
                    to the email holder. No account creation or password is required, but the signer
                    must know the exact email address used when the waiver was sent.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* ==================== CREDITS & BILLING ==================== */}
            <section id="billing" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Credits & Billing
              </h2>

              <p className="text-muted-foreground mb-6">
                Rental Waivers uses a credit-based billing model. You purchase credits in packages and
                spend them as you send waivers. Larger packages have a lower per-waiver cost.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">How Credits Work</h3>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2 mb-6">
                <li>
                  <strong>1 credit = 1 signer on 1 envelope.</strong> When you send a waiver to one
                  person, 1 credit is deducted.
                </li>
                <li>
                  Credits are deducted at <strong>send time</strong>, not when the signer completes the
                  waiver.
                </li>
                <li>
                  If you cancel an envelope before the signer has signed, the credit is refunded.
                </li>
                <li>
                  For group waivers, 1 credit is consumed each time a person signs through the group
                  link.
                </li>
                <li>Credits never expire.</li>
              </ul>

              <h3 className="font-heading text-lg font-semibold mb-3">Credit Packages</h3>
              <div className="rounded-lg border overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-accent/50">
                      <th className="px-4 py-2 text-left font-medium">Package</th>
                      <th className="px-4 py-2 text-left font-medium">Credits</th>
                      <th className="px-4 py-2 text-left font-medium">Per Waiver</th>
                      <th className="px-4 py-2 text-left font-medium">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium">$20</td>
                      <td className="px-4 py-2">200</td>
                      <td className="px-4 py-2 text-muted-foreground">10c</td>
                      <td className="px-4 py-2 text-muted-foreground">--</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium">$50</td>
                      <td className="px-4 py-2">550</td>
                      <td className="px-4 py-2 text-muted-foreground">~9c</td>
                      <td className="px-4 py-2 text-muted-foreground">10%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium">$100</td>
                      <td className="px-4 py-2">1,250</td>
                      <td className="px-4 py-2 text-muted-foreground">8c</td>
                      <td className="px-4 py-2 text-muted-foreground">20%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium">$250</td>
                      <td className="px-4 py-2">3,500</td>
                      <td className="px-4 py-2 text-muted-foreground">~7c</td>
                      <td className="px-4 py-2 text-muted-foreground">29%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium">$500</td>
                      <td className="px-4 py-2">8,000</td>
                      <td className="px-4 py-2 text-muted-foreground">~6c</td>
                      <td className="px-4 py-2 text-muted-foreground">38%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-heading text-lg font-semibold mb-3">Overdraft Buffer</h3>
              <p className="text-muted-foreground mb-4">
                To prevent disruptions, we allow a small overdraft buffer of{" "}
                <strong>-10 credits</strong>. If your balance drops below zero (down to -10), waivers
                will still send. Once you hit -10, sends are paused until you purchase more credits.
                The overdraft is deducted from your next purchase.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Auto-Recharge</h3>
              <p className="text-muted-foreground mb-4">
                Enable auto-recharge in Settings &rarr; Billing to automatically purchase credits when
                your balance falls below a threshold you set. Choose any credit package and set a
                minimum balance trigger. Your saved payment method will be charged automatically.
              </p>
            </section>

            {/* ==================== API REFERENCE ==================== */}
            <section id="api-reference" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <Code className="h-5 w-5" /> API Reference
              </h2>

              <h3 className="font-heading text-lg font-semibold mb-3">Base URL</h3>
              <p className="text-muted-foreground mb-4">
                Your API base URL is your Supabase project's edge function URL:
              </p>
              {codeBlock(
                `https://<your-project-ref>.supabase.co/functions/v1/waiverflow-api`
              )}

              <h3 className="font-heading text-lg font-semibold mt-8 mb-3 flex items-center gap-2">
                <Key className="h-4 w-4" /> Authentication
              </h3>
              <p className="text-muted-foreground mb-4">
                All API requests require an API key passed in the{" "}
                {inlineCode("x-api-key")} header. Generate keys in Settings &rarr; API Keys. Keys are
                scoped to your organization.
              </p>
              {codeBlock(`curl -H "x-api-key: rw_live_your_api_key_here" \\
  https://<project>.supabase.co/functions/v1/waiverflow-api/envelopes`)}

              {/* POST /envelopes */}
              <h3 className="font-heading text-lg font-semibold mt-10 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> POST /envelopes
              </h3>
              <p className="text-muted-foreground mb-4">
                Create a new envelope, optionally send a signing email, and receive a signing link you
                can embed in your booking confirmation.
              </p>
              <div className="rounded-lg border overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-accent/50">
                      <th className="px-4 py-2 text-left font-medium">Field</th>
                      <th className="px-4 py-2 text-left font-medium">Type</th>
                      <th className="px-4 py-2 text-left font-medium">Required</th>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">template_id</td>
                      <td className="px-4 py-2">uuid</td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2 text-muted-foreground">Your waiver template ID</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">signer_email</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">Yes</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Email address of the signer
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">signer_name</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2 text-muted-foreground">Full name of the signer</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">booking_id</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Your booking/reservation ID
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">listing_id</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Your listing/property ID
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">host_id</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2 text-muted-foreground">Your host/owner ID</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">customer_id</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2 text-muted-foreground">Your customer/guest ID</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">payload</td>
                      <td className="px-4 py-2">object</td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Key-value pairs to fill template variables
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">send_email</td>
                      <td className="px-4 py-2">boolean</td>
                      <td className="px-4 py-2">No</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Send signing email (default: true)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-heading text-base font-semibold mb-3">Example Request</h4>
              {codeBlock(`curl -X POST \\
  https://<project>.supabase.co/functions/v1/waiverflow-api/envelopes \\
  -H "x-api-key: rw_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "your-template-uuid",
    "signer_email": "guest@example.com",
    "signer_name": "Jane Smith",
    "booking_id": "bk_abc123",
    "listing_id": "lst_pool_01",
    "send_email": true,
    "payload": {
      "customer_name": "Jane Smith",
      "date": "March 15, 2026",
      "time": "2:00 PM",
      "host_name": "Pool Paradise LLC",
      "address_redacted": "123 Pool Lane, Riverside, CA",
      "state": "California",
      "rules": "No diving. No glass. Children under 12 must be supervised."
    }
  }'`)}

              <h4 className="font-heading text-base font-semibold mt-6 mb-3">Example Response</h4>
              {codeBlock(`{
  "id": "envelope-uuid",
  "status": "sent",
  "signing_url": "https://rentalwaivers.com/sign/token-uuid",
  "signing_token": "token-uuid",
  "created_at": "2026-03-09T12:00:00Z",
  "email_sent": true
}`)}

              {/* GET /envelopes/:id */}
              <h3 className="font-heading text-lg font-semibold mt-10 mb-3">
                GET /envelopes/:id
              </h3>
              <p className="text-muted-foreground mb-4">
                Retrieve the current status and details of a single envelope.
              </p>
              {codeBlock(`curl https://<project>.supabase.co/functions/v1/waiverflow-api/envelopes/envelope-uuid \\
  -H "x-api-key: rw_live_your_key"`)}
              <p className="text-sm text-muted-foreground mt-4 mb-6">
                Status values: {inlineCode("draft")}, {inlineCode("sent")},{" "}
                {inlineCode("viewed")}, {inlineCode("signed")},{" "}
                {inlineCode("completed")}, {inlineCode("expired")},{" "}
                {inlineCode("canceled")}
              </p>

              {/* GET /envelopes */}
              <h3 className="font-heading text-lg font-semibold mt-10 mb-3">GET /envelopes</h3>
              <p className="text-muted-foreground mb-2">
                {inlineCode("GET /envelopes?page=1&page_size=20&status=completed")}
              </p>
              <p className="text-muted-foreground mb-4">
                Paginated list of all envelopes. Filter by status.
              </p>
              {codeBlock(`{
  "data": [...],
  "total": 42,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}`)}

              {/* POST /envelopes/:id/cancel */}
              <h3 className="font-heading text-lg font-semibold mt-10 mb-3">
                POST /envelopes/:id/cancel
              </h3>
              <p className="text-muted-foreground mb-4">
                Cancel a pending waiver. The signing link will show "canceled" to the signer. Credits
                are refunded for unsigned envelopes.
              </p>

              {/* GET /templates */}
              <h3 className="font-heading text-lg font-semibold mt-10 mb-3">GET /templates</h3>
              <p className="text-muted-foreground mb-2">
                {inlineCode("GET /templates?page=1&page_size=20")}
              </p>
              <p className="text-muted-foreground mb-4">
                Paginated list of your waiver templates. Use the template ID when creating envelopes.
              </p>
            </section>

            {/* ==================== WEBHOOKS ==================== */}
            <section id="webhooks" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <Webhook className="h-5 w-5" /> Webhooks
              </h2>

              <p className="text-muted-foreground mb-6">
                Configure webhook endpoints in Settings &rarr; Webhooks. When events occur, we POST a
                JSON payload to your URL with an HMAC-SHA256 signature for verification.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Events</h3>
              <div className="rounded-lg border overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-accent/50">
                      <th className="px-4 py-2 text-left font-medium">Event</th>
                      <th className="px-4 py-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">envelope.sent</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Waiver was sent to signer
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">envelope.viewed</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Signer opened the signing link
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-mono text-xs">envelope.completed</td>
                      <td className="px-4 py-2 text-muted-foreground">Waiver was signed</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">envelope.canceled</td>
                      <td className="px-4 py-2 text-muted-foreground">Waiver was canceled</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-heading text-lg font-semibold mb-3">Payload Format</h3>
              {codeBlock(`{
  "event": "envelope.completed",
  "data": {
    "id": "envelope-uuid",
    "status": "completed",
    "signer_email": "guest@example.com",
    "signer_name": "Jane Smith",
    "booking_id": "bk_abc123",
    "listing_id": "lst_pool_01",
    "template_id": "template-uuid",
    "signed_at": "2026-03-09T14:30:00Z",
    "signing_url": "https://rentalwaivers.com/sign/token-uuid"
  },
  "timestamp": "2026-03-09T14:30:00Z"
}`)}

              <h3 className="font-heading text-lg font-semibold mt-8 mb-3">
                HMAC-SHA256 Signature Verification
              </h3>
              <p className="text-muted-foreground mb-4">
                Every webhook request includes an{" "}
                {inlineCode("X-Webhook-Signature")} header containing an HMAC-SHA256 signature of the
                raw request body, computed with your webhook secret. Always verify this signature
                before processing the payload.
              </p>
              {codeBlock(`// Node.js verification example
const crypto = require('crypto');

function verifyWebhook(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return signature === \`sha256=\${expected}\`;
}

// In your Express webhook handler:
app.post('/webhooks/rental-waivers', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['x-webhook-signature'];
  const isValid = verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body);
  console.log('Received event:', event.event, event.data.id);

  // Process the event...
  switch (event.event) {
    case 'envelope.completed':
      // Update your booking system
      break;
    case 'envelope.canceled':
      // Handle cancellation
      break;
  }

  res.status(200).send('ok');
});`)}

              <Card className="mt-6 bg-accent/30">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <strong>Important:</strong> Always verify the signature using the raw request body
                    (before JSON parsing). Parsing and re-stringifying the body can change whitespace
                    and field ordering, causing signature mismatches.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* ==================== TEAM MANAGEMENT ==================== */}
            <section id="team" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="h-5 w-5" /> Team Management
              </h2>

              <p className="text-muted-foreground mb-6">
                Invite team members to collaborate on your organization's waivers. Each member is
                assigned a role that controls their permissions.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Inviting Members</h3>
              <p className="text-muted-foreground mb-4">
                Go to Settings &rarr; Team and click "Invite Member." Enter their email address and
                select a role. They'll receive an invitation email with a link to join your
                organization. If they don't have a Rental Waivers account yet, they'll be prompted to
                create one first.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">Roles</h3>
              <div className="rounded-lg border overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-accent/50">
                      <th className="px-4 py-2 text-left font-medium">Role</th>
                      <th className="px-4 py-2 text-left font-medium">Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium">Admin</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Full access: manage templates, send waivers, view all envelopes, manage team
                        members, manage billing, configure API keys and webhooks, access settings.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium">Host</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        Operational access: send waivers, view envelopes they created, use existing
                        templates. Cannot manage team, billing, API keys, or organization settings.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-muted-foreground">
                The organization creator is automatically an Admin. You can change a member's role or
                remove them from the Team settings page at any time.
              </p>
            </section>

            {/* ==================== FAQ ==================== */}
            <section id="faq" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <HelpCircle className="h-5 w-5" /> Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    Are electronic signatures legally binding?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes. Electronic signatures are legally binding in the United States under the
                    E-SIGN Act (2000) and the Uniform Electronic Transactions Act (UETA), adopted by
                    47 states. They are also recognized in the EU under eIDAS, in Canada under PIPEDA,
                    and in most other countries. A waiver signed electronically through Rental Waivers
                    carries the same legal weight as a paper signature.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    How do group waivers work?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A group waiver generates a single link that multiple people can access. Each person
                    enters their own name, email, and signature. Each submission creates a separate
                    completed envelope. This is ideal for pool parties, events, or vacation rental
                    check-ins where an entire group needs to sign.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    When are credits deducted?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Credits are deducted when a waiver is sent (1 credit per signer). For group
                    waivers, 1 credit is consumed when each person submits their signature. If you
                    cancel an envelope before it's signed, the credit is refunded to your balance.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    Which marketplace platforms are supported?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Rental Waivers works with any platform that supports webhooks or API calls. We have
                    specific guides for ShareTribe Flex, Bubble.io, Zapier, and Make (Integromat). Any
                    platform that can make an HTTP POST request can integrate -- including custom-built
                    marketplaces, WordPress with booking plugins, Webflow + Memberstack, and more.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    Can I customize templates?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Absolutely. You can edit every part of a template: the title, the body text, the
                    legal clauses, and the template variables. Start from one of the four presets (pool,
                    vacation rental, equipment, event) and customize it, or build from scratch. You can
                    create as many templates as you need.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    How long are signed waivers stored?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Signed waivers are stored indefinitely for as long as your organization account is
                    active. All waiver data, signatures, and audit trails are securely retained so you
                    can access them if a dispute arises, even years later.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    Is Rental Waivers HIPAA compliant?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Rental Waivers is designed for liability waivers in the rental and events industry,
                    not for healthcare. We do not currently offer HIPAA compliance or BAA agreements. If
                    your waivers involve protected health information (PHI), please consult with a
                    compliance specialist before using the platform.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    Can signers sign on mobile devices?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes. The signing experience is fully responsive and works on smartphones, tablets,
                    and desktop browsers. Signers can draw their signature with a finger on touchscreen
                    devices or type it on any device.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    What happens when I hit the overdraft limit?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your organization has a -10 credit overdraft buffer. If your balance drops below
                    zero, waivers continue to send until you reach -10. At -10, all sends are paused
                    until you purchase more credits. The negative balance is deducted from your next
                    credit purchase.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    How does auto-recharge work?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    In Settings &rarr; Billing, enable auto-recharge and choose a credit package and a
                    minimum balance threshold. When your balance falls below the threshold, the selected
                    package is automatically purchased using your saved payment method. You'll receive
                    an email confirmation each time auto-recharge fires.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    What are the API rate limits?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The API allows up to 100 requests per minute per API key. If you exceed this limit,
                    you'll receive a {inlineCode("429 Too Many Requests")} response with a{" "}
                    {inlineCode("Retry-After")} header indicating how many seconds to wait. For bulk
                    operations, use the bulk send feature instead of looping individual API calls.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    Can I get a refund on credit purchases?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Unused credits can be refunded within 30 days of purchase. Credits that have already
                    been spent on sent waivers are non-refundable. Contact support@rentalwaivers.com
                    for refund requests.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    Can I use multiple templates for different listing types?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes. There is no limit on the number of templates you can create. Many customers
                    create separate templates for different property types (pools vs. vacation homes),
                    different risk levels, or different jurisdictions with varying legal requirements.
                    When sending via the API, simply pass the appropriate {inlineCode("template_id")}.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    Can I download signed waivers as PDFs?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes. From the envelope detail page on the dashboard, click "Download PDF" to get a
                    PDF copy of the signed waiver. The PDF includes the signer's name, email,
                    signature, IP address, timestamp, and the full waiver text as it appeared at signing
                    time.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    How does the customer portal protect privacy?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The customer portal (/my-waivers) uses email-based lookup only. A visitor must
                    enter the exact email address that was used when the waiver was sent. No account
                    or password is required, and no waiver data is exposed until the correct email is
                    entered. The portal shows only the signer's own waivers, not those of other guests
                    or other organizations.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-base font-semibold mb-1">
                    What happens if a signer's email bounces?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    If the signing email bounces, the envelope remains in "sent" status but the signer
                    won't receive the link. You can copy the signing URL from the envelope detail page
                    and share it with the signer through another channel (text message, in-app message,
                    etc.). The credit is still consumed since the envelope was created.
                  </p>
                </div>
              </div>
            </section>

            {/* ==================== LEGAL ==================== */}
            <section id="legal" className="mb-20 scroll-mt-24">
              <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                <Scale className="h-5 w-5" /> Legal
              </h2>

              <p className="text-muted-foreground mb-6">
                Understanding the legal framework around electronic signatures and waivers helps you
                build enforceable agreements. Here's what you need to know.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">
                Electronic Signatures Are Legally Valid
              </h3>
              <p className="text-muted-foreground mb-4">
                In the United States, two key laws establish the legal validity of electronic
                signatures:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2 mb-6">
                <li>
                  <strong>The E-SIGN Act (2000):</strong> A federal law that gives electronic
                  signatures the same legal standing as handwritten signatures in interstate and
                  foreign commerce. It applies to all 50 states.
                </li>
                <li>
                  <strong>UETA (Uniform Electronic Transactions Act):</strong> A state-level law
                  adopted by 47 states, plus D.C. and the U.S. Virgin Islands. It confirms that
                  electronic records and signatures satisfy legal requirements for written signatures.
                  New York, Illinois, and Washington have their own equivalent statutes.
                </li>
              </ul>

              <h3 className="font-heading text-lg font-semibold mb-3">Clickwrap Agreements</h3>
              <p className="text-muted-foreground mb-4">
                Rental Waivers uses a clickwrap signing model: the signer is presented with the full
                waiver text, must scroll through it, and then affirmatively clicks to sign and accept.
                Courts have consistently upheld clickwrap agreements as enforceable, provided the signer
                had a reasonable opportunity to review the terms and took an affirmative action to
                agree.
              </p>

              <h3 className="font-heading text-lg font-semibold mb-3">
                What Makes a Waiver Enforceable
              </h3>
              <p className="text-muted-foreground mb-4">
                While enforceability depends on jurisdiction and specific facts, courts generally look
                for these elements:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2 mb-6">
                <li>
                  <strong>Clear and unambiguous language:</strong> The waiver must clearly describe the
                  risks being assumed and the rights being waived. Vague language is more likely to be
                  struck down.
                </li>
                <li>
                  <strong>Conspicuousness:</strong> The waiver must be presented prominently, not
                  buried in fine print. Rental Waivers displays the full text before signing.
                </li>
                <li>
                  <strong>Voluntary agreement:</strong> The signer must not be coerced. The clickwrap
                  model -- where the signer reviews and affirmatively accepts -- supports voluntariness.
                </li>
                <li>
                  <strong>Consideration:</strong> There must be something of value exchanged (e.g.,
                  access to the pool, use of the rental property).
                </li>
                <li>
                  <strong>No gross negligence or intentional misconduct:</strong> Waivers generally
                  cannot shield against gross negligence or willful misconduct in most jurisdictions.
                </li>
              </ul>

              <h3 className="font-heading text-lg font-semibold mb-3">Audit Trail</h3>
              <p className="text-muted-foreground mb-4">
                Every signed waiver in Rental Waivers includes a complete audit trail that strengthens
                enforceability. The audit trail records:
              </p>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2 mb-6">
                <li>The signer's full name and email address</li>
                <li>The IP address from which the waiver was signed</li>
                <li>The exact date and time of signing (UTC)</li>
                <li>
                  The template version used (so the exact text the signer agreed to is preserved)
                </li>
                <li>When the signing link was first opened (viewed timestamp)</li>
                <li>The user agent / browser used for signing</li>
                <li>The drawn or typed signature image</li>
              </ul>

              <Card className="bg-accent/30">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <strong>Disclaimer:</strong> Rental Waivers is a document signing platform, not a
                    law firm, and does not provide legal advice. The information in this section is for
                    general informational purposes only. Consult with a qualified attorney in your
                    jurisdiction for advice specific to your situation.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* ==================== CTA ==================== */}
            <section className="text-center py-12 rounded-xl border bg-accent/30 mb-8">
              <h2 className="font-heading text-2xl font-bold mb-3">Ready to get started?</h2>
              <p className="text-muted-foreground mb-6">
                Create your account, set up a template, and send your first waiver in under 5 minutes.
                Five free credits included.
              </p>
              <Link to={user ? "/dashboard" : "/login"}>
                <Button size="lg" className="gap-2">
                  {user ? "Go to Dashboard" : "Get Started Free"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </section>

            <p className="text-xs text-muted-foreground text-center mt-8">
              Rental Waivers is a document signing platform, not a law firm, and does not provide
              legal advice.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
