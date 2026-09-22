import React from 'react';
import { Link } from 'react-router-dom';
import { MailIcon } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { CONTACT_EMAIL } from '../../data/marketing';

const GROUPS: {title: string;links: {label: string;to: string;external?: boolean;}[];}[] = [
{
  title: 'Product',
  links: [
  { label: 'Overview', to: '/#product' },
  { label: 'Use cases', to: '/#solutions' },
  { label: 'Integrations', to: '/#integrations' },
  { label: 'Pricing', to: '/#pricing' }]

},
{
  title: 'Developers',
  links: [
  { label: 'Documentation', to: '/docs' },
  { label: 'API reference', to: '/docs' },
  { label: 'Webhooks', to: '/docs' },
  { label: 'Building a PMS integration', to: '/docs' }]

},
{
  title: 'Resources',
  links: [
  { label: 'Waiver template library', to: '/waiver-templates' },
  { label: 'Industries index', to: '/industries' },
  { label: 'Waiver laws by state', to: '/waiver-laws' },
  { label: 'Blog', to: '/blog' }]

},
{
  title: 'Legal',
  links: [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Legal disclaimer', to: '/#security' }]

}];


export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)_1.1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Digital waivers and electronic signatures for vacation rentals, property managers, and guest activities.
            </p>
          </div>

          {GROUPS.map((group) =>
          <nav key={group.title} id={`footer-${group.title.toLowerCase()}`} aria-label={group.title} className="scroll-mt-24">
              <h2 className="font-display text-sm font-semibold text-ink">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) =>
              <li key={link.label}>
                    <Link
                  to={link.to}
                  className="inline-flex min-h-[32px] items-center text-sm text-ink-muted transition-colors hover:text-primary">
                  
                      {link.label}
                    </Link>
                  </li>
              )}
              </ul>
            </nav>
          )}

          <div>
            <h2 className="font-display text-sm font-semibold text-ink">Contact</h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 inline-flex min-h-[32px] items-center gap-2 text-sm text-ink-muted transition-colors hover:text-primary">
              
              <MailIcon className="h-4 w-4" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
            <p className="mt-2 text-xs leading-relaxed text-ink-subtle">
              Support and partnership enquiries. Replies within one business day.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-hairline pt-6 text-xs leading-relaxed text-ink-subtle">
          <p>
            © {new Date().getFullYear()} RentalWaivers. Individual template, industry, and state pages are indexed
            through the resource pages above and the sitemap.
          </p>
          <p className="mt-2 max-w-4xl">
            RentalWaivers is not a law firm and does not provide legal advice. Templates are starting points and should
            be reviewed by qualified counsel for your jurisdiction and activities.
          </p>
        </div>
      </div>
    </footer>);

}