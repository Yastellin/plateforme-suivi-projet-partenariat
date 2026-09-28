// src/components/shared/EmptyState.tsx

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icone: LucideIcon;
  titre: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icone: Icone, titre, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-14 text-center">
      <Icone className="h-12 w-12 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
      <p className="text-[13.5px] font-semibold text-[var(--color-text-primary)]">{titre}</p>
      <p className="max-w-[360px] text-[12.5px] text-[var(--color-text-secondary)]">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}