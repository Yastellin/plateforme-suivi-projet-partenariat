// src/components/layout/Breadcrumbs.tsx

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useContext } from 'react';
import { ContexteTitreBreadcrumb } from '@/contexts/TitreBreadcrumbContext';
import { construireNavigation, type ItemNavigation } from './navigation-interne';
import type { RoleUtilisateur } from '@/types/api';

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

// Rôle attendu pour chaque préfixe d'URL (premier segment)
const ROLE_PAR_PREFIXE: Record<string, RoleUtilisateur> = {
  presidence: 'PRESIDENCE',
  etablissement: 'ETABLISSEMENT',
  decideur: 'DECIDEUR',
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
function estTypeArchiveDansUrl(segments: string[], index: number): boolean {
  if (index <= 0) return false;
  const precedent = segments[index - 1];
  return precedent === 'archives' && TYPES_ARCHIVE.has(segments[index]);
}

function libelleSegment(
  segment: string,
  estDernier: boolean,
  titreContexte: string | null,
): string {
  if (estUUID(segment)) {
    if (estDernier && titreContexte) return titreContexte;
    return 'Détail';
  }
  return LIBELLES_SEGMENTS[segment] ?? segment;
}

interface Etape {
  libelle: string;
  chemin: string;
  navigable: boolean;
}

// Page fille : segments d'URL à partir de `debut` (exclu : déjà couvert par le menu)
function etapesFilles(
  segments: string[],
  debut: number,
  titreContexte: string | null,
): Etape[] {
  const etapes: Etape[] = [];
  for (let index = debut; index < segments.length; index += 1) {
    const segment = segments[index];
    const estDernier = index === segments.length - 1;
    etapes.push({
      libelle: libelleSegment(segment, estDernier, titreContexte),
      chemin: '/' + segments.slice(0, index + 1).join('/'),
      navigable: !estTypeArchiveDansUrl(segments, index),
    });
  }
  return etapes;
}

// Entrée du menu principal (sidebar) la plus précise pour l'URL courante
function entreeMenuCourante(
  pathname: string,
  prefixe: string,
): ItemNavigation | null {
  const role = ROLE_PAR_PREFIXE[prefixe.replace('/', '')];
  if (!role) return null;
  const items = construireNavigation(role, prefixe).flatMap((groupe) => groupe.items);
  const candidats = items.filter(
    (item) =>
      item.chemin !== undefined &&
      item.chemin !== prefixe &&
      (pathname === item.chemin || pathname.startsWith(item.chemin + '/')),
  );
  candidats.sort((a, b) => (b.chemin?.length ?? 0) - (a.chemin?.length ?? 0));
  return candidats[0] ?? null;
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const ctx = useContext(ContexteTitreBreadcrumb);
  const titreContexte = ctx?.titre ?? null;

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const prefixe = `/${segments[0]}`;

  // Page d'accueil du rôle : pas de fil à afficher après l'icône
  if (segments.length === 1) {
    return (
      <nav
        aria-label="Fil d'Ariane"
        className="flex min-w-0 items-center gap-2 text-[14px] font-medium text-[var(--color-text-secondary)]"
      >
        <Link
          to={prefixe}
          aria-label="Tableau de bord"
          title="Tableau de bord"
          className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-[var(--radius-sm)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)]"
        >
          <Home className="h-4 w-4" />
        </Link>
        <span className="flex min-w-0 items-center gap-2">
          <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
          <span aria-current="page" className="truncate font-semibold text-[var(--color-text-primary)]">
            Tableau de bord
          </span>
        </span>
      </nav>
    );
  }

  const menu = entreeMenuCourante(pathname, prefixe);

  let etapes: Etape[];
  if (menu?.chemin) {
    // Menu principal (ex. « Projets »), puis les pages filles de l'URL
    const profondeurMenu = menu.chemin.split('/').filter(Boolean).length;
    etapes = [
      { libelle: menu.libelle, chemin: menu.chemin, navigable: true },
      ...etapesFilles(segments, profondeurMenu, titreContexte),
    ];
  } else {
    etapes = etapesFilles(segments, 1, titreContexte);
  }

  // Étape « Tableau de bord » systématique entre l'icône et le reste du fil
  etapes = [{ libelle: 'Tableau de bord', chemin: prefixe, navigable: true }, ...etapes];

  const indexDernier = etapes.length - 1;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex min-w-0 items-center gap-2 text-[14px] font-medium text-[var(--color-text-secondary)]"
    >
      <Link
        to={prefixe}
        aria-label="Tableau de bord"
        title="Tableau de bord"
        className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-[var(--radius-sm)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-brand)]"
      >
        <Home className="h-4 w-4" />
      </Link>

      {etapes.map((etape, index) => {
        const estDernier = index === indexDernier;
        return (
          <span key={etape.chemin} className="flex min-w-0 items-center gap-2">
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
            {estDernier ? (
              <span aria-current="page" className="truncate font-semibold text-[var(--color-text-primary)]">
                {etape.libelle}
              </span>
            ) : etape.navigable ? (
              <Link to={etape.chemin} className="truncate hover:text-[var(--color-brand)]">
                {etape.libelle}
              </Link>
            ) : (
              <span className="text-[var(--color-text-secondary)]" aria-current="false">
                {etape.libelle}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
