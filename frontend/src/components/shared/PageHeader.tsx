import type { ReactNode } from 'react';

interface PageHeaderProps {
  titre: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ titre, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-[22px] flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--color-text-primary)]">{titre}</h1>
        {description ? <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{description}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
