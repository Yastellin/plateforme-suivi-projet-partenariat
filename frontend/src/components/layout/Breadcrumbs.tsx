// src/components/layout/Breadcrumbs.tsx
import { Link, useLocation } from 'react-router-dom';

/**
 * Correspondance segment d'URL → libellé lisible.
 * Les UUID (dernier segment) sont masqués et remplacés par « Détail ».
 */
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
  synthese: 'Synthèse annuelle',
  notifications: 'Notifications',
  parametres: 'Paramètres',
  recherche: 'Recherche',
  export: 'Export',
  nouveau: 'Nouveau',
};

/** Les segments « racine » affichent un libellé différent sur la page courante. */
const LIBELLES_RACINE: Record<string, string> = {
  presidence: 'Tableau de bord',
  etablissement: 'Tableau de bord',
  decideur: 'Tableau de bord',
};

const PATTERN_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function estUUID(segment: string): boolean {
  return PATTERN_UUID.test(segment);
}

function libelleSegment(segment: string, estDernier: boolean, estRacine: boolean): string {
  if (estUUID(segment)) {
    return 'Détail';
  }
  if (estDernier && estRacine) {
    return LIBELLES_RACINE[segment] ?? segment;
  }
  return LIBELLES_SEGMENTS[segment] ?? segment;
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-[7px] text-[13px] font-medium text-[var(--color-text-secondary)]">
      {segments.map((segment, index) => {
        const chemin = '/' + segments.slice(0, index + 1).join('/');
        const estDernier = index === segments.length - 1;
        const estRacine = index === 0;
        const libelle = libelleSegment(segment, estDernier, estRacine);

        return (
          <span key={chemin} className="flex items-center gap-[7px]">
            {index > 0 && (
              <span aria-hidden="true" className="opacity-55">/</span>
            )}
            {estDernier ? (
              <span className="font-semibold text-[var(--color-text-primary)]">{libelle}</span>
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
