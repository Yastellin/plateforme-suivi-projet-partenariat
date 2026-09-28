// src/components/layout/NotificationsDrawer.tsx

import { X, Bell, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationsDrawerProps {
  ouvert: boolean;
  onFermer: () => void;
}

export function NotificationsDrawer({ ouvert, onFermer }: NotificationsDrawerProps) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity',
          ouvert ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onFermer}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-[400px] max-w-[92vw] flex-col border-l border-[var(--color-border)]',
          'bg-[var(--color-surface)] shadow-[var(--shadow-md)] transition-transform duration-200 ease-out',
          ouvert ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-[var(--color-brand)]" />
            <h3 className="text-[15px] font-bold">Notifications</h3>
          </div>
          <button
            onClick={onFermer}
            aria-label="Fermer le panneau de notifications"
            className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <Inbox className="h-12 w-12 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
          <p className="text-[13.5px] font-semibold text-[var(--color-text-primary)]">Aucune notification pour le moment</p>
          <p className="text-[12.5px] text-[var(--color-text-secondary)]">
            Vous serez averti ici des nouveaux projets soumis et des échéances importantes.
          </p>
        </div>
      </aside>
    </>
  );
}