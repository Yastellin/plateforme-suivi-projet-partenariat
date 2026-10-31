import type {
  FiltresExport,
  FormatExport,
  PorteeExport,
  StatutExport,
} from '../types/export.types';

export const LIBELLES_PORTEE: Record<PorteeExport, string> = {
  TOUT: 'Toutes les données',
  CONVENTIONS: 'Conventions',
  PROJETS: 'Projets',
  PARTENARIATS: 'Partenariats',
  PARTENAIRES: 'Partenaires',
};

export const LIBELLES_STATUT: Record<StatutExport, string> = {
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  EN_RETARD: 'En retard',
  SUSPENDU: 'Suspendu',
  EXPIRE: 'Expiré',
};

export const LIBELLES_FORMAT: Record<FormatExport, string> = {
  XLSX: 'Excel (.xlsx)',
  CSV: 'CSV (.zip)',
  PDF: 'PDF (.pdf)',
};

export function resumePeriode(filtres: FiltresExport): string {
  const periode = filtres.periode;
  if (periode.mode === 'TOUT') return 'Toutes les périodes';
  if (periode.mode === 'ANNEE') return `Année ${periode.annee}`;
  if (periode.mode === 'MOIS') {
    const mois = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' })
      .format(new Date(Date.UTC(2000, periode.mois ?? 0, 1)));
    return `${mois.charAt(0).toLocaleUpperCase('fr-FR')}${mois.slice(1)} ${periode.annee}`;
  }
  return `Du ${formaterDateCourte(periode.du)} au ${formaterDateCourte(periode.au)}`;
}

export function resumeFiltres(filtres: FiltresExport): string {
  const statuts = filtres.statuts.length
    ? filtres.statuts.map((statut) => LIBELLES_STATUT[statut]).join(', ')
    : 'Aucun statut sélectionné';
  return `${LIBELLES_PORTEE[filtres.portee]} · ${resumePeriode(filtres)} · ${statuts}`;
}

export function formaterDateCourte(date?: string | null): string {
  if (!date) return '—';
  const valeur = new Date(date.length === 10 ? `${date}T00:00:00` : date);
  return Number.isNaN(valeur.getTime())
    ? '—'
    : valeur.toLocaleDateString('fr-FR');
}

export function formaterDateHeure(date: string): string {
  const valeur = new Date(date);
  return Number.isNaN(valeur.getTime())
    ? '—'
    : valeur.toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
}

export function compterFichiersSelonPortee(portee: PorteeExport): number {
  return portee === 'TOUT' ? 4 : 1;
}
