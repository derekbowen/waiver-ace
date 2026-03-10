# RentalWaivers — Technical Overview

## What It Is

RentalWaivers is a B2B SaaS platform that automates liability waiver collection for rental, event, and service marketplaces. It generates waivers from templates, collects legally-valid e-signatures with full audit trails, and optionally requires signing before booking confirmation — all via API, webhooks, and direct marketplace integrations.

**Target customers:** Marketplace operators using Sharetribe, Arcadier, or custom-built platforms who need liability waivers signed before or during bookings.

---

## Core Value Proposition

| Problem | Solution |
|---------|----------|
| Marketplace operators manually send PDFs or use generic e-sign tools | Purpose-built waiver automation that plugs directly into marketplace booking flows |
| No audit trail for liability protection | Full audit trail: timestamps, IP addresses, user agents, event timeline |
| No way to require signing before booking confirmation | Toggle "require signing" per template; webhook fires on completion so marketplace can confirm booking |
| Expensive per-signature pricing from DocuSign/HelloSign | Usage-based pricing starting at $0/mo (5 waivers free), $0.75/waiver overage |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)               │
│  Landing · Login · Dashboard · Templates · Envelopes         │
│  Settings · API Keys · Webhooks · Integrations · Pricing     │
│  Signing Page (public, no auth required)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                         │
│                                                               │
│  Database (PostgreSQL)                                        │
│  ├── organizations       — multi-tenant isolation             │
│  ├── profiles            — user accounts linked to orgs       │
│  ├── user_roles          — RBAC (admin, host, customer)       │
│  ├── templates           — waiver templates per org           │
│  ├── template_versions   — versioned content with variables   │
│  ├── envelopes           — individual waiver instances        │
│  ├── envelope_events     — full audit trail per envelope      │
│  ├── api_keys            — SHA-256 hashed API keys            │
│  ├── webhook_endpoints   — customer webhook URLs              │
│  ├── webhook_deliveries  — delivery logs with responses       │
│  └── integration_configs — Sharetribe/Arcadier credentials    │
│                                                               │
│  Edge Functions (Deno)                                        │
│  ├── setup-organization  — org creation + admin role assign   │
│  ├── check-subscription  — Stripe subscription sync + usage   │
│  ├── create-checkout     — Stripe Checkout session            │
│  ├── customer-portal     — Stripe Customer Portal             │
│  ├── send-signing-email  — Resend transactional email         │
│  ├── rentalwaivers-api      — REST API for programmatic access   │
│  └── sharetribe-poller   — polls Sharetribe for new bookings  │
│                                                               │
│  Auth: Supabase Auth (email/password + Google + Apple OAuth)  │
│  RLS: Row-Level Security on all tables (org-level isolation)  │
└─────────────────────────────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      Stripe      Resend     Sharetribe
   (payments)    (email)    (marketplace)
```

---

## How It Works (End-to-End Flow)

1. **Admin signs up** → creates organization → gets admin role
2. **Admin creates a waiver template** with dynamic variables (`{{customer_name}}`, `{{booking_id}}`, etc.)
3. **Waiver is triggered** one of three ways:
   - **Manual:** Admin creates envelope from dashboard, selects template + signer email
   - **API:** External system calls `POST /envelopes` with API key
   - **Integration:** Sharetribe poller detects new booking, auto-creates envelope
4. **Signer receives email** with signing link (via Resend)
5. **Signer opens link** → views waiver with variables filled in → draws/types signature → submits
6. **Envelope marked completed** → audit event logged → webhook fires to marketplace
7. **Marketplace receives webhook** → can confirm booking based on `booking_id`

---

## Product Features

### Template System
- Rich text waiver templates with `{{variable}}` placeholders
- 10 built-in variables: customer_name, booking_id, listing_id, date, time, provider_name, location, rules, state, activity_type
- Template versioning (each version immutable, envelopes reference specific version)
- Toggle "require signing before booking confirmation" per template

### E-Signature Collection
- Public signing page (no account required for signer)
- Two signature modes: **draw** (canvas) or **type** (rendered as cursive)
- Scroll-to-end requirement before signing fields unlock
- Full name + initials + checkbox consent
- Signature data stored as JSON (includes image data URL for drawn signatures)

### Audit Trail
- Every envelope has a full event timeline:
  - `envelope.sent` — created and email sent
  - `envelope.viewed` — signer opened the link
  - `envelope.completed` — signer submitted signature
  - `envelope.expired` — signing link expired (7-day default)
  - `envelope.canceled` — admin canceled
- Each event records: timestamp, IP address, user agent
- Signed envelopes store: full name, initials, signature image, consent flag, signing timestamp

### REST API
- **Authentication:** SHA-256 hashed API keys with `wf_` prefix
- **Rate limiting:** 60 requests/minute per key
- **Endpoints:**
  - `POST /envelopes` — create + optionally send email
  - `GET /envelopes/:id` — check status
  - `POST /envelopes/:id/cancel` — cancel envelope
  - `GET /templates` — list org templates
- Returns signing URL + token for custom email flows

### Webhooks
- HMAC-SHA256 signed payloads
- Configurable event types per endpoint
- Delivery logging with response status + body
- Secret displayed once on creation

### Marketplace Integrations
- **Sharetribe:** Polls Integration API for `transaction/initiated` events, auto-creates envelopes
- **Arcadier:** Config UI ready (API key + secret)
- **Custom:** Use REST API directly
- Event cursor tracking to prevent duplicate processing

### Billing (Stripe)
| Plan | Price | Waivers/mo | Key Features |
|------|-------|------------|--------------|
| Free | $0 | 5 | 1 template, basic audit trail |
| Starter | $9 | 15 | Unlimited templates, full audit trail |
| Growth | $29 | 50 | Webhooks, API access, priority support |
| Business | $79 | 150 | Custom email domain, dedicated support |

- All paid plans: $0.75/waiver overage
- Stripe Checkout + Customer Portal integration
- Usage tracking via `get_org_monthly_usage()` SQL function
- Tier override support for internal/promo accounts

### Multi-Tenancy & Security
- Organization-level data isolation via PostgreSQL RLS
- All tables scoped to `org_id`
- API keys hashed with SHA-256 (raw key shown once)
- Webhook secrets for payload verification
- Service-role edge functions for privileged operations
- Protected routes require authentication

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| Routing | React Router v6 |
| State | React Query (TanStack Query), React Context |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions + RLS) |
| Edge Functions | Deno (TypeScript) |
| Payments | Stripe (Checkout, Customer Portal, Subscriptions) |
| Email | Resend (transactional email API) |
| Auth | Supabase Auth + Lovable OAuth (Google, Apple) |
| Hosting | Lovable (frontend) + Supabase (backend) |

---

## Database Schema Summary

- **11 tables** with full RLS policies
- **2 enums:** `app_role` (admin/host/customer), `envelope_status` (draft/sent/viewed/signed/completed/expired/canceled)
- **2 SQL functions:** `get_user_org_id()` (RLS helper), `get_org_monthly_usage()` (billing)
- **7 edge functions** for server-side operations
- Foreign keys with proper cascading
- UUID primary keys throughout
- Auto-generated `signing_token` on envelope creation

---

## Competitive Positioning

| Feature | RentalWaivers | DocuSign | HelloSign | WaiverForever |
|---------|-----------|----------|-----------|---------------|
| Built for marketplaces | Yes | No | No | Partial |
| API-first | Yes | Yes | Yes | No |
| Sharetribe integration | Native | No | No | No |
| Webhook-driven booking flow | Yes | Complex | Complex | No |
| Usage-based pricing | Yes | Per-envelope | Per-seat | Per-waiver |
| Free tier | 5/mo | Trial only | Trial only | Limited |
| Self-serve setup | Minutes | Days | Hours | Hours |

---

## Deployment Checklist

- [ ] Deploy edge functions: `supabase functions deploy --all`
- [ ] Set Supabase secrets: `STRIPE_SECRET_KEY`, `RESEND_API_KEY`
- [ ] Run database migrations
- [ ] Configure Stripe products/prices (IDs in `src/lib/stripe-tiers.ts`)
- [ ] Set up Resend domain verification (or use `onboarding@resend.dev` for dev)
- [ ] Optional: Set up cron for `sharetribe-poller` (e.g., every 60 seconds)
