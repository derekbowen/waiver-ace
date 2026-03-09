import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { ArrowRight, Code, Webhook, Key, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const codeBlock = (code: string) => (
  <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 text-sm overflow-x-auto font-mono">
    <code>{code}</code>
  </pre>
);

export default function Docs() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Rental Waivers" className="h-8 w-8" />
            <span className="font-heading text-lg font-bold tracking-tight">Rental Waivers</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">API Docs</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard"><Button size="sm">Dashboard</Button></Link>
            ) : (
              <Link to="/login"><Button size="sm">Get Started</Button></Link>
            )}
          </div>
        </div>
      </header>

      <div className="container max-w-4xl pt-24 pb-16 px-4">
        <div className="animate-fade-in">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="font-heading text-4xl font-bold tracking-tight mb-4">API Documentation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Integrate Rental Waivers into your booking platform. Send waivers automatically when a booking is created, track signing status, and get notified via webhooks when waivers are signed.
            </p>
          </div>

          {/* Quick Start */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-6" id="quickstart">Quick Start</h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Create an account and set up your organization</p>
                  <p className="text-sm text-muted-foreground">Sign up at rentalwaivers.com and create your org in Settings.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Create a waiver template</p>
                  <p className="text-sm text-muted-foreground">Use one of the pre-built templates (pool, vacation rental, equipment, event) or create your own.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Generate an API key</p>
                  <p className="text-sm text-muted-foreground">Go to Settings → API Keys and create a key. Save it — you'll only see it once.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">4</div>
                <div>
                  <p className="font-medium">Send your first waiver via API</p>
                  <p className="text-sm text-muted-foreground">Make a POST request to create an envelope. The signer gets an email with a signing link.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2" id="auth">
              <Key className="h-5 w-5" /> Authentication
            </h2>
            <p className="text-muted-foreground mb-4">
              All API requests require an API key passed in the <code className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono">x-api-key</code> header.
            </p>
            {codeBlock(`curl -H "x-api-key: rw_live_your_api_key_here" \\
  https://your-project.supabase.co/functions/v1/waiverflow-api/envelopes`)}
          </section>

          {/* Base URL */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4">Base URL</h2>
            <p className="text-muted-foreground mb-4">
              Your API base URL is your Supabase project's edge function URL:
            </p>
            {codeBlock(`https://<your-project-ref>.supabase.co/functions/v1/waiverflow-api`)}
          </section>

          {/* Create Envelope */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2" id="create-envelope">
              <FileText className="h-5 w-5" /> Create Envelope
            </h2>
            <p className="text-muted-foreground mb-2">
              <code className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono">POST /envelopes</code>
            </p>
            <p className="text-muted-foreground mb-4">
              Creates a new envelope, optionally sends a signing email, and returns a signing link you can embed in your booking confirmation.
            </p>

            <h3 className="font-heading text-lg font-semibold mb-3">Request Body</h3>
            <div className="rounded-lg border overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-accent/50"><th className="px-4 py-2 text-left font-medium">Field</th><th className="px-4 py-2 text-left font-medium">Type</th><th className="px-4 py-2 text-left font-medium">Required</th><th className="px-4 py-2 text-left font-medium">Description</th></tr></thead>
                <tbody>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">template_id</td><td className="px-4 py-2">uuid</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2 text-muted-foreground">Your waiver template ID</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">signer_email</td><td className="px-4 py-2">string</td><td className="px-4 py-2">Yes</td><td className="px-4 py-2 text-muted-foreground">Email address of the signer</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">signer_name</td><td className="px-4 py-2">string</td><td className="px-4 py-2">No</td><td className="px-4 py-2 text-muted-foreground">Full name of the signer</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">booking_id</td><td className="px-4 py-2">string</td><td className="px-4 py-2">No</td><td className="px-4 py-2 text-muted-foreground">Your booking/reservation ID</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">listing_id</td><td className="px-4 py-2">string</td><td className="px-4 py-2">No</td><td className="px-4 py-2 text-muted-foreground">Your listing/property ID</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">host_id</td><td className="px-4 py-2">string</td><td className="px-4 py-2">No</td><td className="px-4 py-2 text-muted-foreground">Your host/owner ID</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">customer_id</td><td className="px-4 py-2">string</td><td className="px-4 py-2">No</td><td className="px-4 py-2 text-muted-foreground">Your customer/guest ID</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">payload</td><td className="px-4 py-2">object</td><td className="px-4 py-2">No</td><td className="px-4 py-2 text-muted-foreground">Key-value pairs to fill template variables</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">send_email</td><td className="px-4 py-2">boolean</td><td className="px-4 py-2">No</td><td className="px-4 py-2 text-muted-foreground">Send signing email (default: true)</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-heading text-lg font-semibold mb-3">Example</h3>
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

            <h3 className="font-heading text-lg font-semibold mt-6 mb-3">Response</h3>
            {codeBlock(`{
  "id": "envelope-uuid",
  "status": "sent",
  "signing_url": "https://rentalwaivers.com/sign/token-uuid",
  "signing_token": "token-uuid",
  "created_at": "2026-03-09T12:00:00Z",
  "email_sent": true
}`)}

            <Card className="mt-6 bg-accent/30">
              <CardContent className="pt-6">
                <p className="text-sm">
                  <strong>Tip for Sharetribe / booking platforms:</strong> Call this endpoint in your booking confirmation webhook. Include the <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">signing_url</code> in the booking confirmation email or page. Set <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">send_email: false</code> if you want to handle the email yourself.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Get Envelope */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4">Get Envelope Status</h2>
            <p className="text-muted-foreground mb-2">
              <code className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono">GET /envelopes/:id</code>
            </p>
            <p className="text-muted-foreground mb-4">Check whether a waiver has been signed.</p>
            {codeBlock(`curl https://<project>.supabase.co/functions/v1/waiverflow-api/envelopes/envelope-uuid \\
  -H "x-api-key: rw_live_your_key"`)}
            <p className="text-sm text-muted-foreground mt-4">
              Status values: <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">draft</code>, <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">sent</code>, <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">viewed</code>, <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">signed</code>, <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">completed</code>, <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">expired</code>, <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">canceled</code>
            </p>
          </section>

          {/* List Envelopes */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4">List Envelopes</h2>
            <p className="text-muted-foreground mb-2">
              <code className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono">GET /envelopes?page=1&page_size=20&status=completed</code>
            </p>
            <p className="text-muted-foreground mb-4">Paginated list of all envelopes. Filter by status.</p>
            {codeBlock(`{
  "data": [...],
  "total": 42,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}`)}
          </section>

          {/* Cancel Envelope */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4">Cancel Envelope</h2>
            <p className="text-muted-foreground mb-2">
              <code className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono">POST /envelopes/:id/cancel</code>
            </p>
            <p className="text-muted-foreground mb-4">Cancel a pending waiver. The signing link will show "canceled" to the signer.</p>
          </section>

          {/* List Templates */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4">List Templates</h2>
            <p className="text-muted-foreground mb-2">
              <code className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono">GET /templates?page=1&page_size=20</code>
            </p>
            <p className="text-muted-foreground mb-4">Paginated list of your waiver templates. Use the template ID when creating envelopes.</p>
          </section>

          {/* Webhooks */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2" id="webhooks">
              <Webhook className="h-5 w-5" /> Webhooks
            </h2>
            <p className="text-muted-foreground mb-4">
              Configure webhook endpoints in Settings → Webhooks. When events occur, we'll POST a JSON payload to your URL with an HMAC-SHA256 signature for verification.
            </p>

            <h3 className="font-heading text-lg font-semibold mb-3">Events</h3>
            <div className="rounded-lg border overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-accent/50"><th className="px-4 py-2 text-left font-medium">Event</th><th className="px-4 py-2 text-left font-medium">Description</th></tr></thead>
                <tbody>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">envelope.sent</td><td className="px-4 py-2 text-muted-foreground">Waiver was sent to signer</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">envelope.viewed</td><td className="px-4 py-2 text-muted-foreground">Signer opened the signing link</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-mono text-xs">envelope.completed</td><td className="px-4 py-2 text-muted-foreground">Waiver was signed</td></tr>
                  <tr><td className="px-4 py-2 font-mono text-xs">envelope.canceled</td><td className="px-4 py-2 text-muted-foreground">Waiver was canceled</td></tr>
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
    "booking_id": "bk_abc123"
  },
  "timestamp": "2026-03-09T14:30:00Z"
}`)}

            <h3 className="font-heading text-lg font-semibold mt-6 mb-3">Verifying Signatures</h3>
            <p className="text-muted-foreground mb-4">
              The <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">X-Webhook-Signature</code> header contains an HMAC-SHA256 signature of the request body using your webhook secret.
            </p>
            {codeBlock(`// Node.js verification example
const crypto = require('crypto');

function verifyWebhook(body, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return signature === \`sha256=\${expected}\`;
}

// In your webhook handler:
const sig = req.headers['x-webhook-signature'];
const isValid = verifyWebhook(JSON.stringify(req.body), sig, YOUR_WEBHOOK_SECRET);`)}
          </section>

          {/* Integration Examples */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2" id="integrations">
              <Code className="h-5 w-5" /> Integration Examples
            </h2>

            <h3 className="font-heading text-lg font-semibold mb-3">Sharetribe</h3>
            <p className="text-muted-foreground mb-4">
              If you're running a Sharetribe marketplace, call the Rental Waivers API from your transaction process webhook. When a booking is confirmed:
            </p>
            {codeBlock(`// Sharetribe transaction webhook handler (Node.js)
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

            <h3 className="font-heading text-lg font-semibold mt-8 mb-3">Zapier / Make</h3>
            <p className="text-muted-foreground mb-4">
              Use a Webhook action to POST to the Rental Waivers API. Map your booking data to the request body fields. No code required.
            </p>

            <h3 className="font-heading text-lg font-semibold mt-8 mb-3">Any Platform</h3>
            <p className="text-muted-foreground mb-4">
              The API is a standard REST API. If your booking platform supports webhooks or custom integrations, you can connect it. The flow is always the same:
            </p>
            <ol className="list-decimal pl-6 text-sm text-muted-foreground space-y-2 mb-4">
              <li>Booking is created on your platform</li>
              <li>Your backend calls <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">POST /envelopes</code> with the guest's info</li>
              <li>We send the signing email (or you embed the signing_url yourself)</li>
              <li>Guest signs the waiver</li>
              <li>Your webhook endpoint gets notified with <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">envelope.completed</code></li>
              <li>You update the booking status in your system</li>
            </ol>
          </section>

          {/* Rate Limits */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-4">Rate Limits & Pricing</h2>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-accent/50"><th className="px-4 py-2 text-left font-medium">Plan</th><th className="px-4 py-2 text-left font-medium">Waivers/Month</th><th className="px-4 py-2 text-left font-medium">Price</th></tr></thead>
                <tbody>
                  <tr className="border-b"><td className="px-4 py-2 font-medium">Free</td><td className="px-4 py-2">5</td><td className="px-4 py-2 text-muted-foreground">$0</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-medium">Starter</td><td className="px-4 py-2">15</td><td className="px-4 py-2 text-muted-foreground">$19/mo</td></tr>
                  <tr className="border-b"><td className="px-4 py-2 font-medium">Growth</td><td className="px-4 py-2">50</td><td className="px-4 py-2 text-muted-foreground">$49/mo</td></tr>
                  <tr><td className="px-4 py-2 font-medium">Business</td><td className="px-4 py-2">150</td><td className="px-4 py-2 text-muted-foreground">$99/mo</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              When you exceed your monthly limit, the API returns <code className="bg-accent px-1 py-0.5 rounded text-xs font-mono">429 Too Many Requests</code>.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-12 rounded-xl border bg-accent/30">
            <h2 className="font-heading text-2xl font-bold mb-3">Ready to integrate?</h2>
            <p className="text-muted-foreground mb-6">
              Create your account, grab an API key, and send your first waiver in under 5 minutes.
            </p>
            <Link to={user ? "/settings/api-keys" : "/login"}>
              <Button size="lg" className="gap-2">
                {user ? "Get Your API Key" : "Get Started"} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Rental Waivers is a document signing platform, not a law firm, and does not provide legal advice.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
