import React from 'react';
import { ArrowRightIcon, CalendarCheckIcon, ClockIcon, FileCheck2Icon, BellRingIcon, UsersIcon } from 'lucide-react';
import { LinkButton } from '../ui/Button';

const FLOW = [
{ icon: CalendarCheckIcon, title: 'A reservation triggers the right waiver', body: 'Property and booking details map to the waiver template you have assigned.' },
{ icon: UsersIcon, title: 'Each required adult gets a signing link', body: 'Group signing collects a separate signature from every adult on the booking.' },
{ icon: ClockIcon, title: 'You see completion status before check-in', body: 'Outstanding signatures appear on the dashboard alongside the arrival date.' },
{ icon: FileCheck2Icon, title: 'Documents and audit records stay in RentalWaivers', body: 'Completed PDFs and their event history remain downloadable from your account.' },
{ icon: BellRingIcon, title: 'Missing signatures produce reminders', body: 'Automatic reminders run until the waiver is completed or the window closes.' }];


export function GuestyPreview() {
  return (
    <section className="border-b border-hairline bg-surface" aria-labelledby="guesty-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-2xl border border-dashed border-hairline-strong bg-canvas p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Guesty integration in development
            </span>
            <span className="text-xs text-ink-subtle">Not yet available · No Marketplace approval implied</span>
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <h2 id="guesty-heading" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Reservation-triggered waivers for Guesty users
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">
                We are building a connection so that a confirmed reservation automatically produces the right waiver
                for that property, without anyone on your team sending it by hand. Below is the proposed workflow.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Until it is built and approved, you can achieve the same result today using the REST API, bulk send, or
                a shareable link in your existing guest messaging.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <LinkButton to="/app/integrations/guesty">
                  Request early access
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </LinkButton>
                <LinkButton to="/docs" variant="secondary">
                  Read the PMS integration guide
                </LinkButton>
              </div>
            </div>

            <ol className="space-y-3">
              {FLOW.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-4 rounded-xl border border-hairline bg-surface p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sunken text-ink-muted">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        <span className="mr-2 text-ink-subtle">{i + 1}.</span>
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                    </div>
                  </li>);

              })}
            </ol>
          </div>
        </div>
      </div>
    </section>);

}