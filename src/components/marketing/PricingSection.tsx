import React from 'react';
import { CheckIcon, InfoIcon } from 'lucide-react';
import { CREDIT_PACKAGES } from '@/data-marketing';
import { LinkButton } from '@/components/marketing/ui/Button';

const INCLUDED = [
'Unlimited waiver templates',
'Email, link, QR code, and group signing',
'Completion tracking and reminders',
'Audit trail and downloadable signed records',
'Team access and REST API'];


export function PricingSection() {
  const recommended = CREDIT_PACKAGES.find((p) => p.recommended) ?? CREDIT_PACKAGES[2];
  const others = CREDIT_PACKAGES.filter((p) => p !== recommended);

  return (
    <section id="pricing" className="border-b border-hairline bg-surface" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="pricing-heading" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Pay for signatures, not seats
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            There is no monthly subscription. You buy credits, and one credit is used each time a waiver is completed.
            Credits do not expire, and every feature is included at every package size.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="rounded-2xl border-2 border-brand bg-brand-soft p-6 shadow-raised">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-ink-inverse">
                Recommended for most operators
              </span>
            </div>
            <p className="mt-5 font-display text-4xl font-bold text-ink">${recommended.price}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {recommended.credits.toLocaleString()} signatures · {recommended.perSignature} per signature · credits
              never expire
            </p>
            <ul className="mt-5 space-y-2.5">
              {INCLUDED.map((item) =>
              <li key={item} className="flex gap-2.5 text-sm text-ink">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  {item}
                </li>
              )}
            </ul>
            <LinkButton to="/app" size="lg" className="mt-6 w-full">
              Start free
            </LinkButton>
            <p className="mt-3 text-center text-xs text-ink-muted">
              Start with 250 free signatures. No credit card required.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-ink">Other package sizes</h3>
            <ul className="mt-3 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
              {others.map((pkg) =>
              <li key={pkg.credits} className="flex flex-wrap items-center justify-between gap-3 bg-surface px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {pkg.credits.toLocaleString()} signatures
                      <span className="ml-2 font-normal text-ink-subtle">{pkg.label}</span>
                    </p>
                    <p className="text-sm text-ink-muted">{pkg.perSignature} per signature · never expires</p>
                  </div>
                  <p className="font-display text-lg font-bold text-ink">${pkg.price}</p>
                </li>
              )}
            </ul>

            <div className="mt-5 flex gap-3 rounded-xl border border-hairline bg-canvas p-4">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              <div className="text-sm leading-relaxed text-ink-muted">
                <p className="font-semibold text-ink">What actually uses a credit</p>
                <p className="mt-1">
                  A credit is consumed when a waiver reaches completed status. Drafts, views, reminders, and expired
                  waivers do not consume credits. Group signing uses one credit per completed signer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}