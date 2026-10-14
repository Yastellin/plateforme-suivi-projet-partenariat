// src/features/tableau-de-bord/components/ActiviteMensuelle.tsx

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CalendarRange } from 'lucide-react';
import { useActiviteMensuelle, type PointActiviteMensuelle } from '../api/useActiviteMensuelle';

const COULEUR_CONVENTIONS = 'var(--color-brand)';
const COULEUR_PROJETS = 'var(--color-brand-moment)';

function formaterMois(mois: string): string {
  const date = new Date(`${mois}-01T00:00:00`);
  return date.toLocaleDateString('fr-FR', { month: 'short' });
}

export function ActiviteMensuelle() {
  const { data, isLoading } = useActiviteMensuelle();

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icone={CalendarRange}
        titre="Activité mensuelle"
        description="Les données d'activité mensuelle seront disponibles prochainement."
      />
    );
  }

  const donnees = data.map((point) => ({
    ...point,
    moisCourt: formaterMois(point.mois),
  }));

  return (
    <div className="flex flex-col gap-2">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={donnees} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="moisCourt"
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
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }} />
          <Bar dataKey="conventions_signees" name="Conventions signées" fill={COULEUR_CONVENTIONS} radius={[3, 3, 0, 0]} />
          <Bar dataKey="projets_soumis" name="Projets soumis" fill={COULEUR_PROJETS} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type { PointActiviteMensuelle };
