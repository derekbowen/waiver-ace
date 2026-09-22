import React from 'react';
import { ArrowRightIcon, MailIcon } from 'lucide-react';
import { LinkButton } from '@/components/marketing/ui/Button';
import { CONTACT_EMAIL } from '@/data-marketing';

export function FinalCta() {
  return (
    <section className="bg-surface" aria-labelledby="final-cta-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-2xl bg-ink px-6 py-12 text-center sm:px-10 lg:px-16">
          <h2 id="final-cta-heading" className="font-display text-2xl font-bold tracking-tight text-ink-inverse sm:text-3xl">
            Start collecting guest waivers today.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-ink-inverse/75">
            250 free signatures, no credit card, and no monthly subscription. Send your first waiver in under two
            minutes.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton to="/login" size="lg" variant="accent">
              Start free
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-ink-inverse/30 px-5 py-3 text-base font-medium text-ink-inverse transition-colors hover:bg-ink-inverse/10">
              
              <MailIcon className="h-4 w-4" aria-hidden="true" />
              Talk to us
            </a>
          </div>
        </div>
      </div>
    </section>);

}