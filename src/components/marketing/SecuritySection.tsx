import React from 'react';
import { ScaleIcon, ShieldCheckIcon } from 'lucide-react';
import { SECURITY_POINTS } from '@/data-marketing';

export function SecuritySection() {
  return (
    <section id="security" className="border-b border-hairline bg-canvas" aria-labelledby="security-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            Security and trust
          </span>
          <h2 id="security-heading" className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            What we protect, stated plainly
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Only protections that are actually implemented are listed here. RentalWaivers does not currently hold a
            SOC 2, ISO 27001, or HIPAA attestation, and we do not claim one.
          </p>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_POINTS.map((point) =>
          <li key={point.title} className="rounded-xl border border-hairline bg-surface p-5">
              <h3 className="font-display text-sm font-semibold text-ink">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{point.body}</p>
            </li>
          )}
        </ul>

        <div className="mt-6 flex gap-4 rounded-xl border border-hairline bg-surface p-5 sm:p-6">
          <ScaleIcon className="mt-0.5 h-5 w-5 shrink-0 text-ink-subtle" aria-hidden="true" />
          <div>
            <h3 className="font-display text-sm font-semibold text-ink">Legal disclaimer</h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-ink-muted">
              Electronic signatures collected through RentalWaivers can satisfy applicable electronic-signature
              requirements, such as those contemplated by the U.S. ESIGN Act and UETA. Whether a particular waiver is
              enforceable depends on the document language, the jurisdiction, the circumstances of signing, and legal
              review. RentalWaivers is not a law firm, does not provide legal advice, and does not warrant that any
              waiver is enforceable.
            </p>
          </div>
        </div>
      </div>
    </section>);

}