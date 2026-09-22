import React from 'react';
import { FileTextIcon, SendIcon, CheckCircle2Icon } from 'lucide-react';
import { HOW_IT_WORKS } from '../../data/marketing';

const PREVIEWS = [
<ul key="a" className="space-y-2">
    {['Pool & hot tub acknowledgment', 'Golf cart operation waiver', 'House rules acknowledgment'].map((t, i) =>
  <li
    key={t}
    className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${
    i === 0 ? 'border-primary/40 bg-primary-soft text-primary' : 'border-hairline bg-surface text-ink-muted'}`
    }>
    
        {t}
        {i === 0 && <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      </li>
  )}
  </ul>,
<div key="b" className="space-y-2">
    {[
  { label: 'Email', on: true },
  { label: 'Shareable link', on: false },
  { label: 'QR code', on: false },
  { label: 'Group signing (4 adults)', on: true }].
  map((opt) =>
  <div
    key={opt.label}
    className="flex items-center justify-between rounded-md border border-hairline bg-surface px-3 py-2 text-xs text-ink-muted">
    
        {opt.label}
        <span
      className={`flex h-4 w-4 items-center justify-center rounded border ${
      opt.on ? 'border-primary bg-primary text-white' : 'border-hairline-strong'}`
      }
      aria-hidden="true">
      
          {opt.on ? <CheckCircle2Icon className="h-3 w-3" /> : null}
        </span>
      </div>
  )}
  </div>,
<div key="c" className="space-y-2">
    {[
  { name: 'Marisol Ortega', state: 'Signed', done: true },
  { name: 'Andre Ortega', state: 'Signed', done: true },
  { name: 'Lena Ortega', state: 'Reminder sent', done: false },
  { name: 'Paul Ortega', state: 'Waiting for signature', done: false }].
  map((s) =>
  <div
    key={s.name}
    className="flex items-center justify-between rounded-md border border-hairline bg-surface px-3 py-2 text-xs">
    
        <span className="text-ink">{s.name}</span>
        <span className={s.done ? 'font-medium text-success' : 'text-ink-subtle'}>{s.state}</span>
      </div>
  )}
  </div>];


const ICONS = [FileTextIcon, SendIcon, CheckCircle2Icon];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-hairline bg-surface" aria-labelledby="how-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <h2 id="how-heading" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Three steps, every booking
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
          The whole workflow takes about a minute the first time and a few seconds after that.
        </p>

        <ol className="mt-8 grid gap-5 lg:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <li key={step.step} className="flex flex-col rounded-xl border border-hairline bg-canvas p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-xs font-semibold tracking-wide text-ink-subtle">
                    Step {step.step}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
                <div className="mt-5 rounded-lg border border-hairline bg-sunken p-3">{PREVIEWS[i]}</div>
              </li>);

          })}
        </ol>
      </div>
    </section>);

}