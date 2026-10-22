// src/components/layout/SidebarInterne.tsx

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Archive,
  Bell,
  Building2,
  ChartPie,
  ChevronRight,
  ChevronsLeftRight,
  ChevronsRightLeft,
  Database,
  FileCheck2,
  FileText,
  FolderKanban,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Search,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cheminTableauDeBord } from '@/router';
import { cn } from '@/lib/utils';
import { nomAffichageUtilisateur, initialesUtilisateur } from '@/lib/utilisateur-utils';
import type { RoleUtilisateur } from '@/types/api';

const CLE_REPLI = 'uf_sidebar_reduit';

interface SousItemNavigation {
  libelle: string;
  chemin: string;
}

interface ItemNavigation {
  cle: string;
  libelle: string;
  icone: LucideIcon;
  chemin?: string;
  enfants?: SousItemNavigation[];
}

interface GroupeNavigation {
  cle: string;
  libelle: string;
  items: ItemNavigation[];
}

function construireNavigation(role: RoleUtilisateur, base: string): GroupeNavigation[] {
  if (role === 'PRESIDENCE') {
    return [
      {
        cle: 'pilotage',
        libelle: 'Pilotage',
        items: [
          { cle: 'tableau-de-bord', libelle: 'Tableau de bord', icone: LayoutDashboard, chemin: base },
          { cle: 'etablissements', libelle: 'Établissements', icone: Building2, chemin: `${base}/etablissements` },
          {
            cle: 'partenaires-partenariats',
            libelle: 'Partenaires & Partenariats',
            icone: Handshake,
            enfants: [
              { libelle: 'Partenaires', chemin: `${base}/partenaires-partenariats/partenaires` },
              { libelle: 'Partenariats', chemin: `${base}/partenaires-partenariats/partenariats` },
            ],
          },
          { cle: 'cotutelles', libelle: 'Cotutelles', icone: GraduationCap, chemin: `${base}/cotutelles` },
          { cle: 'projets', libelle: 'Projets', icone: FolderKanban, chemin: `${base}/projets` },
          { cle: 'conventions', libelle: 'Conventions', icone: FileCheck2, chemin: `${base}/conventions` },
          { cle: 'documents', libelle: 'Documents', icone: FileText, chemin: `${base}/documents` },
          { cle: 'publications', libelle: 'Publications', icone: Newspaper, chemin: `${base}/publications` },
          { cle: 'referentiels', libelle: 'Référentiels', icone: Database, chemin: `${base}/referentiels` },
          { cle: 'archives', libelle: 'Archives', icone: Archive, chemin: `${base}/archives` },
        ],
      },
      {
        cle: 'diffusion',
        libelle: 'Diffusion',
        items: [
          { cle: 'recherche', libelle: 'Recherche', icone: Search, chemin: `${base}/recherche` },
          { cle: 'synthese', libelle: 'Synthèse annuelle', icone: ChartPie, chemin: `${base}/synthese` },
          { cle: 'notifications', libelle: 'Notifications', icone: Bell, chemin: `${base}/notifications` },
          { cle: 'parametres', libelle: 'Paramètres', icone: Settings, chemin: `${base}/parametres` },
        ],
      },
    ];
  }

  if (role === 'ETABLISSEMENT') {
    return [
      {
        cle: 'pilotage',
        libelle: 'Pilotage',
        items: [
          { cle: 'tableau-de-bord', libelle: 'Tableau de bord', icone: LayoutDashboard, chemin: base },
          {
            cle: 'partenaires-partenariats',
            libelle: 'Mes partenaires & partenariats',
            icone: Handshake,
            enfants: [
              { libelle: 'Mes partenaires', chemin: `${base}/partenaires-partenariats/partenaires` },
              { libelle: 'Mes partenariats', chemin: `${base}/partenaires-partenariats/partenariats` },
            ],
          },
          { cle: 'projets', libelle: 'Mes projets', icone: FolderKanban, chemin: `${base}/projets` },
          { cle: 'cotutelles', libelle: 'Cotutelles', icone: GraduationCap, chemin: `${base}/cotutelles` },
        ],
      },
      {
        cle: 'diffusion',
        libelle: 'Diffusion',
        items: [
          { cle: 'notifications', libelle: 'Notifications', icone: Bell, chemin: `${base}/notifications` },
          { cle: 'parametres', libelle: 'Paramètres', icone: Settings, chemin: `${base}/parametres` },
        ],
      },
    ];
  }

  return [
    {
      cle: 'pilotage',
      libelle: 'Pilotage',
      items: [
        { cle: 'tableau-de-bord', libelle: 'Tableau de bord', icone: LayoutDashboard, chemin: base },
        {
          cle: 'partenaires-partenariats',
          libelle: 'Partenaires & Partenariats',
          icone: Handshake,
          enfants: [
            { libelle: 'Partenaires', chemin: `${base}/partenaires-partenariats/partenaires` },
            { libelle: 'Partenariats', chemin: `${base}/partenaires-partenariats/partenariats` },
          ],
        },
        { cle: 'cotutelles', libelle: 'Cotutelles', icone: GraduationCap, chemin: `${base}/cotutelles` },
        { cle: 'projets', libelle: 'Projets', icone: FolderKanban, chemin: `${base}/projets` },
        { cle: 'conventions', libelle: 'Conventions', icone: FileCheck2, chemin: `${base}/conventions` },
        { cle: 'documents', libelle: 'Documents', icone: FileText, chemin: `${base}/documents` },
        { cle: 'etablissements', libelle: 'Établissements', icone: Building2, chemin: `${base}/etablissements` },
      ],
    },
    {
      cle: 'diffusion',
      libelle: 'Diffusion',
      items: [
        { cle: 'synthese', libelle: 'Synthèse annuelle', icone: ChartPie, chemin: `${base}/synthese` },
        { cle: 'parametres', libelle: 'Paramètres', icone: Settings, chemin: `${base}/parametres` },
      ],
    },
  ];
}

const LIBELLES_ROLE: Record<RoleUtilisateur, string> = {
  PRESIDENCE: 'Présidence',
  ETABLISSEMENT: 'Établissement',
  DECIDEUR: 'Décideur',
};

function initiales(email: string): string {
  return initialesUtilisateur(email);
}

function sousLibellePied(role: RoleUtilisateur, etablissementNom: string | null): string {
  if (role === 'ETABLISSEMENT' && etablissementNom) {
    return etablissementNom;
  }
  return LIBELLES_ROLE[role];
}

export function SidebarInterne() {
  const { utilisateur, deconnecter } = useAuth();
  const location = useLocation();

  const [reduit, setReduit] = useState(() => window.localStorage.getItem(CLE_REPLI) === 'true');
  const [groupeOuvert, setGroupeOuvert] = useState<string | null>(null);
  const [menuUtilisateurOuvert, setMenuUtilisateurOuvert] = useState(false);
  const menuUtilisateurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.localStorage.setItem(CLE_REPLI, String(reduit));
  }, [reduit]);

  useEffect(() => {
    setGroupeOuvert(null);
    setMenuUtilisateurOuvert(false);
  }, [location.pathname]);

  useEffect(() => {
    function gererClicExterieur(evenement: MouseEvent) {
      if (menuUtilisateurRef.current && !menuUtilisateurRef.current.contains(evenement.target as Node)) {
        setMenuUtilisateurOuvert(false);
      }
    }
    document.addEventListener('mousedown', gererClicExterieur);
    return () => document.removeEventListener('mousedown', gererClicExterieur);
  }, []);

  if (!utilisateur) {
    return null;
  }

  const base = cheminTableauDeBord(utilisateur.role);
  const groupes = construireNavigation(utilisateur.role, base);

  function estActif(chemin: string): boolean {
    if (chemin === base) {
      return location.pathname === base;
    }
    return location.pathname.startsWith(chemin);
  }

  function basculerGroupe(cle: string) {
    setGroupeOuvert((courant) => (courant === cle ? null : cle));
  }

  return (
    <motion.aside
      animate={{ width: reduit ? 72 : 248 }}
      transition={{ duration: 0.18, ease: 'easeInOut' }}
      className="relative flex h-full flex-shrink-0 flex-col gap-4 overflow-visible border-r border-[var(--color-chrome-border)] bg-[var(--color-chrome-bg)] py-[18px]"
    >
      <button
        type="button"
        onClick={() => setReduit((valeur) => !valeur)}
        aria-label={reduit ? 'Déplier la barre latérale' : 'Réduire la barre latérale'}
        className="absolute -right-[13px] top-[26px] z-10 grid h-[26px] w-[26px] place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
      >
        {reduit ? (
          <ChevronsRightLeft className="h-[13px] w-[13px]" />
        ) : (
          <ChevronsLeftRight className="h-[13px] w-[13px]" />
        )}
      </button>

      <div
        className={cn(
          'flex items-center gap-2.5 border-b border-[var(--color-chrome-border)] px-3 pb-[14px]',
          reduit && 'justify-center px-0',
        )}
      >
        <div
          className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--color-brand)] text-[15px] font-extrabold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          UF
        </div>
        {!reduit ? (
          <div className="min-w-0 leading-tight">
            <strong className="block truncate text-[13.5px] font-bold">Université de Fianarantsoa</strong>
            <span className="block truncate text-[11.5px] text-[var(--color-text-secondary)]">
              Projets &amp; Partenariats
            </span>
          </div>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-visible px-3">
        {groupes.map((groupe) => (
          <div key={groupe.cle} className="flex flex-col gap-0.5">
            {!reduit ? (
              <div className="px-2.5 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {groupe.libelle}
              </div>
            ) : null}

            {groupe.items.map((item) => {
              const Icone = item.icone;
              const aSousMenu = Boolean(item.enfants);
              const actif = item.chemin
                ? estActif(item.chemin)
                : (item.enfants?.some((enfant) => estActif(enfant.chemin)) ?? false);
              const ouvert = groupeOuvert === item.cle;

              if (aSousMenu) {
                return (
                  <div key={item.cle} className="relative">
                    <button
                      type="button"
                      onClick={() => basculerGroupe(item.cle)}
                      aria-expanded={ouvert}
                      className={cn(
                        'relative flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[13.5px] font-medium transition-colors hover:bg-[var(--color-chrome-hover)]',
                        reduit && 'justify-center px-2',
                        actif && !reduit && 'bg-[var(--color-active-zone)] font-semibold text-[var(--color-brand-deep)]',
                      )}
                    >
                      {actif ? (
                        <span className="absolute -left-3 bottom-1.5 top-1.5 w-[3px] rounded-r bg-[var(--color-brand)]" />
                      ) : null}
                      <Icone className={cn('h-4 w-4 flex-shrink-0 opacity-85', actif && 'opacity-100')} />
                      {!reduit ? (
                        <>
                          <span className="flex-1 truncate">{item.libelle}</span>
                          <ChevronRight
                            className={cn(
                              'h-3.5 w-3.5 flex-shrink-0 opacity-60 transition-transform',
                              ouvert && 'rotate-90',
                            )}
                          />
                        </>
                      ) : null}
                    </button>

                    {!reduit ? (
                      <div
                        className="grid overflow-hidden transition-[grid-template-rows] duration-150"
                        style={{ gridTemplateRows: ouvert ? '1fr' : '0fr' }}
                      >
                        <div className="overflow-hidden">
                          {item.enfants?.map((enfant) => (
                            <Link
                              key={enfant.chemin}
                              to={enfant.chemin}
                              className={cn(
                                'block rounded-[var(--radius-sm)] py-1.5 pl-[41px] pr-2.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-chrome-hover)] hover:text-[var(--color-text-primary)]',
                                estActif(enfant.chemin) && 'font-semibold text-[var(--color-brand-deep)]',
                              )}
                            >
                              {enfant.libelle}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : ouvert ? (
                      <div className="absolute left-full top-0 z-20 ml-2 min-w-[190px] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-md)]">
                        <div className="px-2.5 pb-1 pt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                          {item.libelle}
                        </div>
                        {item.enfants?.map((enfant) => (
                          <Link
                            key={enfant.chemin}
                            to={enfant.chemin}
                            className={cn(
                              'block rounded-md px-2.5 py-1.5 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-chrome-hover)]',
                              estActif(enfant.chemin) && 'font-semibold text-[var(--color-brand-deep)]',
                            )}
                          >
                            {enfant.libelle}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <Link
                  key={item.cle}
                  to={item.chemin ?? '#'}
                  title={reduit ? item.libelle : undefined}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-[13.5px] font-medium transition-colors hover:bg-[var(--color-chrome-hover)]',
                    reduit && 'justify-center px-2',
                    actif && 'bg-[var(--color-active-zone)] font-semibold text-[var(--color-brand-deep)]',
                  )}
                >
                  {actif ? (
                    <span className="absolute -left-3 bottom-1.5 top-1.5 w-[3px] rounded-r bg-[var(--color-brand)]" />
                  ) : null}
                  <Icone className={cn('h-4 w-4 flex-shrink-0 opacity-85', actif && 'opacity-100')} />
                  {!reduit ? <span className="truncate">{item.libelle}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div ref={menuUtilisateurRef} className="relative border-t border-[var(--color-chrome-border)] px-3 pt-[14px]">
        <button
          type="button"
          onClick={() => setMenuUtilisateurOuvert((valeur) => !valeur)}
          aria-expanded={menuUtilisateurOuvert}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] p-1.5 text-left hover:bg-[var(--color-chrome-hover)]',
            reduit && 'justify-center',
          )}
        >
          <div className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-full bg-[var(--color-brand)] text-[12px] font-bold text-white">
            {initiales(utilisateur.email)}
          </div>
          {!reduit ? (
            <div className="min-w-0 leading-tight">
              <strong className="block truncate text-[13px] font-semibold">{nomAffichageUtilisateur(utilisateur.email)}</strong>
              <span className="block truncate text-[11.5px] text-[var(--color-text-secondary)]">
                {sousLibellePied(utilisateur.role, utilisateur.etablissement_nom)}
              </span>
            </div>
          ) : null}
        </button>

        {menuUtilisateurOuvert ? (
          <div
            className={cn(
              'absolute bottom-full z-20 mb-2 min-w-[200px] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-md)]',
              reduit ? 'left-full ml-2' : 'left-3 right-3',
            )}
          >
            <Link
              to={`${base}/parametres`}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-chrome-hover)]"
            >
              <Settings className="h-3.5 w-3.5" />
              Paramètres
            </Link>
            <button
              type="button"
              onClick={deconnecter}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-semibold text-[var(--status-expire-fg)] hover:bg-[var(--status-expire-bg)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Se déconnecter
            </button>
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
}