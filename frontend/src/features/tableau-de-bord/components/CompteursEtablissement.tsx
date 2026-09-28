// src/features/tableau-de-bord/components/CompteursEtablissement.tsx

import { Handshake, FolderKanban } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { CompteursTableauDeBord } from '@/types/api';

interface CompteursEtablissementProps {
  compteurs: CompteursTableauDeBord | undefined;
  chargement: boolean;
}

interface CarteCompteur {
  icone: LucideIcon;
  libelle: string;
  valeur: number;
}

export function CompteursEtablissement({ compteurs, chargement }: CompteursEtablissementProps) {
  if (chargement || !compteurs) {
    return (
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Skeleton className="h-[104px] rounded-[var(--radius)]" />
        <Skeleton className="h-[104px] rounded-[var(--radius)]" />
      </div>
    );
  }

  const cartes: CarteCompteur[] = [
    { icone: Handshake, libelle: 'Partenaires actifs', valeur: compteurs.partenaires_actifs },
    { icone: FolderKanban, libelle: 'Projets en cours', valeur: compteurs.projets_en_cours },
  ];

  return (
    <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {cartes.map((carte) => {
        const Icone = carte.icone;

        return (
          <div
            key={carte.libelle}
            className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[20px_20px_18px] shadow-[var(--shadow-sm)]"
          >
            <div className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold text-[var(--color-text-secondary)]">
              <Icone className="h-3.5 w-3.5 text-[var(--color-brand)]" />
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