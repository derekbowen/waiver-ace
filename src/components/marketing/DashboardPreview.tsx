import React from 'react';
import { BellIcon, CheckCircle2Icon, SearchIcon, SendIcon } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import type { WaiverStatus } from '../../types';

const ROWS: {guest: string;property: string;template: string;status: WaiverStatus;progress: string;}[] = [
{
  guest: 'Marisol Ortega',
  property: 'Dune Cottage · RES-8841',
  template: 'Pool & hot tub',
  status: 'partially_signed',
  progress: '2 of 4 signed'
},
{
  guest: 'Dwight Callahan',
  property: 'Harbor Loft 2B · RES-8836',
  template: 'Golf cart',
  status: 'viewed',
  progress: '0 of 2 signed'
},
{
  guest: 'Priya Raman',
  property: 'Cedar Ridge · RES-8830',
  template: 'House rules',
  status: 'completed',
  progress: '2 of 2 signed'
}];


/**
 * An accurate, in-product illustration of the Waivers list — rendered with the
 * same tokens and status components the real app uses.
 */
export function DashboardPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-pop"
      role="img"
      aria-label="Preview of the RentalWaivers dashboard showing reservations, guest signing progress, waiver templates and completed status">
      
      <div className="flex items-center gap-2 border-b border-hairline bg-sunken px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
        <span className="ml-3 truncate rounded-md bg-surface px-2 py-1 text-[11px] text-ink-subtle">
          app.rentalwaivers.com/waivers
        </span>
      </div>

      <div className="grid grid-cols-[132px_1fr] sm:grid-cols-[164px_1fr]">
        <aside className="hidden border-r border-hairline bg-surface p-3 sm:block">
          <ul className="space-y-1 text-[13px]">
            {['Home', 'Waivers', 'Templates', 'Guests', 'Integrations', 'Reports'].map((item) =>
            <li
              key={item}
              className={
              item === 'Waivers' ?
              'rounded-md bg-primary-soft px-2.5 py-1.5 font-medium text-primary' :
              'px-2.5 py-1.5 text-ink-muted'
              }>
              
                {item}
              </li>
            )}
          </ul>
          <div className="mt-4 rounded-lg border border-hairline p-2.5">
            <p className="text-[11px] text-ink-subtle">Credits remaining</p>
            <p className="font-display text-lg font-bold text-ink">1,184</p>
          </div>
        </aside>

        <div className="col-span-2 p-4 sm:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-sm font-semibold text-ink">Waivers</h3>
              <p className="text-[11px] text-ink-subtle">Next 7 days of arrivals</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-lg border border-hairline px-2 py-1.5 text-[11px] text-ink-subtle sm:inline-flex">
                <SearchIcon className="h-3 w-3" aria-hidden="true" /> Search
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-medium text-white">
                <SendIcon className="h-3 w-3" aria-hidden="true" /> Send waiver
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
            { label: 'Awaiting signature', value: '12' },
            { label: 'Completed this month', value: '148' },
            { label: 'Completion rate', value: '94%' }].
            map((stat) =>
            <div key={stat.label} className="rounded-lg border border-hairline bg-sunken px-2.5 py-2">
                <p className="text-[10px] leading-tight text-ink-subtle">{stat.label}</p>
                <p className="font-display text-base font-bold text-ink">{stat.value}</p>
              </div>
            )}
          </div>

          <ul className="mt-3 divide-y divide-hairline rounded-lg border border-hairline">
            {ROWS.map((row) =>
            <li key={row.guest} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">{row.guest}</p>
                  <p className="truncate text-[11px] text-ink-subtle">
                    {row.property} · {row.template}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={row.status} className="px-2 py-0.5 text-[10px]" />
                  <span className="text-[10px] text-ink-subtle">{row.progress}</span>
                </div>
              </li>
            )}
          </ul>

          <div className="mt-3 flex items-center gap-2 rounded-lg border border-hairline bg-success-soft px-3 py-2">
            <CheckCircle2Icon className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <p className="text-[11px] text-ink-muted">
              All arrivals for tomorrow have a completed waiver on file.
            </p>
            <BellIcon className="ml-auto h-3.5 w-3.5 text-ink-subtle" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>);

}