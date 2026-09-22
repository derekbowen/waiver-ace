import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  as?: 'div' | 'section' | 'article' | 'li';
}

export function Card({ className, children, as: Tag = 'div' }: CardProps) {
  return (
    <Tag className={twMerge('rounded-xl border border-hairline bg-surface shadow-card', className)}>{children}</Tag>);

}

export function CardHeader({ className, children }: {className?: string;children: React.ReactNode;}) {
  return (
    <div className={twMerge('flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4', className)}>
      {children}
    </div>);

}

export function CardTitle({ children, id }: {children: React.ReactNode;id?: string;}) {
  return (
    <h3 id={id} className="font-display text-base font-semibold text-ink">
      {children}
    </h3>);

}

export function CardBody({ className, children }: {className?: string;children: React.ReactNode;}) {
  return <div className={twMerge('p-5', className)}>{children}</div>;
}