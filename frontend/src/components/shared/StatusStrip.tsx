// src/components/shared/StatusStrip.tsx

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToneStatusStrip = 'attention' | 'info' | 'ok';

export interface ItemStatusStrip {
  icone: LucideIcon;
  titre: string;
  description: string;
  tonalite: ToneStatusStrip;
}

interface StatusStripProps {
  items: ItemStatusStrip[];
}

const CLASSES_TONALITE: Record<ToneStatusStrip, string> = {
  attention: 'bg-[var(--status-attente-bg)] text-[var(--status-attente-fg)]',
  info: 'bg-[var(--status-info-bg)] text-[var(--status-info-fg)]',
  ok: 'bg-[var(--status-actif-bg)] text-[var(--status-actif-fg)]',
};

export function StatusStrip({ items }: StatusStripProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-5 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px_20px] shadow-[var(--shadow-sm)] sm:grid-cols-3">
      {items.map((item, index) => {
        const Icone = item.icone;
        const estDernier = index === items.length - 1;

        return (
          <div
            key={item.titre}
            className={cn(
              'flex items-center gap-3.5',
              !estDernier && 'border-b border-[var(--color-border)] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5',
            )}
          >
            <div className={cn('grid h-10 w-10 flex-shrink-0 place-items-center rounded-[var(--radius-sm)]', CLASSES_TONALITE[item.tonalite])}>
              <Icone className="h-[18px] w-[18px]" />
            </div>
            <div>
              <strong className="block text-[13.5px] font-bold">{item.titre}</strong>
              <span className="mt-0.5 block text-xs text-[var(--color-text-secondary)]">{item.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}