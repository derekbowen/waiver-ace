import React from "react";
import { BikeIcon, CarFrontIcon, HomeIcon, MapIcon, ShipIcon, WavesIcon, BoxIcon } from "lucide-react";
import { USE_CASES } from "../../data/marketing";
const ICON_MAP: Record<string, BoxIcon> = {
  waves: WavesIcon,
  car: CarFrontIcon,
  ship: ShipIcon,
  bike: BikeIcon,
  map: MapIcon,
  home: HomeIcon
};
export function UseCases() {
  return <section id="solutions" className="border-b border-hairline bg-canvas" aria-labelledby="solutions-heading">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="solutions-heading" className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Where operators use waivers most
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Anywhere a guest uses something that carries risk, there is a waiver that should be signed before they
            arrive.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return <li key={item.title} className="rounded-xl border border-hairline bg-surface p-5 shadow-card transition-shadow hover:shadow-raised">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </li>;
        })}
        </ul>
      </div>
    </section>;
}