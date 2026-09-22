import React from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const BASE =
'inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-ink-inverse border-brand hover:bg-brand-hover hover:border-brand-hover',
  secondary: 'bg-surface text-ink border-hairline-strong hover:bg-sunken',
  ghost: 'bg-transparent text-ink-muted border-transparent hover:bg-sunken hover:text-ink',
  danger: 'bg-alert text-ink-inverse border-alert hover:opacity-90',
  accent: 'bg-gold text-ink-inverse border-gold hover:opacity-90'
};

/** All sizes keep a >=44px touch target on small screens. */
const SIZES: Record<Size, string> = {
  sm: 'text-sm px-3 py-2 min-h-[44px] sm:min-h-[36px]',
  md: 'text-sm px-4 py-2.5 min-h-[44px]',
  lg: 'text-base px-5 py-3 min-h-[48px]'
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={twMerge(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </button>);

}

interface LinkButtonProps extends CommonProps {
  to: string;
  'aria-label'?: string;
}

export function LinkButton({ to, variant = 'primary', size = 'md', className, children, ...rest }: LinkButtonProps) {
  return (
    <Link to={to} className={twMerge(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </Link>);

}