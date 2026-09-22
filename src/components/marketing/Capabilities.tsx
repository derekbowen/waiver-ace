import React from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { ADDITIONAL_TOOLS, CAPABILITIES } from '@/data-marketing';

export function Capabilities() {
  return (
    <section id="product" className="border-b border-hairline bg-canvas" aria-labelledby="product-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="product-heading" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Everything the waiver workflow needs
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            One product, one job: get the right waiver signed by the right people before the guest arrives.
          </p>
        </div>

        <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) =>
          <li key={item.title} className="flex gap-3 border-t border-hairline pt-4">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            </li>
          )}
        </ul>

        <details className="group mt-10 rounded-xl border border-hairline bg-surface">
          <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
            <span>
              <span className="font-display text-sm font-semibold text-ink">Additional tools</span>
              <span className="ml-2 text-sm text-ink-subtle">Separate from the waiver workflow</span>
            </span>
            <ChevronDownIcon
              className="h-4 w-4 shrink-0 text-ink-subtle transition-transform group-open:rotate-180"
              aria-hidden="true" />
            
          </summary>
          <div className="grid gap-4 border-t border-hairline px-5 py-4 sm:grid-cols-3">
            {ADDITIONAL_TOOLS.map((tool) =>
            <div key={tool.name}>
                <h3 className="text-sm font-semibold text-ink">{tool.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{tool.body}</p>
              </div>
            )}
          </div>
        </details>
      </div>
    </section>);

}