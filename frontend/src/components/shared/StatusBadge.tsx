// src/components/shared/StatusBadge.tsx

import type { ToneStatut } from '@/lib/status-mappings';

export type StatutMetier = ToneStatut;

interface StatusBadgeProps {
  statut?: string;
  libelle?: string;
  tonalite?: ToneStatut;
}

const CLASSES_TONALITE: Record<ToneStatut, string> = {
  brouillon: 'bg-[var(--status-brouillon-bg)] text-[var(--status-brouillon-fg)]',
  attente: 'bg-[var(--status-attente-bg)] text-[var(--status-attente-fg)]',
  actif: 'bg-[var(--status-actif-bg)] text-[var(--status-actif-fg)]',
  expire: 'bg-[var(--status-expire-bg)] text-[var(--status-expire-fg)]',
  archive: 'bg-[var(--status-archive-bg)] text-[var(--status-archive-fg)]',
};

const STATUTS: Record<string, { libelle: string; tonalite: ToneStatut }> = {
  BROUILLON: { libelle: 'Brouillon', tonalite: 'brouillon' },
  EN_ATTENTE_SIGNATURE: { libelle: 'En attente de signature', tonalite: 'attente' },
  EN_ATTENTE: { libelle: 'En attente', tonalite: 'attente' },
  SIGNEE: { libelle: 'Signée', tonalite: 'actif' },
  ACTIVE: { libelle: 'Active', tonalite: 'actif' },
  EN_COURS: { libelle: 'En cours', tonalite: 'actif' },
  ACTIF: { libelle: 'Actif', tonalite: 'actif' },
  SUSPENDUE: { libelle: 'Suspendue', tonalite: 'attente' },
  SUSPENDU: { libelle: 'Suspendu', tonalite: 'attente' },
  EXPIREE: { libelle: 'Expirée', tonalite: 'expire' },
  EXPIRE: { libelle: 'Expiré', tonalite: 'expire' },
  TERMINE: { libelle: 'Terminé', tonalite: 'archive' },
  ARCHIVE: { libelle: 'Archivé', tonalite: 'archive' },
};

export function StatusBadge({ statut, libelle, tonalite }: StatusBadgeProps) {
  const statutNormalise = (statut ?? '').trim().toUpperCase().replace(/[-\s]+/g, '_');
  const meta = libelle && tonalite ? { libelle, tonalite } : STATUTS[statutNormalise] ?? { libelle: libelle ?? 'Statut', tonalite: tonalite ?? 'attente' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-[3px] text-xs font-semibold ${CLASSES_TONALITE[meta.tonalite]}`}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {meta.libelle}
    </span>
  );
}