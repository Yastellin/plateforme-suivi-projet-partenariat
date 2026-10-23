import type { Convention } from '@/types/api';

const NOMBRE_PRIORITES = 5;
const JOUR_EN_MS = 86_400_000;

export function joursAvantEcheance(
  dateFin: string | undefined,
  maintenant: number,
): number | null {
  if (!dateFin) return null;
  const date = new Date(dateFin).getTime();
  return Number.isNaN(date) ? null : Math.ceil((date - maintenant) / JOUR_EN_MS);
}

function niveauPriorite(convention: Convention, maintenant: number): number {
  const jours = joursAvantEcheance(convention.date_fin, maintenant);
  if (convention.statut === 'EXPIREE' || (jours !== null && jours < 0)) return 0;
  if (convention.statut === 'EN_ATTENTE_SIGNATURE') return 1;
  if (jours !== null && jours <= 30) return 2;
  if (convention.statut === 'SUSPENDUE') return 3;
  if (convention.statut === 'BROUILLON') return 4;
  return 5;
}

export function selectionnerConventionsPrioritaires(
  conventions: Convention[],
  maintenant: number,
): Convention[] {
  return conventions
    .filter((convention) => niveauPriorite(convention, maintenant) < 5)
    .sort((a, b) => {
      const priorite =
        niveauPriorite(a, maintenant) - niveauPriorite(b, maintenant);
      if (priorite !== 0) return priorite;

      const dateA = a.date_fin
        ? new Date(a.date_fin).getTime()
        : Number.POSITIVE_INFINITY;
      const dateB = b.date_fin
        ? new Date(b.date_fin).getTime()
        : Number.POSITIVE_INFINITY;
      return dateA - dateB;
    })
    .slice(0, NOMBRE_PRIORITES);
}

export function libelleEcheance(
  convention: Convention,
  maintenant: number,
): string {
  const jours = joursAvantEcheance(convention.date_fin, maintenant);
  if (jours === null) {
    if (convention.statut === 'EN_ATTENTE_SIGNATURE') {
      return 'Signature en attente';
    }
    if (convention.statut === 'SUSPENDUE') return 'Convention suspendue';
    return 'Échéance à renseigner';
  }
  if (jours < 0) return `Échue depuis ${Math.abs(jours)} j`;
  if (jours === 0) return 'Échéance aujourd’hui';
  return `Échéance dans ${jours} j`;
}
