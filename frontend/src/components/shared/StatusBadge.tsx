// src/components/shared/StatusBadge.tsx

import { obtenirInfoStatut, type ToneStatut } from '@/lib/status-mappings';

interface StatusBadgeProps {
  libelle?: string;
  tonalite?: ToneStatut;
  statut?: string | null;
}

const CLASSES_TONALITE: Record<ToneStatut, string> = {
  brouillon: 'bg-[var(--status-brouillon-bg)] text-[var(--status-brouillon-fg)]',
  attente: 'bg-[var(--status-attente-bg)] text-[var(--status-attente-fg)]',
  actif: 'bg-[var(--status-actif-bg)] text-[var(--status-actif-fg)]',
  expire: 'bg-[var(--status-expire-bg)] text-[var(--status-expire-fg)]',
  archive: 'bg-[var(--status-archive-bg)] text-[var(--status-archive-fg)]',
};

export function StatusBadge({ libelle, tonalite, statut }: StatusBadgeProps) {
  const info = statut ? obtenirInfoStatut(statut) : { libelle: libelle ?? '-', tonalite: tonalite ?? 'archive' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-[3px] text-xs font-semibold ${CLASSES_TONALITE[info.tonalite]}`}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {info.libelle}
    </span>
  );
}