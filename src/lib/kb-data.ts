import { ReactNode } from "react";

export interface KbArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string; // lucide icon name
  content: string; // markdown-like content rendered as JSX in the article page
}

export interface KbCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string; // tailwind bg class token
}

export const KB_CATEGORIES: KbCategory[] = [
  { id: "getting-started", label: "Getting Started", icon: "BookOpen", description: "Set up your account and send your first waiver", color: "bg-primary/10 text-primary" },
  { id: "templates", label: "Templates", icon: "LayoutTemplate", description: "Create, customize, and version your waiver templates", color: "bg-blue-500/10 text-blue-600" },
  { id: "sending", label: "Sending Waivers", icon: "Send", description: "Manual, bulk, group, and kiosk sending methods", color: "bg-green-500/10 text-green-600" },
  { id: "integrations", label: "Integrations", icon: "Globe", description: "Connect to marketplaces, Zapier, Make, and more", color: "bg-orange-500/10 text-orange-600" },
  { id: "billing", label: "Credits & Billing", icon: "CreditCard", description: "Credit packages, auto-recharge, and overdraft", color: "bg-violet-500/10 text-violet-600" },
  { id: "api", label: "API Reference", icon: "Code", description: "REST API endpoints, authentication, and examples", color: "bg-cyan-500/10 text-cyan-600" },
  { id: "webhooks", label: "Webhooks", icon: "Webhook", description: "Real-time event notifications with HMAC signatures", color: "bg-rose-500/10 text-rose-600" },
  { id: "team", label: "Team & Roles", icon: "Users", description: "Invite members, assign roles, manage access", color: "bg-amber-500/10 text-amber-600" },
  { id: "tools", label: "AI Tools", icon: "Sparkles", description: "Contract Scanner, Listing Analyzer, Document Storage, and PhotoSell", color: "bg-pink-500/10 text-pink-600" },
  { id: "legal", label: "Legal & Compliance", icon: "Scale", description: "E-SIGN Act, UETA, audit trails, enforceability", color: "bg-emerald-500/10 text-emerald-600" },
];

export const KB_ARTICLES: KbArticle[] = [
  // ─── Getting Started ───
  {
    id: "quickstart",
    title: "Quickstart Guide",
    description: "Get up and running with Rental Waivers in under 5 minutes.",
    category: "getting-started",
    icon: "BookOpen",
    content: `
## Getting Started

Get up and running with Rental Waivers in under 5 minutes. Every new organization gets **250 free credits** so you can test the full flow before purchasing.

### Step 1 — Create your account
Sign up at rentalwaivers.com with your email. Verify your email to unlock all features.

### Step 2 — Create your organization
Go to Settings and create your organization. This is your workspace where templates, envelopes, and team members live. Give it a clear name (e.g., "Pool Paradise Rentals").

### Step 3 — Build your first waiver template
Pick a preset (pool, vacation rental, equipment, or event) or start from scratch. Templates support variables like \`{{customer_name}}\` and \`{{date}}\` that get filled in automatically.

### Step 4 — Send your first waiver
Enter a signer's email, fill in the template variables, and hit Send. The signer receives an email with a signing link. You'll see the status update in real time on your dashboard.

> **250 free credits:** Every new organization starts with 250 complimentary credits. Each credit covers one signer on one envelope.
    `,
  },
  {
    id: "account-setup",
    title: "Account & Organization Setup",
    description: "Create your org, configure settings, and upload your logo.",
    category: "getting-started",
    icon: "UserCircle",
    content: `
## Account & Organization Setup

### Creating Your Organization
After signing up and verifying your email, navigate to **Settings** to create your organization. Your org is the container for everything: templates, envelopes, team members, billing, and API keys.

### Organization Settings
- **Name:** Displayed to signers in emails and on the signing page.
- **Logo:** Upload your logo to brand the signing experience.
- **Retention:** Set how many years signed waivers are stored (default: 7 years).

### Your Profile
Your profile stores your name and email. This is separate from the organization — one person can be a member of multiple organizations in the future.
    `,
  },

  // ─── Templates ───
  {
    id: "creating-templates",
    title: "Creating Templates",
    description: "Build waiver templates from presets or from scratch.",
    category: "templates",
    icon: "LayoutTemplate",
    content: `
## Creating Templates

Navigate to **Templates** in the sidebar and click "New Template." You can start from one of four preset categories or create a blank template.

### Preset Templates

| Preset | Covers |
|--------|--------|
| **Pool Waiver** | Pool safety rules, drowning risk, supervision requirements, liability release |
| **Vacation Rental** | Property damage liability, house rules, occupancy limits, guest conduct |
| **Equipment Rental** | Equipment condition, damage liability, proper usage, return terms |
| **Event Waiver** | Injury risk, photo/video release, conduct expectations, liability release |

### Custom Templates
Start from scratch and write your own legal language. Use the rich text editor to format headings, lists, and paragraphs.
    `,
  },
  {
    id: "template-variables",
    title: "Template Variables",
    description: "Use dynamic placeholders like {{customer_name}} in your templates.",
    category: "templates",
    icon: "FileText",
    content: `
## Template Variables

Use double-curly-brace placeholders in your template body. These are replaced with real values when you send a waiver.

### Built-in Variables

| Variable | Example Value |
|----------|---------------|
| \`{{customer_name}}\` | Jane Smith |
| \`{{date}}\` | March 15, 2026 |
| \`{{time}}\` | 2:00 PM |
| \`{{host_name}}\` | Pool Paradise LLC |
| \`{{address}}\` | 123 Pool Lane, Riverside, CA |
| \`{{state}}\` | California |
| \`{{rules}}\` | No diving. No glass. Children under 12 must be supervised. |

### Custom Variables
Add any custom variable using the \`{{variable_name}}\` syntax. Provide the value when sending via dashboard or API.

### Template Versioning
Every save creates a new version. Previously sent waivers always reference the version they were sent with — updating a template never changes signed documents.
    `,
  },

  // ─── Sending ───
  {
    id: "manual-send",
    title: "Sending a Waiver Manually",
    description: "Send a waiver to one person from the dashboard.",
    category: "sending",
    icon: "Send",
    content: `
## Manual Send

From the dashboard, click **"New Envelope"**, select a template, enter the signer's name and email, fill in any template variables, and hit Send.

The signer receives an email with a secure signing link. One credit is deducted per signer at send time.

### What happens next
1. Signer opens the email and clicks the signing link
2. Status updates to **"viewed"** in real time on your dashboard
3. Signer reads the waiver, enters their name, draws their signature, and submits
4. Status updates to **"completed"** — you'll see the signature, timestamp, and IP address
    `,
  },
  {
    id: "bulk-send",
    title: "Bulk Send via CSV",
    description: "Send waivers to many people at once using a CSV file.",
    category: "sending",
    icon: "Users",
    content: `
## Bulk Send

Upload a CSV file with columns for signer email, signer name, and any template variables. Rental Waivers creates one envelope per row and sends all signing emails at once.

### CSV Format
Your CSV should have headers matching your template variables:

\`\`\`
signer_email,signer_name,customer_name,date
jane@example.com,Jane Smith,Jane Smith,March 15 2026
bob@example.com,Bob Jones,Bob Jones,March 16 2026
\`\`\`

Credits are deducted for each signer in the batch.
    `,
  },
  {
    id: "group-waivers",
    title: "Group Waivers",
    description: "One shareable link for an entire party to sign individually.",
    category: "sending",
    icon: "Users",
    content: `
## Group Waivers

Group waivers generate a single link that multiple people can use to sign the same waiver. Perfect for events, pool parties, or vacation rental check-ins.

### How it works
1. Create a new envelope and toggle **"Group Waiver"** on
2. Give it a label (e.g., "Smith Family Pool Party")
3. Share the link via text message, email, or QR code
4. Each person opens the link and signs with their own name and signature
5. Each submission creates a separate completed record
6. **1 credit consumed per person** who signs

> **Tip:** No email addresses needed upfront — money keeps flowing at checkout while guests sign at their own pace.
    `,
  },
  {
    id: "kiosk-mode",
    title: "QR Code Kiosk Mode",
    description: "Print a QR code for on-site walk-up signing at check-in desks.",
    category: "sending",
    icon: "QrCode",
    content: `
## QR Code Kiosk Mode

Generate a QR code for any template. Print it and place it at your check-in desk. Guests scan it with their phone and sign on the spot.

### Setup
1. Go to **Templates** and click **"Kiosk QR Code"**
2. Select a template from the dropdown
3. Download the QR code as a PNG
4. Print and display at your check-in area

### How guests use it
1. Guest scans the QR code with their phone camera
2. They see your organization name and template name
3. They tap **"Start Signing"** to read and sign the waiver
4. One credit is deducted per sign

> **Best for:** Walk-in guests, events with no pre-booked guest list, check-in desks without staff computers.
    `,
  },

  // ─── Integrations ───
  {
    id: "sharetribe-integration",
    title: "ShareTribe Integration",
    description: "Auto-send waivers when a ShareTribe booking is confirmed.",
    category: "integrations",
    icon: "Globe",
    content: `
## ShareTribe Flex Integration

ShareTribe Flex supports custom transaction process webhooks. Fire a waiver automatically when a booking transitions to "confirmed."

### Steps
1. In your Sharetribe backend, add a webhook handler for the \`transition/confirm-payment\` transition
2. Generate an API key in Rental Waivers under **Settings → API Keys**
3. Call \`POST /envelopes\` with the guest's email, name, booking ID, and template variables
4. Optionally set \`send_email: false\` and embed the \`signing_url\` in your confirmation page
5. Configure a webhook to receive \`envelope.completed\` and update the transaction status

\`\`\`javascript
// Sharetribe webhook handler (Node.js)
app.post('/webhooks/sharetribe', async (req, res) => {
  const { transaction } = req.body;
  if (transaction.attributes.lastTransition === 'transition/confirm-payment') {
    const response = await fetch(API_URL + '/envelopes', {
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
        send_email: true,
      }),
    });
  }
  res.status(200).send('ok');
});
\`\`\`
    `,
  },
  {
    id: "bubble-integration",
    title: "Bubble.io Integration",
    description: "Connect Rental Waivers to Bubble using the API Connector plugin.",
    category: "integrations",
    icon: "Globe",
    content: `
## Bubble.io Integration

Bubble's API Connector plugin lets you call the Rental Waivers API without writing code.

### Steps
1. Install the **API Connector** plugin from the Bubble marketplace
2. Add a new API called "Rental Waivers" — set authentication to "Private key in header" with header \`x-api-key\`
3. Create a call named "Send Waiver" — POST to your base URL + \`/envelopes\`
4. In your booking workflow, add the "Send Waiver" action after payment
5. Use Bubble's Backend Workflows for webhook callbacks (requires paid plan)
    `,
  },
  {
    id: "zapier-integration",
    title: "Zapier Integration",
    description: "Connect any booking app to Rental Waivers with a two-step Zap.",
    category: "integrations",
    icon: "Globe",
    content: `
## Zapier Integration

Connect any booking app to Rental Waivers with a two-step Zap. No code required.

### Steps
1. **Trigger:** Choose your booking platform (Calendly, Acuity, or generic Webhook)
2. **Action:** "Webhooks by Zapier" → "Custom Request" → POST
3. Set the URL to your API base URL + \`/envelopes\`
4. Add headers: \`x-api-key\` and \`Content-Type: application/json\`
5. Map trigger fields to the JSON body:

\`\`\`json
{
  "template_id": "your-template-uuid",
  "signer_email": "{{trigger_email}}",
  "signer_name": "{{trigger_name}}",
  "booking_id": "{{trigger_booking_id}}",
  "send_email": true
}
\`\`\`
    `,
  },
  {
    id: "make-integration",
    title: "Make (Integromat) Integration",
    description: "Visual automation scenarios to send waivers on booking events.",
    category: "integrations",
    icon: "Globe",
    content: `
## Make (Integromat) Integration

Make's visual scenario builder works similarly to Zapier.

### Steps
1. Create a new scenario with a **Webhooks → Custom webhook** trigger
2. Add an **HTTP → Make a request** module
3. Set method to POST, URL to your base URL + \`/envelopes\`
4. Add headers: \`x-api-key\` and \`Content-Type: application/json\`
5. Set Body type to "Raw" / JSON and map fields from the trigger
6. Turn on the scenario and test with a sample booking
    `,
  },
  {
    id: "generic-api-integration",
    title: "Generic REST API",
    description: "Any platform that can make HTTP requests can integrate.",
    category: "integrations",
    icon: "Code",
    content: `
## Generic REST API Integration

Any platform that can make HTTP requests or fire webhooks can integrate with Rental Waivers. The pattern is always the same:

1. Booking is created on your platform
2. Your backend calls \`POST /envelopes\` with the guest's info and your API key
3. Rental Waivers sends the signing email (or you embed the \`signing_url\` yourself)
4. Guest signs the waiver on any device
5. Your webhook endpoint receives \`envelope.completed\` and you update your system
    `,
  },

  // ─── Billing ───
  {
    id: "how-credits-work",
    title: "How Credits Work",
    description: "1 credit = 1 signer. No monthly fees, no subscriptions.",
    category: "billing",
    icon: "CreditCard",
    content: `
## How Credits Work

- **1 credit = 1 signer on 1 envelope.** When you send a waiver, 1 credit is deducted.
- Credits are deducted at **send time**, not when the signer completes the waiver.
- If you cancel an envelope before signing, the credit is **refunded**.
- For group waivers, 1 credit is consumed each time a person signs through the group link.
- **Credits never expire.**

### Credit Packages

| Package | Credits | Per Waiver | Savings |
|---------|---------|------------|---------|
| $20 | 200 | 10¢ | — |
| $50 | 550 | ~9¢ | 10% |
| $100 | 1,250 | 8¢ | 20% |
| $250 | 3,500 | ~7¢ | 29% |
| $500 | 8,000 | ~6¢ | 38% |
    `,
  },
  {
    id: "auto-recharge",
    title: "Auto-Recharge",
    description: "Automatically purchase credits when your balance is low.",
    category: "billing",
    icon: "CreditCard",
    content: `
## Auto-Recharge

Enable auto-recharge in **Settings → Billing** to never run out of credits.

### How it works
1. Choose a credit package (e.g., $50 for 550 credits)
2. Set a minimum balance threshold (e.g., 10 credits)
3. Save your payment method
4. When your balance falls below the threshold, the package is purchased automatically
5. You'll receive an email confirmation each time

### Overdraft Buffer
To prevent disruptions, there's a **-10 credit overdraft buffer**. If your balance drops below zero (down to -10), waivers still send. At -10, sends are paused until you purchase more credits. The overdraft is deducted from your next purchase.
    `,
  },

  // ─── API ───
  {
    id: "api-authentication",
    title: "API Authentication",
    description: "Generate API keys and authenticate requests.",
    category: "api",
    icon: "Key",
    content: `
## API Authentication

All API requests require an API key passed in the \`x-api-key\` header.

### Generating an API Key
1. Go to **Settings → API Keys**
2. Click **"Create API Key"**
3. Give it a descriptive name (e.g., "Production Sharetribe")
4. Copy the key immediately — it won't be shown again

### Using the Key
\`\`\`bash
curl -H "x-api-key: rw_live_your_key" \\
  https://your-project.supabase.co/functions/v1/waiverflow-api/envelopes
\`\`\`

### Rate Limits
- **100 requests per minute** per API key
- Exceeding returns \`429 Too Many Requests\` with a \`Retry-After\` header
- For bulk operations, use the bulk send feature instead of looping API calls
    `,
  },
  {
    id: "api-create-envelope",
    title: "POST /envelopes — Create Envelope",
    description: "Create and send a waiver via the REST API.",
    category: "api",
    icon: "Code",
    content: `
## POST /envelopes

Create a new envelope and optionally send the signing email.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`template_id\` | uuid | Yes | Template to use |
| \`signer_email\` | string | Yes | Signer's email |
| \`signer_name\` | string | No | Signer's full name |
| \`booking_id\` | string | No | Your booking ID |
| \`listing_id\` | string | No | Your listing ID |
| \`host_id\` | string | No | Your host/owner ID |
| \`customer_id\` | string | No | Your customer ID |
| \`payload\` | object | No | Template variable values |
| \`send_email\` | boolean | No | Send signing email (default: true) |

### Example Request
\`\`\`bash
curl -X POST \\
  https://your-project.supabase.co/functions/v1/waiverflow-api/envelopes \\
  -H "x-api-key: rw_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "your-template-uuid",
    "signer_email": "guest@example.com",
    "signer_name": "Jane Smith",
    "send_email": true,
    "payload": {
      "customer_name": "Jane Smith",
      "date": "March 15, 2026"
    }
  }'
\`\`\`

### Response
\`\`\`json
{
  "id": "envelope-uuid",
  "status": "sent",
  "signing_url": "https://rentalwaivers.com/sign/token-uuid",
  "signing_token": "token-uuid",
  "created_at": "2026-03-09T12:00:00Z",
  "email_sent": true
}
\`\`\`
    `,
  },
  {
    id: "api-other-endpoints",
    title: "GET & Cancel Endpoints",
    description: "List envelopes, get status, cancel, and list templates.",
    category: "api",
    icon: "Code",
    content: `
## Other API Endpoints

### GET /envelopes/:id
Retrieve the current status and details of a single envelope.

\`\`\`bash
curl https://your-project.supabase.co/functions/v1/waiverflow-api/envelopes/envelope-uuid \\
  -H "x-api-key: rw_live_your_key"
\`\`\`

Status values: \`draft\`, \`sent\`, \`viewed\`, \`signed\`, \`completed\`, \`expired\`, \`canceled\`

### GET /envelopes
Paginated list of all envelopes. Filter by status.

\`\`\`
GET /envelopes?page=1&page_size=20&status=completed
\`\`\`

### POST /envelopes/:id/cancel
Cancel a pending waiver. Credits are refunded for unsigned envelopes.

### GET /templates
Paginated list of your waiver templates. Use the template ID when creating envelopes.

\`\`\`
GET /templates?page=1&page_size=20
\`\`\`
    `,
  },

  // ─── Webhooks ───
  {
    id: "webhook-setup",
    title: "Webhook Setup",
    description: "Configure endpoints and subscribe to envelope events.",
    category: "webhooks",
    icon: "Webhook",
    content: `
## Webhook Setup

Configure webhook endpoints in **Settings → Webhooks**. When events occur, we POST a JSON payload to your URL.

### Events

| Event | Description |
|-------|-------------|
| \`envelope.sent\` | Waiver was sent to signer |
| \`envelope.viewed\` | Signer opened the signing link |
| \`envelope.completed\` | Waiver was signed |
| \`envelope.canceled\` | Waiver was canceled |

### Payload Format
\`\`\`json
{
  "event": "envelope.completed",
  "data": {
    "id": "envelope-uuid",
    "status": "completed",
    "signer_email": "guest@example.com",
    "signed_at": "2026-03-09T14:30:00Z"
  },
  "timestamp": "2026-03-09T14:30:00Z"
}
\`\`\`
    `,
  },
  {
    id: "webhook-verification",
    title: "Signature Verification",
    description: "Verify HMAC-SHA256 webhook signatures for security.",
    category: "webhooks",
    icon: "Key",
    content: `
## HMAC-SHA256 Signature Verification

Every webhook includes an \`X-Webhook-Signature\` header with an HMAC-SHA256 signature. Always verify before processing.

\`\`\`javascript
const crypto = require('crypto');

function verifyWebhook(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return signature === \\\`sha256=\\\${expected}\\\`;
}

app.post('/webhooks/rental-waivers', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['x-webhook-signature'];
  if (!verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const event = JSON.parse(req.body);
  // Process event...
  res.status(200).send('ok');
});
\`\`\`

> **Important:** Always verify using the raw request body (before JSON parsing). Re-stringifying can change whitespace and cause mismatches.
    `,
  },

  // ─── Team ───
  {
    id: "team-management",
    title: "Team Members & Roles",
    description: "Invite members and assign Admin or Host roles.",
    category: "team",
    icon: "Users",
    content: `
## Team Management

Invite team members to collaborate on your organization's waivers.

### Inviting Members
Go to **Settings → Team** and click "Invite Member." Enter their email and select a role. They'll receive an invitation email.

### Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: templates, waivers, billing, API keys, webhooks, team, settings |
| **Host** | Operational: send waivers, view own envelopes, use existing templates. No billing or settings access |

The organization creator is automatically an Admin. Change roles anytime from the Team settings page.
    `,
  },
  {
    id: "customer-portal",
    title: "Customer Portal",
    description: "Self-service waiver lookup for signers at /my-waivers.",
    category: "team",
    icon: "UserCircle",
    content: `
## Customer Portal

The Customer Portal at \`/my-waivers\` lets signers look up their own waivers without logging in.

### How It Works
1. Signer visits /my-waivers and enters their email address
2. Rental Waivers looks up all envelopes for that email
3. They see status, template name, and date for each waiver
4. They can view or download completed waivers as PDF

> **Privacy:** Only the exact email used when the waiver was sent will show results. No account or password required.
    `,
  },

  // ─── Legal ───
  {
    id: "legal-validity",
    title: "Are Electronic Signatures Legal?",
    description: "E-SIGN Act, UETA, and international recognition.",
    category: "legal",
    icon: "Scale",
    content: `
## Electronic Signature Legality

Yes. Electronic signatures are legally binding under:

- **E-SIGN Act (2000):** Federal law giving electronic signatures the same standing as handwritten signatures in interstate and foreign commerce.
- **UETA:** State-level law adopted by 47 states, plus D.C. Confirms electronic records satisfy legal requirements.
- **eIDAS (EU):** Recognized across all EU member states.
- **International:** Recognized in Canada (PIPEDA), Australia, and most other countries.

A waiver signed electronically through Rental Waivers carries the same legal weight as a paper signature.
    `,
  },
  {
    id: "enforceability",
    title: "What Makes a Waiver Enforceable",
    description: "Clear language, conspicuousness, voluntary agreement, and audit trails.",
    category: "legal",
    icon: "Scale",
    content: `
## Waiver Enforceability

Courts generally look for these elements:

- **Clear and unambiguous language:** The waiver must clearly describe risks and rights being waived.
- **Conspicuousness:** Must be presented prominently, not buried in fine print.
- **Voluntary agreement:** The signer must not be coerced. The clickwrap model supports this.
- **Consideration:** Something of value must be exchanged (e.g., access to the pool).
- **No gross negligence:** Waivers generally can't shield against gross negligence or willful misconduct.

### Audit Trail
Every signed waiver includes a complete audit trail:
- Signer's full name and email
- IP address at signing
- Exact date and time (UTC)
- Template version used (exact text preserved)
- When the signing link was first opened
- Browser/user agent
- Drawn or typed signature

> **Disclaimer:** Rental Waivers is a document signing platform, not a law firm. Consult a qualified attorney for advice specific to your situation.
    `,
  },
];
