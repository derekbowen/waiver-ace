import React from 'react';
import { CheckIcon, ClockIcon } from 'lucide-react';
import { AVAILABLE_NOW, COMING_SOON } from '@/data-marketing';

export function IntegrationContext() {
  return (
    <section id="integrations" className="border-b border-hairline bg-canvas" aria-labelledby="integrations-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="integrations-heading" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Built to fit the way property managers already work
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Send waivers by hand today, or wire them into your own systems with the API. We list what ships today
            separately from what is still being built — no partner logos, no implied endorsements.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-surface p-6 shadow-card">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/25 bg-ok-soft px-2.5 py-1 text-xs font-semibold text-ok">
                <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Available now
              </span>
            </div>
            <ul className="mt-5 space-y-4">
              {AVAILABLE_NOW.map((item) =>
              <li key={item.title} className="flex gap-3">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="text-sm leading-relaxed text-ink-muted">{item.detail}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-dashed border-hairline-strong bg-surface p-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              In development
            </span>
            <ul className="mt-5 space-y-4">
              {COMING_SOON.map((item) =>
              <li key={item.title} className="flex gap-3">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="text-sm leading-relaxed text-ink-muted">{item.detail}</p>
                  </div>
                </li>
              )}
            </ul>
            <p className="mt-6 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-subtle">
              Nothing in this column is available yet. We will only describe an integration as available once it is
              implemented, tested, and approved by the partner where approval is required.
            </p>
          </div>
        </div>
      </div>
    </section>);

}