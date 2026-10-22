import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { ContexteTitreBreadcrumb } from '@/contexts/TitreBreadcrumbContext';

const LIBELLES_SEGMENTS: Record<string, string> = {
  presidence: 'Présidence',
  etablissement: 'Établissement',
  decideur: 'Décideur',
  'partenaires-partenariats': 'Partenaires & Partenariats',
  partenaires: 'Partenaires',
  partenariats: 'Partenariats',
  cotutelles: 'Cotutelles',
  projets: 'Projets',
  conventions: 'Conventions',
  documents: 'Documents',
  publications: 'Publications',
  etablissements: 'Établissements',
  referentiels: 'Référentiels',
  archives: 'Archives',
  historique: 'Historique',
  synthese: 'Synthèse annuelle',
  notifications: 'Notifications',
  parametres: 'Paramètres',
  recherche: 'Recherche',
  export: 'Export',
  nouveau: 'Nouveau',
};

const LIBELLES_RACINE: Record<string, string> = {
  presidence: 'Tableau de bord',
  etablissement: 'Tableau de bord',
  decideur: 'Tableau de bord',
};

// Types d'archives acceptes par le backend. Utilise pour detecter les URL
// du type /archives/<type>/<id> ou <type> n'est pas une route mais un filtre.
const TYPES_ARCHIVE = new Set([
  'partenaires',
  'partenariats',
  'projets',
  'conventions',
  'cotutelles',
  'documents',
]);

const PATTERN_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function estUUID(segment: string): boolean {
  return PATTERN_UUID.test(segment);
}

// Detecte le cas /archives/<type>/<id> : le segment <type> est un filtre
// interne, il n'a pas de route autonome et ne doit pas etre cliquable.
function estTypeArchiveDansUrl(
  segments: string[],
  index: number,
): boolean {
  if (index <= 0) return false;
  const precedent = segments[index - 1];
  return precedent === 'archives' && TYPES_ARCHIVE.has(segments[index]);
}

function libelleSegment(
  segment: string,
  estDernier: boolean,
  estRacine: boolean,
  titreContexte: string | null,
): string {
  if (estUUID(segment)) {
    if (estDernier && titreContexte) return titreContexte;
    return 'Détail';
  }
  if (estDernier && estRacine) {
    return LIBELLES_RACINE[segment] ?? segment;
  }
  return LIBELLES_SEGMENTS[segment] ?? segment;
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const ctx = useContext(ContexteTitreBreadcrumb);
  const titreContexte = ctx?.titre ?? null;

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex items-center gap-[7px] text-[13px] font-medium text-[var(--color-text-secondary)]"
    >
      {segments.map((segment, index) => {
        const chemin = '/' + segments.slice(0, index + 1).join('/');
        const estDernier = index === segments.length - 1;
        const estRacine = index === 0;
        const libelle = libelleSegment(segment, estDernier, estRacine, titreContexte);
        const estFiltreNonNavigable = estTypeArchiveDansUrl(segments, index);

        return (
          <span key={chemin} className="flex items-center gap-[7px]">
            {index > 0 && (
              <span aria-hidden="true" className="opacity-55">
                /
              </span>
            )}
            {estDernier ? (
              <span className="font-semibold text-[var(--color-text-primary)]">
                {libelle}
              </span>
            ) : estFiltreNonNavigable ? (
              <span
                className="text-[var(--color-text-secondary)]"
                aria-current="false"
              >
                {libelle}
              </span>
            ) : (
              <Link to={chemin} className="hover:text-[var(--color-brand)]">
                {libelle}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}