// src/features/synthese/components/SyntheseComparatif.tsx
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { LigneComparatifEtablissement } from '../lib/synthese';

interface SyntheseComparatifProps {
  lignes: LigneComparatifEtablissement[];
  enChargement?: boolean;
}

/** Comparatif graphique des compteurs, établissement par établissement. */
export function SyntheseComparatif({ lignes, enChargement = false }: SyntheseComparatifProps) {
  const donnees = Array.isArray(lignes) ? lignes : [];

  if (enChargement) {
    return <Skeleton className="h-[280px] w-full" />;
  }

  if (donnees.length === 0) {
    return (
      <p className="py-10 text-center text-[13px] text-[var(--color-text-secondary)]">
        Aucun établissement à comparer pour cette année.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={donnees} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="libelle_court"
          tick={{ fontSize: 11.5, fill: 'var(--color-text-secondary)' }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
          interval={0}
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
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="partenaires" name="Partenaires" fill="var(--color-brand)" radius={[3, 3, 0, 0]} />
        <Bar
          dataKey="conventions_actives"
          name="Conventions actives"
          fill="var(--chart-circuit)"
          radius={[3, 3, 0, 0]}
        />
        <Bar
          dataKey="projets_actifs"
          name="Projets actifs"
          fill="var(--color-brand-moment)"
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
