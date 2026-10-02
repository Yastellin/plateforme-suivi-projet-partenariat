// src/features/tableau-de-bord/components/GraphiqueComparatif.tsx

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComparatifEtablissement } from '@/types/api';

interface GraphiqueComparatifProps {
  donnees: ComparatifEtablissement[] | undefined;
  chargement: boolean;
}

export function GraphiqueComparatif({ donnees, chargement }: GraphiqueComparatifProps) {
  if (chargement) {
    return <Skeleton className="h-[260px] w-full" />;
  }

  if (!donnees || donnees.length === 0) {
    return (
      <p className="py-10 text-center text-[13px] text-[var(--color-text-secondary)]">
        Aucune donnée comparative disponible.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={donnees} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="etablissement_nom"
          tick={{ fontSize: 11.5, fill: 'var(--color-text-secondary)' }}
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
        <Bar dataKey="partenaires" name="Partenaires" fill="var(--color-brand)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="projets_actifs" name="Projets actifs" fill="var(--color-brand-moment)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}