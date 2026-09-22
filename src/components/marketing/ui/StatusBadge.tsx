import React from 'react';
import { twMerge } from 'tailwind-merge';
import type { WaiverStatus } from '@/components/marketing/types';
import { TONE_CLASSES, WAIVER_STATUS, type StatusTone } from '@/components/marketing/status';

export function StatusBadge({ status, className }: {status: WaiverStatus;className?: string;}) {
  const meta = WAIVER_STATUS[status];
  const Icon = meta.icon;
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        TONE_CLASSES[meta.tone],
        className
      )}
      title={meta.hint}>
      
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {meta.label}
    </span>);

}

export function Pill({
  tone = 'neutral',
  icon: Icon,
  children,
  className





}: {tone?: StatusTone;icon?: React.ElementType;children: React.ReactNode;className?: string;}) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
        className
      )}>
      
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
      {children}
    </span>);

}