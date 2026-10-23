// src/components/layout/TopbarInterne.tsx

import { Search, Bell, Plus, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { AvatarCompte } from '@/components/shared/AvatarCompte';
import { nomAffichageUtilisateur } from '@/lib/utilisateur-utils';
import { Breadcrumbs } from './Breadcrumbs';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';
import { useEtablissement } from '@/features/etablissements/api/useEtablissement';

interface TopbarInterneProps {
  onOuvrirRecherche: () => void;
  onOuvrirNotifications: () => void;
  onOuvrirMenu?: () => void;
}

const LIBELLES_ROLE: Record<string, string> = {
  PRESIDENCE: 'Présidence',
  ETABLISSEMENT: 'Établissement',
  DECIDEUR: 'Décideur',
};

export function TopbarInterne({ onOuvrirRecherche, onOuvrirNotifications, onOuvrirMenu }: TopbarInterneProps) {
  const { utilisateur } = useAuth();
  const permissions = usePermissions();
  const { data: etablissementCompte } = useEtablissement(
    utilisateur?.role === 'ETABLISSEMENT'
      ? utilisateur.etablissement_id ?? undefined
      : undefined,
  );

  const peutAfficherCloche = permissions.estPresidence || permissions.estEtablissement;
  // La route /presidence/projets/nouveau n'existe pas encore : bouton masqué.
  const peutAfficherNouveauProjet = false;

  return (
    <header className="flex h-[58px] flex-shrink-0 items-center gap-4 border-b border-[var(--color-chrome-border)] bg-[var(--color-chrome-bg)] px-6">
      {onOuvrirMenu ? (
        <button
          type="button"
          onClick={onOuvrirMenu}
          aria-label="Ouvrir la navigation"
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      ) : null}

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-2.5">
        <button
          onClick={onOuvrirRecherche}
          className="hidden h-9 min-w-[320px] items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] bg-[var(--color-page-bg)] px-3 text-left text-[13px] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] md:flex"
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1">Rechercher un partenaire, une convention…</span>
          <kbd className="ml-auto rounded border border-[var(--color-chrome-border)] bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10.5px]">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onOuvrirRecherche}
          aria-label="Rechercher"
          className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)] md:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <ThemeToggle />

        {peutAfficherCloche ? (
          <button
            onClick={onOuvrirNotifications}
            aria-label="Ouvrir les notifications"
            className="relative grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)]"
          >
            <Bell className="h-4 w-4" />
            <NotificationBadge className="absolute -right-1 -top-1" />
          </button>
        ) : null}

        {peutAfficherNouveauProjet ? (
          <button className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-hover)]">
            <Plus className="h-3.5 w-3.5" />
            Nouveau projet
          </button>
        ) : null}

        {utilisateur ? (
          <div className="ml-1 flex h-[58px] cursor-pointer items-center gap-2.5 border-l border-[var(--color-chrome-border)] pl-3.5 hover:bg-[var(--color-chrome-hover)]">
            <AvatarCompte
              role={utilisateur.role}
              email={utilisateur.email}
              logoEtablissement={etablissementCompte?.logo_url}
              nomEtablissement={
                etablissementCompte?.nom ?? utilisateur.etablissement_nom
              }
            />
            <div className="hidden leading-tight sm:block">
              <strong className="block text-[13px] font-semibold">{nomAffichageUtilisateur(utilisateur.email)}</strong>
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
