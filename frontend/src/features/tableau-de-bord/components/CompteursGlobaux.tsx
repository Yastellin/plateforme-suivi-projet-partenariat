// src/features/tableau-de-bord/components/CompteursGlobaux.tsx

import { Users, FolderKanban, FileCheck2, ClockAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard, KpiGrid } from '@/components/shared/KpiCard';
import type { CompteursTableauDeBord } from '@/types/api';

interface CompteursGlobauxProps {
  compteurs: CompteursTableauDeBord | undefined;
  chargement: boolean;
}

export function CompteursGlobaux({ compteurs, chargement }: CompteursGlobauxProps) {
  if (chargement || !compteurs) {
    return (
      <KpiGrid>
        {[0, 1, 2, 3].map((cle) => (
          <Skeleton key={cle} className="h-[120px] rounded-[var(--radius)]" />
        ))}
      </KpiGrid>
    );
  }

  const signees = (compteurs as { conventions_signees?: number }).conventions_signees
    ?? ((compteurs.repartition_conventions?.SIGNEE ?? 0) + (compteurs.repartition_conventions?.ACTIVE ?? 0));

  return (
    <KpiGrid>
      <KpiCard
        icone={Users}
        libelle="Partenaires actifs"
        valeur={compteurs.partenaires_actifs ?? compteurs.partenaires ?? 0}
      />
      <KpiCard
        icone={FolderKanban}
        libelle="Projets en cours"
        valeur={compteurs.projets_en_cours ?? compteurs.projets ?? 0}
      />
      <KpiCard
        icone={FileCheck2}
        libelle="Conventions signées"
        valeur={signees}
      />
      <KpiCard
        icone={ClockAlert}
        libelle="Conventions à échéance"
        valeur={compteurs.conventions_a_echeance ?? 0}
        critique
      />
    </KpiGrid>
  );
}
