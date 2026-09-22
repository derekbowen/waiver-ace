import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  to?: string;
  compact?: boolean;
}

/**
 * RentalWaivers brand lockup: a signed-document mark plus the wordmark.
 * One consistent spelling everywhere: "RentalWaivers".
 */
export function Logo({ to = '/', compact = false }: LogoProps) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5" aria-label="RentalWaivers home">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-card"
        aria-hidden="true">
        
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M6 3.5h8.5L19 8v12.5H6z" strokeLinejoin="round" />
          <path d="M14 3.5V8h5" strokeLinejoin="round" />
          <path d="M8.8 15.6c1.4-.3 2-2.6 2.6-2.6.7 0 .6 2.6 1.5 2.6.6 0 .9-1.1 1.6-1.1.5 0 .8.6 1.3.6" strokeLinecap="round" />
        </svg>
      </span>
      {!compact &&
      <span className="font-display text-[1.0625rem] font-bold leading-none tracking-tight text-ink">
          Rental<span className="text-primary">Waivers</span>
        </span>
      }
    </Link>);

}