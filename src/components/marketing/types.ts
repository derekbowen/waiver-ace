export type WaiverStatus =
'draft' |
'scheduled' |
'sent' |
'viewed' |
'partially_signed' |
'completed' |
'expired' |
'canceled' |
'failed';

export type IntegrationStatus = 'connected' | 'available' | 'coming_soon' | 'requires_approval';

export type DeliveryMethod = 'email' | 'link' | 'qr' | 'group';

export interface Waiver {
  id: string;
  guestName: string;
  guestEmail: string;
  property: string;
  booking: string;
  template: string;
  sentAt: string;
  status: WaiverStatus;
  lastActivity: string;
  signersTotal: number;
  signersComplete: number;
  source: 'Manual' | 'API' | 'QR code' | 'Bulk import';
}

export interface WaiverTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'published' | 'draft';
  updatedAt: string;
  version: number;
  usageCount: number;
  recommended?: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'completed' | 'viewed' | 'sent' | 'reminder' | 'expired';
  guest: string;
  detail: string;
  time: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  summary: string;
  status: IntegrationStatus;
  href?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  cta: string;
  done: boolean;
}