// src/features/tableau-de-bord/components/RepartitionProjetsParStatut.tsx

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { LIBELLES_STATUT_PROJET } from '@/lib/status-mappings';
import type { StatutProjet } from '@/types/api';

interface RepartitionProjetsParStatutProps {
  projetsParStatut: Record<StatutProjet, number> | undefined;
  chargement: boolean;
}

interface SegmentStatut {
  statut: StatutProjet;
  libelle: string;
  valeur: number;
  pourcentage: number;
  couleur: string;
}

// Ordre et couleurs : tous les statuts possibles de projet
const ORDRE_STATUTS: { statut: StatutProjet; couleur: string }[] = [
  { statut: 'EN_COURS', couleur: '#00a651' },
  { statut: 'TERMINE', couleur: '#0088cc' },
  { statut: 'EN_ATTENTE', couleur: '#d97706' },
  { statut: 'SUSPENDU', couleur: '#e11d48' },
  { statut: 'EXPIRE', couleur: '#8b5cf6' },
  { statut: 'BROUILLON', couleur: '#64748b' },
];

function construireSegments(compteurs: Record<StatutProjet, number>): SegmentStatut[] {
  const total = ORDRE_STATUTS.reduce((somme, { statut }) => somme + (compteurs[statut] ?? 0), 0);
  return ORDRE_STATUTS.map(({ statut, couleur }) => {
    const valeur = compteurs[statut] ?? 0;
    return {
      statut,
      libelle: LIBELLES_STATUT_PROJET[statut].libelle,
      valeur,
      pourcentage: total > 0 ? Math.round((valeur / total) * 100) : 0,
      couleur,
    };
  });
}

interface InfobulleProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: SegmentStatut }>;
}

function InfobulleStatut({ active, payload }: InfobulleProps) {
  const segment = payload?.[0]?.payload;
  if (!active || !segment) return null;
  return (
    <div className="infobulle-sombre rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm shadow-md">
      <div className="texte-fort-sombre font-semibold text-slate-800">{segment.libelle}</div>
      <div className="texte-doux-sombre text-slate-500">
        {segment.valeur} projet{segment.valeur > 1 ? 's' : ''} · {segment.pourcentage}%
      </div>
    </div>
  );
}

export function RepartitionProjetsParStatut({ projetsParStatut, chargement }: RepartitionProjetsParStatutProps) {
  if (chargement || !projetsParStatut) {
    return (
      <div className="flex items-center gap-6">
        <Skeleton className="h-40 w-40 rounded-full" />
        <div className="flex flex-1 flex-col gap-3">
          {[0, 1, 2, 3].map((cle) => (
            <Skeleton key={cle} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const segments = construireSegments(projetsParStatut);
  const totalProjets = segments.reduce((somme, segment) => somme + segment.valeur, 0);

  if (totalProjets === 0) {
    return <p className="text-sm text-[var(--color-text-secondary)]">Aucun projet pour le moment.</p>;
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-48 w-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments.filter((segment) => segment.valeur > 0)}
              dataKey="valeur"
              nameKey="libelle"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              stroke="none"
              isAnimationActive
            >
              {segments
                .filter((segment) => segment.valeur > 0)
                .map((segment) => (
                  <Cell key={segment.statut} fill={segment.couleur} />
                ))}
            </Pie>
            <Tooltip content={<InfobulleStatut />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="texte-fort-sombre text-2xl font-bold text-slate-800">{totalProjets}</span>
          <span className="texte-doux-sombre text-xs text-slate-400">projets</span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {segments.map((segment) => (
          <li key={segment.statut} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: segment.couleur }}
              />
              <span className="texte-moyen-sombre truncate font-medium text-slate-600">{segment.libelle}</span>
            </span>
            <span className="texte-doux-sombre font-mono font-medium text-slate-500">{segment.pourcentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
