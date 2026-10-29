// src/features/tableau-de-bord/components/ProjetsParDomaine.tsx

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProjetParDomaine } from '../api/useTableauDeBord';

interface ProjetsParDomaineProps {
  domaines: ProjetParDomaine[] | undefined;
  chargement: boolean;
}

interface SegmentDomaine {
  nom: string;
  valeur: number;
  pourcentage: number;
  couleur: string;
}

// Palette de la carte « Projets par domaine »
const COULEURS = ['#00a651', '#0088cc', '#d97706', '#e11d48', '#8b5cf6', '#64748b'];
const NOMBRE_DOMAINES_AFFICHES = 5;

// Garde les 5 domaines principaux et regroupe le reste dans « Autres ».
function construireSegments(domaines: ProjetParDomaine[]): SegmentDomaine[] {
  const total = domaines.reduce((somme, ligne) => somme + ligne.nombre, 0);
  if (total === 0) return [];

  const principaux = domaines.slice(0, NOMBRE_DOMAINES_AFFICHES);
  const reste = domaines.slice(NOMBRE_DOMAINES_AFFICHES).reduce((somme, ligne) => somme + ligne.nombre, 0);
  const lignes = reste > 0 ? [...principaux, { domaine: 'Autres', nombre: reste }] : principaux;

  return lignes.map((ligne, index) => ({
    nom: ligne.domaine,
    valeur: ligne.nombre,
    pourcentage: Math.round((ligne.nombre / total) * 100),
    couleur: COULEURS[index] ?? COULEURS[COULEURS.length - 1],
  }));
}

interface InfobulleProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: SegmentDomaine }>;
}

function InfobulleDomaine({ active, payload }: InfobulleProps) {
  const segment = payload?.[0]?.payload;
  if (!active || !segment) return null;
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm shadow-md">
      <div className="font-semibold text-slate-800">{segment.nom}</div>
      <div className="text-slate-500">{segment.pourcentage}%</div>
    </div>
  );
}

export function ProjetsParDomaine({ domaines, chargement }: ProjetsParDomaineProps) {
  if (chargement || !domaines) {
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

  const segments = construireSegments(domaines);
  if (segments.length === 0) {
    return <p className="text-sm text-[var(--color-text-secondary)]">Aucun projet en cours pour le moment.</p>;
  }

  const totalProjets = segments.reduce((somme, segment) => somme + segment.valeur, 0);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-48 w-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="valeur"
              nameKey="nom"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              stroke="none"
              isAnimationActive
            >
              {segments.map((segment) => (
                <Cell key={segment.nom} fill={segment.couleur} />
              ))}
            </Pie>
            <Tooltip content={<InfobulleDomaine />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{totalProjets}</span>
          <span className="text-xs text-slate-400">projets en cours</span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {segments.map((segment) => (
          <li key={segment.nom} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: segment.couleur }}
              />
              <span className="truncate font-medium text-slate-600">{segment.nom}</span>
            </span>
            <span className="font-mono font-medium text-slate-500">{segment.pourcentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
