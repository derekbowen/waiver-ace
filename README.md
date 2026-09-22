# Rental waivers

Build a cloud-based “DocuSign-style” e-signature web app for a marketplace that needs **liability waivers** signed before pool bookings can be confirmed.

PRODUCT NAME
- WaiverFlow (working name)

PRIMARY GOAL
- Generate a waiver from a template + booking data, send to signer, collect **legally-valid e-signature + audit trail**, store signed PDF, and expose **webhooks + API** so our booking system (Sharetribe/custom) can enforce “no signature = no confirmation.”

CORE ROLES
- Admin (creates templates, manages org settings, sees all envelopes)
- Host (can view waivers for their listings only)
- Customer/Signer (signs waiver)
- Optional: Co-signer/Guardian

MVP FEATURES (must ship)
1) Templates
- Template builder with variables: {{customer_name}}, {{booking_id}}, {{listing_id}}, {{date}}, {{time}}, {{host_name}}, {{address_redacted}}, {{rules}}, {{state}}
- WYSIWYG editor (rich text) + ability to upload an existing PDF and place fields on it
- Versioning (template v1, v2) and “active template”

2) Envelope / Signing Flow
- Create “Envelope” from template + payload (booking data)
- Fields supported:
  - Full legal name (typed) + signature draw/type
  - Initials
  - Date signed (auto)
  - Checkbox consent: “I agree to electronic signing”
  - Optional: DOB, Guardian name/signature if minor (toggle)
- Audit trail captured:
  - UTC timestamp, IP address, user agent, email, phone (optional), envelope id, template version
- Email/SMS delivery:
  - Send signing link via email (MVP)
  - SMS is optional if fast
- Status lifecycle:
  - draft → sent → viewed → signed → completed
  - expired, canceled
- Reminders:
  - Auto-remind after 2 hours and 24 hours (configurable)

3) PDF Generation + Storage
- Generate finalized PDF + certificate page (audit trail summary)
- Store PDFs in S3-compatible storage (AWS S3) with private ACL
- Store metadata in DB: file URL/key, checksum/hash, signed_at
- Admin download + view

4) API + Webhooks (required)
- REST API with API key auth (admin key) + per-org keys
Endpoints:
  - POST /api/envelopes (create envelope from template + payload, returns signing_url)
  - GET /api/envelopes/:id (status)
  - POST /api/envelopes/:id/cancel
  - POST /api/templates
  - GET /api/templates
Webhooks:
  - envelope.sent
  - envelope.viewed
  - envelope.signed
  - envelope.completed
  - envelope.expired
Webhook security:
  - HMAC signature header + timestamp to prevent replay

5) Admin Dashboard
- Templates list + editor
- Envelopes table with filters: status, date range, listing_id, booking_id
- Envelope detail page:
  - status timeline
  - signer info
  - PDF preview + download
  - resend link
- Settings:
  - org name, logo
  - email sender domain settings (basic)
  - webhook URLs + secret
  - retention policy: keep PDFs for X years

NON-FUNCTIONAL REQUIREMENTS
- Cloud hosted, multi-tenant (org_id)
- Responsive UI
- Secure:
  - HTTPS only
  - JWT sessions for dashboard
  - Rate limiting on signing link + API
  - Encrypt secrets in env vars
- Reliability:
  - Queue for PDF generation + email sending (background jobs)
  - Retry webhooks with exponential backoff
- Logging:
  - Event log table for every envelope state transition

TECH STACK (use sensible defaults)
- Frontend: Next.js + Tailwind + shadcn/ui
- Backend: Node/Next API routes OR Express
- DB: Postgres (Supabase acceptable)
- Storage: AWS S3
- Email: Resend or SendGrid
- Auth: Supabase Auth or NextAuth
- Background jobs: BullMQ + Redis OR Supabase cron + queue equivalent

SIGNING UX
- Signing link opens a clean, mobile-first signing page:
  - show waiver text/PDF
  - scroll-to-end required before signing enabled (toggleable)
  - signer completes required fields
  - “Finish & Submit” → confirmation screen + email receipt
- Prevent tampering:
  - Once sent, template snapshot is locked to envelope
  - PDF hash stored

INTEGRATION NOTES (must be built in)
- The envelope payload includes:
  - booking_id, listing_id, host_id, customer_id, start_time, end_time, city, state
- Provide a “Zapier-friendly” webhook receiver:
  - allow a simple webhook URL to receive events in JSON

PAGES TO BUILD
- Landing (simple)
- Login
- Admin Dashboard
- Templates (list, create/edit)
- Envelopes (list, detail)
- Signing Page (/sign/:token)
- API Keys + Webhooks settings

ACCEPTANCE CRITERIA (demo checklist)
- Admin creates a waiver template with variables
- System creates an envelope via API and returns signing URL
- Customer signs
- Status updates to completed
- Signed PDF is generated + stored in S3
- Webhook fires “envelope.completed” with booking_id + envelope_id + pdf_url (or storage key)
- Admin can view + download signed PDF

DESIGN STYLE
- Minimal, enterprise clean, white background, sharp typography, feels like real software.

Build the full app end-to-end with working database schema, API routes, webhook signing, and a production-ready UI.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rentalwaivers.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1b3e1963-e6dd-4bb3-ab5a-12ea2d6aacc2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
