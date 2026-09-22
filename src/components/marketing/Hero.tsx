import React from 'react';
import { ArrowRightIcon, PlayCircleIcon, ShieldCheckIcon } from 'lucide-react';
import { LinkButton } from '../ui/Button';
import { DashboardPreview } from './DashboardPreview';

export function Hero() {
  return (
    <section className="border-b border-hairline bg-surface" aria-labelledby="hero-heading">
      <div className="mx-auto grid max-w-content items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-sunken px-3 py-1 text-xs font-medium text-ink-muted">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Digital waivers for hospitality operators
          </p>

          <h1
            id="hero-heading"
            className="mt-4 font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-ink sm:text-[2.75rem] lg:text-[3.25rem]">
            
            Collect every guest waiver before check-in.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Create, send, and track digital waivers for vacation rentals, amenities, equipment, and guest
            activities—from one simple dashboard.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/app" size="lg">
              Start free
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <a
              href="#how-it-works"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-hairline-strong bg-surface px-5 py-3 text-base font-medium text-ink transition-colors hover:bg-sunken">
              
              <PlayCircleIcon className="h-4 w-4" aria-hidden="true" />
              See how it works
            </a>
          </div>

          <p className="mt-5 text-sm text-ink-subtle">250 free signatures • No credit card • No monthly subscription</p>
        </div>

        <div className="lg:pl-4">
          <DashboardPreview />
        </div>
      </div>
    </section>);

}