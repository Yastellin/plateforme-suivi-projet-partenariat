// src/components/shared/PageHeader.tsx

import type { ReactNode } from 'react';

interface PageHeaderProps {
  titre: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({ titre, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-[22px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
            {titre}
          </h1>
          {badge ?? null}
        </div>
        {description ? (
          <p className="mt-2 text-[15px] font-normal text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}
