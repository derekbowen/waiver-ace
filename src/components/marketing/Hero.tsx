import React from 'react';
import { ArrowRightIcon, CheckCircle2Icon, PlayCircleIcon, ShieldCheckIcon } from 'lucide-react';
import { LinkButton } from '@/components/marketing/ui/Button';
import { DashboardPreview } from '@/components/marketing/DashboardPreview';
import heroVideo from '@/assets/hero-rental-cinematic.mp4.asset.json';
import heroPoster from '@/assets/hero-lifestyle.jpg';

export function Hero() {
  return (
    <section
      className="relative isolate w-full overflow-hidden border-b border-hairline bg-surface"
      aria-labelledby="hero-heading">

      {/* Ambient cinematic wash bleeding behind the whole hero */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <video
          className="h-full w-full scale-110 object-cover opacity-25 blur-[2px]"
          src={heroVideo.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface/85 to-surface/60" />
      </div>

      <div className="mx-auto grid w-full max-w-content items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-8 lg:py-28">
        {/* Copy */}
        <div className="animate-fade-in text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/80 px-3 py-1 text-xs font-medium text-ink-muted backdrop-blur">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            Digital waivers for hospitality operators
          </p>

          <h1
            id="hero-heading"
            className="mt-5 max-w-xl font-display text-[2.4rem] font-bold leading-[1.03] tracking-tight text-ink sm:text-[3.25rem] lg:text-[3.75rem]">

            Collect every guest waiver before check-in.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Create, send, and track digital waivers for vacation rentals, amenities, equipment, and guest
            activities—from one simple dashboard.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <LinkButton to="/login" size="lg">
              Start free
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
            <a
              href="#how-it-works"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-hairline-strong bg-surface/80 px-5 py-3 text-base font-medium text-ink backdrop-blur transition-colors hover:bg-sunken">

              <PlayCircleIcon className="h-4 w-4" aria-hidden="true" />
              See how it works
            </a>
          </div>

          <p className="mt-6 text-sm text-ink-subtle">
            250 free signatures • No credit card • No monthly subscription
          </p>
        </div>

        {/* Cinematic video panel with the product floating on top */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-hairline bg-ink shadow-pop">
            <video
              className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[520px]"
              src={heroVideo.url}
              poster={heroPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Product surface overlapping the footage */}
          <div className="relative z-10 -mt-24 px-3 sm:-mt-32 sm:px-8 lg:-mt-40 lg:px-10">
            <div className="animate-scale-in">
              <DashboardPreview />
            </div>
          </div>

          {/* Floating proof chip */}
          <div className="absolute left-4 top-4 z-20 hidden items-center gap-2 rounded-xl border border-hairline bg-surface/95 px-3 py-2 shadow-pop backdrop-blur sm:flex">
            <CheckCircle2Icon className="h-4 w-4 text-ok" aria-hidden="true" />
            <span className="text-[12px] font-medium text-ink">Waiver signed · 2 min before arrival</span>
          </div>
        </div>
      </div>
    </section>);

}
