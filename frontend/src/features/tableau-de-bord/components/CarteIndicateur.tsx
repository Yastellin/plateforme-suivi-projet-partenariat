// src/features/tableau-de-bord/components/CarteIndicateur.tsx

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type ThemeIndicateur = 'emerald' | 'blue' | 'violet' | 'amber';

// Classes complètes (et non construites) pour que Tailwind les détecte.
// Les classes kpi-* ne s'appliquent qu'en mode sombre (voir design-tokens-uf.css)
const THEMES: Record<ThemeIndicateur, { bordure: string; icone: string; carte: string; iconeSombre: string }> = {
  emerald: { bordure: 'border-emerald-200', icone: 'bg-emerald-100 text-emerald-600', carte: 'kpi-carte-emerald', iconeSombre: 'kpi-icone-emerald' },
  blue: { bordure: 'border-blue-200', icone: 'bg-blue-100 text-blue-600', carte: 'kpi-carte-blue', iconeSombre: 'kpi-icone-blue' },
  violet: { bordure: 'border-violet-200', icone: 'bg-violet-100 text-violet-600', carte: 'kpi-carte-violet', iconeSombre: 'kpi-icone-violet' },
  amber: { bordure: 'border-amber-200', icone: 'bg-amber-100 text-amber-600', carte: 'kpi-carte-amber', iconeSombre: 'kpi-icone-amber' },
};

interface CarteIndicateurProps {
  titre: string;
  valeur: number;
  icone: ReactNode;
  theme: ThemeIndicateur;
  /** Lien d'action en bas de carte (affiché en vert/bleu) */
  lien?: { libelle: string; chemin: string };
  /** Texte descriptif en bas de carte (gris), utilisé si pas de lien */
  pied?: string;
}

export function CarteIndicateur({ titre, valeur, icone, theme, lien, pied }: CarteIndicateurProps) {
  const classes = THEMES[theme];
  const couleurLien = theme === 'blue' ? 'text-blue-600' : 'text-emerald-600';

  return (
    <article
      className={cn(
        'rounded-2xl border bg-white p-5 transition-shadow duration-200 hover:shadow-md',
        classes.bordure,
        classes.carte,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('grid h-10 w-10 place-items-center rounded-xl', classes.icone, classes.iconeSombre)}
      >
        {icone}
      </span>

      <h3 className="kpi-titre mt-4 text-sm font-medium text-slate-500">{titre}</h3>

      <p className="kpi-valeur mt-1 text-3xl font-bold tabular-nums leading-none text-slate-900 dark:text-white">{valeur}</p>

      <div className="mt-3 text-xs font-medium">
        {lien ? (
          <Link to={lien.chemin} className={cn('font-medium hover:underline', couleurLien)}>
            {lien.libelle}
          </Link>
        ) : (
          <span className="kpi-pied text-slate-500">{pied}</span>
        )}
      </div>
    </article>
  );
}
