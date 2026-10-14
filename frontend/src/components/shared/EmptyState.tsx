// src/components/shared/EmptyState.tsx

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icone?: LucideIcon;
  icon?: LucideIcon;
  titre: string;
  description?: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ icone, icon, titre, description, message, action }: EmptyStateProps) {
  const Icone = icone ?? icon;
  const contenu = description ?? message ?? 'Aucune donnée disponible.';

  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-14 text-center">
      {Icone ? <Icone className="h-12 w-12 text-[var(--color-text-secondary)]" strokeWidth={1.5} /> : null}
      <p className="text-[13.5px] font-semibold text-[var(--color-text-primary)]">{titre}</p>
      <p className="max-w-[360px] text-[12.5px] text-[var(--color-text-secondary)]">{contenu}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}