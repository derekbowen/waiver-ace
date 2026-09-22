import {
  AlertTriangleIcon,
  BanIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  SendIcon,
  UsersIcon,
  type LucideIcon } from
'lucide-react';
import type { WaiverStatus } from './types';

export type StatusTone = 'neutral' | 'info' | 'progress' | 'success' | 'warning' | 'danger';

interface StatusMeta {
  label: string;
  tone: StatusTone;
  icon: LucideIcon;
  hint: string;
}

/**
 * Status is always communicated with an icon + text label, never colour alone.
 */
export const WAIVER_STATUS: Record<WaiverStatus, StatusMeta> = {
  draft: {
    label: 'Draft',
    tone: 'neutral',
    icon: PencilIcon,
    hint: 'Saved but not sent yet.'
  },
  scheduled: {
    label: 'Scheduled',
    tone: 'info',
    icon: CalendarClockIcon,
    hint: 'Will send automatically at the scheduled time.'
  },
  sent: {
    label: 'Sent',
    tone: 'info',
    icon: SendIcon,
    hint: 'Delivered — waiting for the guest to open it.'
  },
  viewed: {
    label: 'Viewed',
    tone: 'progress',
    icon: EyeIcon,
    hint: 'The guest opened the waiver but has not signed.'
  },
  partially_signed: {
    label: 'Partially signed',
    tone: 'progress',
    icon: UsersIcon,
    hint: 'Some signers are done; others still need to sign.'
  },
  completed: {
    label: 'Completed',
    tone: 'success',
    icon: CheckCircle2Icon,
    hint: 'All required signers have signed.'
  },
  expired: {
    label: 'Expired',
    tone: 'warning',
    icon: ClockIcon,
    hint: 'The signing window closed before everyone signed.'
  },
  canceled: {
    label: 'Canceled',
    tone: 'neutral',
    icon: BanIcon,
    hint: 'Canceled by your team. No further reminders are sent.'
  },
  failed: {
    label: 'Failed',
    tone: 'danger',
    icon: AlertTriangleIcon,
    hint: 'Delivery failed — check the guest’s email address.'
  }
};

export const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'bg-sunken text-ink-muted border-hairline-strong',
  info: 'bg-info-soft text-info border-info/25',
  progress: 'bg-gold-soft text-gold border-gold/30',
  success: 'bg-ok-soft text-ok border-ok/25',
  warning: 'bg-caution-soft text-caution border-caution/30',
  danger: 'bg-alert-soft text-alert border-alert/30'
};