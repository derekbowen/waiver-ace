import { Link } from "react-router-dom";
import { ArrowUpRightIcon } from "lucide-react";

const COLUMNS: {
  title: string;
  hub: { label: string; to: string };
  links: [string, string][];
}[] = [
  {
    title: "By industry",
    hub: { label: "All industries", to: "/industries" },
    links: [
      ["Bounce house rentals", "/industries/bounce-house-rental-waiver-software"],
      ["Jet ski rentals", "/industries/jet-ski-rental-waiver-software"],
      ["Kayak rentals", "/industries/kayak-rental-waiver-software"],
      ["ATV rentals", "/industries/atv-rental-waiver-software"],
      ["Boat rentals", "/industries/boat-rental-waiver-software"],
      ["Golf cart rentals", "/industries/golf-cart-rental-waiver-software"],
      ["Party rentals", "/industries/party-rental-waiver-software"],
      ["Equipment rentals", "/industries/equipment-rental-waiver-software"],
    ],
  },
  {
    title: "By state law",
    hub: { label: "All states", to: "/waiver-laws" },
    links: [
      ["California waiver laws", "/waiver-laws/california"],
      ["Florida waiver laws", "/waiver-laws/florida"],
      ["Texas waiver laws", "/waiver-laws/texas"],
      ["Arizona waiver laws", "/waiver-laws/arizona"],
      ["Colorado waiver laws", "/waiver-laws/colorado"],
      ["New York waiver laws", "/waiver-laws/new-york"],
    ],
  },
  {
    title: "Free templates",
    hub: { label: "All templates", to: "/waiver-templates" },
    links: [
      ["Kayak rental waiver", "/waiver-templates/kayak-rental-waiver-template"],
      ["Bounce house waiver", "/waiver-templates/bounce-house-rental-waiver-template"],
      ["ATV rental waiver", "/waiver-templates/atv-rental-waiver-template"],
      ["Boat rental waiver", "/waiver-templates/boat-rental-waiver-template"],
      ["Jet ski rental waiver", "/waiver-templates/jet-ski-rental-waiver-template"],
      ["RV rental waiver", "/waiver-templates/rv-rental-waiver-template"],
    ],
  },
  {
    title: "Comparisons & guides",
    hub: { label: "All comparisons", to: "/compare" },
    links: [
      ["Smartwaiver alternative", "/alternatives/smartwaiver-alternative"],
      ["WaiverForever alternative", "/alternatives/waiverforever-alternative"],
      ["WaiverFile alternative", "/alternatives/waiverfile-alternative"],
      ["Jotform waiver alternative", "/alternatives/jotform-waiver-alternative"],
      ["DocuSign waiver alternative", "/alternatives/docusign-waiver-alternative"],
      ["Digital vs paper waivers", "/blog/digital-vs-paper-waivers"],
    ],
  },
];

export function DirectorySection() {
  return (
    <section id="browse" className="border-b border-hairline bg-surface" aria-labelledby="browse-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="browse-heading" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Waivers by industry, state &amp; template
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Every rental category, state liability-waiver rules, free templates, and platform comparisons.
          </p>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="border-b border-hairline pb-3 font-display text-sm font-semibold text-ink">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-ink-muted transition-colors hover:text-brand">
                      {label}
                    </Link>
                  </li>
                ))}
                <li className="pt-1.5">
                  <Link to={col.hub.to} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                    {col.hub.label}
                    <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </section>
  );
}
