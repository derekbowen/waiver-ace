import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
import { Logo } from '@/components/marketing/ui/Logo';
import { LinkButton } from '@/components/marketing/ui/Button';
import { PRIMARY_NAV } from '@/data-marketing';

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) =>
            <li key={item.label}>
                <a
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-sunken hover:text-ink">
                
                  {item.label}
                </a>
              </li>
            )}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LinkButton to="/login" variant="ghost" size="sm">
            Sign in
          </LinkButton>
          <LinkButton to="/login" size="sm">
            Start free
          </LinkButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-hairline-strong text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}>
          
          {open ? <XIcon className="h-5 w-5" aria-hidden="true" /> : <MenuIcon className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open &&
      <div id="mobile-nav" className="border-t border-hairline bg-surface lg:hidden">
          <div className="mx-auto max-w-content px-4 py-3 sm:px-6">
            <div className="mb-2 flex justify-end">
              <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-muted"
              aria-label="Close menu">
              
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <ul className="flex flex-col">
              {PRIMARY_NAV.map((item) =>
            <li key={item.label}>
                  <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] items-center rounded-md px-2 text-base font-medium text-ink">
                
                    {item.label}
                  </a>
                </li>
            )}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2 pb-2">
              <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-hairline-strong text-sm font-medium text-ink">
              
                Sign in
              </Link>
              <Link
              to="/login"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand text-sm font-medium text-ink-inverse">
              
                Start free
              </Link>
            </div>
          </div>
        </div>
      }
    </header>);

}