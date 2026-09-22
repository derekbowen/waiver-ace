import { useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { LANDING_FAQS } from "@/lib/landing-faqs";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-hairline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-6 py-5 text-left"
      >
        <span className="font-display text-base font-semibold text-ink sm:text-lg">{q}</span>
        <span className="mt-0.5 shrink-0 text-ink-subtle" aria-hidden="true">
          {open ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
        </span>
      </button>
      {open && <p className="max-w-3xl pb-6 text-sm leading-relaxed text-ink-muted sm:text-base">{a}</p>}
    </div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="border-b border-hairline bg-canvas" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="faq-heading" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Common questions
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            What operators ask before switching from paper, PDFs, or another waiver platform.
          </p>
        </div>
        <div className="mt-8 border-t border-hairline">
          {LANDING_FAQS.map((item) => (
            <FaqItem key={item.question} q={item.question} a={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
