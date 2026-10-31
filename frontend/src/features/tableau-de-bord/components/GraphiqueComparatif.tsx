// src/features/tableau-de-bord/components/GraphiqueComparatif.tsx

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComparatifEtablissement } from '@/types/api';

interface GraphiqueComparatifProps {
  donnees: ComparatifEtablissement[] | undefined;
  chargement: boolean;
}

interface EtiquetteEtablissementProps {
  x?: number;
  y?: number;
  payload?: { value: string; index: number };
  donnees: ComparatifEtablissement[];
}

function initialesDe(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? '')
    .join('');
}

/** Libellé de l'axe : logo choisi par l'établissement (ou initiales) puis son nom. */
function EtiquetteEtablissement({ x = 0, y = 0, payload, donnees }: EtiquetteEtablissementProps) {
  const nom = payload?.value ?? '';
  const etablissement = payload ? donnees[payload.index] : undefined;
  const logo = etablissement?.etablissement_logo_url;
  const libelleCourt = nom.length > 16 ? `${nom.slice(0, 15)}…` : nom;

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{nom}</title>
      {logo ? (
        <image href={logo} x={-12} y={4} width={24} height={24} preserveAspectRatio="xMidYMid meet" />
      ) : (
        <>
          <circle cx={0} cy={16} r={12} fill="var(--color-page-bg)" stroke="var(--color-border)" />
          <text x={0} y={20} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="var(--color-text-secondary)">
            {initialesDe(nom) || '—'}
          </text>
        </>
      )}
      <text x={0} y={44} textAnchor="middle" fontSize={11.5} fill="var(--color-text-secondary)">
        {libelleCourt}
      </text>
    </g>
  );
}

export function GraphiqueComparatif({ donnees, chargement }: GraphiqueComparatifProps) {
  const donneesSecurisees = Array.isArray(donnees) ? donnees : [];

  if (chargement) {
    return <Skeleton className="h-[260px] w-full" />;
  }

  if (donneesSecurisees.length === 0) {
    return (
      <p className="py-10 text-center text-[13px] text-[var(--color-text-secondary)]">
        Aucune donnée comparative disponible.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={donneesSecurisees} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="etablissement_nom"
          height={60}
          interval={0}
          tick={<EtiquetteEtablissement donnees={donneesSecurisees} />}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11.5, fill: 'var(--color-text-secondary)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12.5,
          }}
        />
        <Bar dataKey="partenaires_actifs" name="Partenaires" fill="var(--color-brand)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="projets_en_cours" name="Projets" fill="var(--color-brand-moment)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}