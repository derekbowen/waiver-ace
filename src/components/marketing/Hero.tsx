import React from 'react';
import { ArrowRightIcon, PlayCircleIcon, ShieldCheckIcon } from 'lucide-react';
import { LinkButton } from '@/components/marketing/ui/Button';
import heroVideo from '@/assets/hero-waivers.mp4.asset.json';

export function Hero() {
  return (
    <section
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden border-b border-hairline bg-surface"
      aria-labelledby="hero-heading">

      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        src={heroVideo.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Legibility scrim */}
      <div className="absolute inset-0 -z-10 bg-surface/70 backdrop-blur-[1px]" aria-hidden="true" />

      <div className="mx-auto w-full max-w-content px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/80 px-3 py-1 text-xs font-medium text-ink-muted">
          <ShieldCheckIcon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          Digital waivers for hospitality operators
        </p>

        <h1
          id="hero-heading"
          className="mx-auto mt-5 max-w-4xl font-display text-[2.25rem] font-bold leading-[1.05] tracking-tight text-ink sm:text-[3.25rem] lg:text-[4.25rem]">
          
          Create your liability waiver now.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          Create, send, and track digital waivers for vacation rentals, amenities, equipment, and guest
          activities—from one simple dashboard.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton to="/login" size="lg">
            Start free
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </LinkButton>
          <a
            href="#how-it-works"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-hairline-strong bg-surface/80 px-5 py-3 text-base font-medium text-ink transition-colors hover:bg-sunken">
            
            <PlayCircleIcon className="h-4 w-4" aria-hidden="true" />
            See how it works
          </a>
        </div>

        <p className="mt-6 text-sm text-ink-subtle">250 free signatures • No credit card • No monthly subscription</p>
      </div>
    </section>);

}
