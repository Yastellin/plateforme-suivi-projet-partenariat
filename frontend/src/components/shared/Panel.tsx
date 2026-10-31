// src/components/shared/Panel.tsx

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      {children}
    </section>
  );
}

interface PanelHeaderProps {
  titre: string;
  sousTitre?: string;
  action?: ReactNode;
  className?: string;
}

export function PanelHeader({ titre, sousTitre, action, className }: PanelHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-[18px] py-[15px]',
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="titre-panel text-base font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
          {titre}
        </h3>
        {sousTitre ? (
          <p className="mt-0.5 text-xs font-medium text-[var(--color-text-secondary)]">{sousTitre}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}

interface PanelBodyProps {
  children: ReactNode;
  className?: string;
}

export function PanelBody({ children, className }: PanelBodyProps) {
  return <div className={cn('p-[16px_18px]', className)}>{children}</div>;
}
