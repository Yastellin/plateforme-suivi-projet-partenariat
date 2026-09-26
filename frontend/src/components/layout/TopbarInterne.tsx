// src/components/layout/TopbarInterne.tsx

import { Search, Bell, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Breadcrumbs } from './Breadcrumbs';
import { ThemeToggle } from './ThemeToggle';

interface TopbarInterneProps {
  onOuvrirRecherche: () => void;
  onOuvrirNotifications: () => void;
}

const LIBELLES_ROLE: Record<string, string> = {
  PRESIDENCE: 'Présidence',
  ETABLISSEMENT: 'Établissement',
  DECIDEUR: 'Décideur',
};

function initiales(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export function TopbarInterne({ onOuvrirRecherche, onOuvrirNotifications }: TopbarInterneProps) {
  const { utilisateur } = useAuth();

  return (
    <header className="flex h-[58px] flex-shrink-0 items-center gap-4 border-b border-[var(--color-chrome-border)] bg-[var(--color-chrome-bg)] px-6">
      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-2.5">
        <button
          onClick={onOuvrirRecherche}
          className="flex h-9 min-w-[300px] items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] bg-[var(--color-page-bg)] px-3 text-left text-[13px] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)]"
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1">Rechercher…</span>
          <kbd className="ml-auto rounded border border-[var(--color-chrome-border)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10.5px]">
            ⌘K
          </kbd>
        </button>

        <ThemeToggle />

        <button
          onClick={onOuvrirNotifications}
          aria-label="Ouvrir les notifications"
          className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)]"
        >
          <Bell className="h-4 w-4" />
        </button>

        <button className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)]">
          <Plus className="h-3.5 w-3.5" />
          Nouveau projet
        </button>

        {utilisateur ? (
          <div className="ml-1 flex h-[58px] cursor-pointer items-center gap-2.5 border-l border-[var(--color-chrome-border)] pl-3.5 hover:bg-[var(--color-chrome-hover)]">
            <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[var(--color-brand)] text-[11.5px] font-bold text-white">
              {initiales(utilisateur.email)}
            </div>
            <div className="hidden leading-tight sm:block">
              <strong className="block text-[13px] font-semibold">{utilisateur.email}</strong>
              <span className="block text-[11.5px] text-[var(--color-text-secondary)]">
                {LIBELLES_ROLE[utilisateur.role] ?? utilisateur.role}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}