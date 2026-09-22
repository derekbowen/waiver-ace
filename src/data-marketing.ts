import type { Integration } from '@/components/marketing/types';

export const CONTACT_EMAIL = 'hello@rentalwaivers.com';

export const PRIMARY_NAV = [
{ label: 'Product', href: '/#product' },
{ label: 'Solutions', href: '/#solutions' },
{ label: 'Integrations', href: '/#integrations' },
{ label: 'Pricing', href: '/#pricing' },
{ label: 'Industries', href: '/industries' },
{ label: 'Templates', href: '/waiver-templates' },
{ label: 'Developers', href: '/docs' }];


/** Only capabilities with a shipped implementation belong in "Available now". */
export const AVAILABLE_NOW = [
{ title: 'Manual signing links', detail: 'Generate a secure link for any guest and share it however you like.' },
{ title: 'Email delivery', detail: 'Send the waiver to a guest’s inbox with automatic reminders.' },
{ title: 'QR codes & kiosk mode', detail: 'Post a code at the property or sign on a tablet at check-in.' },
{ title: 'Group signing', detail: 'One link collects signatures from every adult on the booking.' },
{ title: 'REST API & API keys', detail: 'Create waivers programmatically from your own systems.' },
{ title: 'Webhook endpoints', detail: 'Subscribe to waiver events. Signature verification is being finalised.' }];


export const COMING_SOON = [
{ title: 'Guesty', detail: 'Reservation-triggered waivers. Integration in development.' },
{ title: 'Generic PMS webhooks', detail: 'A documented pattern for any PMS that can post reservation events.' },
{ title: 'Zapier / Make', detail: 'Planned once the public API surface is stable.' }];


export const USE_CASES = [
{
  title: 'Pools and hot tubs',
  body: 'Acknowledge depth, supervision, and no-glass rules before guests use the water.',
  icon: 'waves'
},
{
  title: 'Golf carts and recreational vehicles',
  body: 'Capture driver details, licence confirmation, and on-property driving rules.',
  icon: 'car'
},
{
  title: 'Boats and watercraft',
  body: 'Collect operator acknowledgments and life-jacket rules for every adult aboard.',
  icon: 'ship'
},
{
  title: 'Equipment rentals',
  body: 'Bikes, kayaks, paddleboards, and gear — condition, return, and damage terms.',
  icon: 'bike'
},
{
  title: 'Tours and guest activities',
  body: 'Group signing for guided experiences, with a roster you can check before departure.',
  icon: 'map'
},
{
  title: 'Property rules and amenity acknowledgments',
  body: 'House rules, quiet hours, pet policies, and amenity terms in one signed record.',
  icon: 'home'
}];


export const HOW_IT_WORKS = [
{
  step: '01',
  title: 'Create or choose a waiver',
  body: 'Start from a hospitality template or upload your own language. Templates are versioned.'
},
{
  step: '02',
  title: 'Send it to the guest',
  body: 'Email, a shareable link, a QR code at the property, or one group link for the whole booking.'
},
{
  step: '03',
  title: 'Track completion before arrival',
  body: 'See who has signed, who hasn’t, and send reminders — all before check-in day.'
}];


export const CAPABILITIES = [
{ title: 'Waiver templates', body: 'Versioned templates with merge fields for guest, property, and booking.' },
{ title: 'Mobile signing', body: 'A one-handed signing experience that works on any phone browser.' },
{ title: 'Group signing', body: 'Collect a signature from every required adult through a single link.' },
{ title: 'QR codes and kiosk mode', body: 'On-property signing without sending anything in advance.' },
{ title: 'Completion tracking', body: 'Per-signer progress so you know exactly what is outstanding.' },
{ title: 'Audit trails', body: 'Timestamped events for sent, viewed, and signed, with IP and user agent.' },
{ title: 'Downloadable records', body: 'Retrieve the completed PDF and its event history at any time.' },
{ title: 'Team access', body: 'Invite colleagues to your organisation with role-based permissions.' },
{ title: 'API and webhooks', body: 'Create waivers and receive events from your own infrastructure.' },
{ title: 'Notifications', body: 'Automatic reminders to guests and completion alerts to your team.' },
{ title: 'Reporting', body: 'Completion rate, volume over time, and per-template performance.' }];


export const ADDITIONAL_TOOLS = [
{ name: 'Contract Scanner', body: 'AI review of an uploaded contract. Separate from the waiver workflow.' },
{ name: 'PhotoSell', body: 'Listing photo tooling. Not part of the waiver product.' },
{ name: 'Listing Analyzer', body: 'Listing copy review. Not part of the waiver product.' }];


export const CREDIT_PACKAGES = [
{ credits: 200, price: 20, perSignature: '10¢', label: 'Starter' },
{ credits: 550, price: 50, perSignature: '9¢', label: 'Small portfolio' },
{ credits: 1250, price: 100, perSignature: '8¢', label: 'Recommended', recommended: true },
{ credits: 3500, price: 250, perSignature: '7¢', label: 'Growing' },
{ credits: 8000, price: 500, perSignature: '6¢', label: 'High volume' }];


export const INTEGRATIONS: Integration[] = [
{
  id: 'api',
  name: 'REST API',
  category: 'Developer',
  summary: 'Create waivers, fetch status, and download records from your own systems.',
  status: 'connected',
  href: '/docs'
},
{
  id: 'webhooks',
  name: 'Webhooks',
  category: 'Developer',
  summary: 'Receive waiver lifecycle events at your endpoint.',
  status: 'available',
  href: '/docs'
},
{
  id: 'qr',
  name: 'QR codes & kiosk',
  category: 'On-property',
  summary: 'Sign at the door or on a tablet without an email address.',
  status: 'available'
},
{
  id: 'embed',
  name: 'Embed on your site',
  category: 'On-property',
  summary: 'Drop a signing form into your own booking page.',
  status: 'available'
},
{
  id: 'guesty',
  name: 'Guesty',
  category: 'Property management',
  summary: 'Reservation-triggered waivers with pre-arrival completion status.',
  status: 'coming_soon',
  href: '/app/integrations/guesty'
},
{
  id: 'pms-generic',
  name: 'Generic PMS webhook',
  category: 'Property management',
  summary: 'A documented pattern for any PMS that can post reservation events.',
  status: 'coming_soon',
  href: '/docs'
},
{
  id: 'zapier',
  name: 'Zapier',
  category: 'Automation',
  summary: 'No published app yet. Planned after the public API stabilises.',
  status: 'coming_soon'
},
{
  id: 'sharetribe',
  name: 'Sharetribe',
  category: 'Marketplace',
  summary: 'Marketplace event sync. Requires partner approval before release.',
  status: 'requires_approval'
}];


export const SECURITY_POINTS = [
{
  title: 'Encryption',
  body: 'Traffic is served over TLS and documents are stored in encrypted object storage.'
},
{
  title: 'Access controls',
  body: 'Data is scoped to your organisation with row-level authorisation and role-based team access.'
},
{
  title: 'Audit data',
  body: 'Every waiver records sent, viewed, and signed events with timestamp, IP address, and user agent.'
},
{
  title: 'Signature records',
  body: 'The signature image, signer details, and consent statement are stored with the completed document.'
},
{
  title: 'Document retrieval',
  body: 'Completed waivers and their event history can be downloaded by your team at any time.'
},
{
  title: 'Data handling & privacy',
  body: 'Guest data is used to produce and deliver the waiver. Retention is configurable per organisation.'
}];