// src/features/tableau-de-bord/components/CompteursGlobaux.tsx

import { Handshake, FolderKanban, FileCheck2, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { CompteursTableauDeBord } from '@/types/api';

interface CompteursGlobauxProps {
  compteurs: CompteursTableauDeBord | undefined;
  chargement: boolean;
}

interface CarteCompteur {
  icone: LucideIcon;
  libelle: string;
  valeur: number;
  critique?: boolean;
}

export function CompteursGlobaux({ compteurs, chargement }: CompteursGlobauxProps) {
  if (chargement || !compteurs) {
    return (
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((cle) => (
          <Skeleton key={cle} className="h-[104px] rounded-[var(--radius)]" />
        ))}
      </div>
    );
  }

  const cartes: CarteCompteur[] = [
    { icone: Handshake, libelle: 'Partenaires actifs', valeur: compteurs.partenaires_actifs },
    { icone: FolderKanban, libelle: 'Projets en cours', valeur: compteurs.projets_en_cours },
    { icone: FileCheck2, libelle: 'Conventions actives', valeur: compteurs.conventions_actives },
    { icone: TriangleAlert, libelle: 'Conventions à échéance', valeur: compteurs.conventions_a_echeance, critique: true },
  ];

  return (
    <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cartes.map((carte) => {
        const Icone = carte.icone;

        return (
          <div
            key={carte.libelle}
            className={
              carte.critique
                ? 'relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-brand-moment)] bg-[var(--color-surface)] p-[20px_20px_18px] shadow-[var(--shadow-sm)]'
                : 'relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[20px_20px_18px] shadow-[var(--shadow-sm)]'
            }
          >
            {carte.critique ? <div className="woven-accent absolute inset-x-0 top-0" /> : null}

            <div className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
              <Icone className={carte.critique ? 'h-3.5 w-3.5 text-[var(--status-attente-fg)]' : 'h-3.5 w-3.5 text-[var(--color-brand)]'} />
              {carte.libelle}
            </div>

            <div className="text-[30px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
              {carte.valeur}
            </div>
          </div>
        );
      })}
    </div>
  );
}