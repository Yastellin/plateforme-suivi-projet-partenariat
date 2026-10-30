import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
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
      className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-[var(--color-text-secondary)]"
    >
      {segments.map((segment, index) => {
        const chemin = '/' + segments.slice(0, index + 1).join('/');
        const estDernier = index === segments.length - 1;
        const estRacine = index === 0;
        const libelle = libelleSegment(segment, estDernier, estRacine, titreContexte);
        const estFiltreNonNavigable = estTypeArchiveDansUrl(segments, index);
        // La racine (tableau de bord) est représentée par une icône maison
        const estAccueil = estRacine && !estDernier;

        return (
          <span key={chemin} className="flex min-w-0 items-center gap-2">
            {index > 0 && (
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
            )}
            {estDernier ? (
              <span
                aria-current="page"
                className="truncate font-semibold text-[var(--color-text-primary)]"
              >
                {libelle}
              </span>
            ) : estAccueil ? (
              <Link
                to={chemin}
                aria-label={libelle}
                title={libelle}
                className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-[var(--radius-sm)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)]"
              >
                <Home className="h-4 w-4" />
              </Link>
            ) : estFiltreNonNavigable ? (
              <span className="text-[var(--color-text-secondary)]" aria-current="false">
                {libelle}
              </span>
            ) : (
              <Link to={chemin} className="truncate hover:text-[var(--color-brand)]">
                {libelle}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
