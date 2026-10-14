// src/features/synthese/components/SyntheseCompteurs.tsx
import { CalendarX2, FolderKanban, FileCheck2, GraduationCap, Users } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiGrid } from '@/components/shared/KpiGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { SyntheseCompteurs as CompteursSynthese } from '@/types/api';
import { compteursVides } from '../lib/synthese';

interface SyntheseCompteursProps {
  compteurs: CompteursSynthese | undefined;
  enChargement?: boolean;
  className?: string;
}

/** Les cinq compteurs de la synthèse d'un établissement. */
export function SyntheseCompteurs({ compteurs, enChargement = false, className }: SyntheseCompteursProps) {
  if (enChargement || !compteurs) {
    return (
      <KpiGrid className={cn('lg:grid-cols-5', className)}>
        {[0, 1, 2, 3, 4].map((cle) => (
          <Skeleton key={cle} className="h-[120px] rounded-[var(--radius)]" />
        ))}
      </KpiGrid>
    );
  }

  const valeurs = { ...compteursVides(), ...compteurs };

  return (
    <KpiGrid className={cn('lg:grid-cols-5', className)}>
      <KpiCard icone={<Users className="h-4 w-4" />} libelle="Partenaires" valeur={valeurs.partenaires} />
      <KpiCard
        icone={<FileCheck2 className="h-4 w-4" />}
        libelle="Conventions actives"
        valeur={valeurs.conventions_actives}
      />
      <KpiCard
        icone={<CalendarX2 className="h-4 w-4" />}
        libelle="Conventions expirées"
        valeur={valeurs.conventions_expirees}
        critique={valeurs.conventions_expirees > 0}
      />
      <KpiCard icone={<GraduationCap className="h-4 w-4" />} libelle="Cotutelles" valeur={valeurs.cotutelles} />
      <KpiCard
        icone={<FolderKanban className="h-4 w-4" />}
        libelle="Projets actifs"
        valeur={valeurs.projets_actifs}
      />
    </KpiGrid>
  );
}
