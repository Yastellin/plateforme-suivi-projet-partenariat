// src/components/layout/SidebarInterne.tsx

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronsLeftRight,
  ChevronsRightLeft,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { construireNavigation } from '@/components/layout/navigation-interne';
import { cheminTableauDeBord } from '@/router';
import { cn } from '@/lib/utils';
import { nomAffichageUtilisateur } from '@/lib/utilisateur-utils';
import type { RoleUtilisateur } from '@/types/api';
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';
import { MessagesNonLusBadge } from '@/features/messages-contact/components/MessagesNonLusBadge';
import { useEtablissement } from '@/features/etablissements/api/useEtablissement';

const CLE_REPLI = 'uf_sidebar_reduit';

// Palette sombre de la barre latérale (cahier des charges « Apex Dashboard »)
const POLICE_SIDEBAR = "'Inter Variable', Inter, system-ui, sans-serif";
const LargeurDeploye = 256;
const LargeurReduite = 72;

const LIBELLES_ROLE: Record<RoleUtilisateur, string> = {
  PRESIDENCE: 'Présidence',
  ETABLISSEMENT: 'Établissement',
  DECIDEUR: 'Décideur',
};

function sousLibellePied(role: RoleUtilisateur, etablissementNom: string | null): string {
  if (role === 'ETABLISSEMENT' && etablissementNom) {
    return etablissementNom;
  }
  return LIBELLES_ROLE[role];
}

// Initiales (deux lettres) du nom affiché, pour l'avatar du pied de page.
function initialesDe(nom: string): string {
  const morceaux = nom.trim().split(/\s+/).filter(Boolean);
  if (morceaux.length >= 2) {
    return `${morceaux[0][0]}${morceaux[1][0]}`.toUpperCase();
  }
  return (morceaux[0] ?? '??').slice(0, 2).toUpperCase();
}

export function SidebarInterne() {
  const { utilisateur, deconnecter } = useAuth();
  const location = useLocation();
  const { data: etablissementCompte } = useEtablissement(
    utilisateur?.role === 'ETABLISSEMENT'
      ? utilisateur.etablissement_id ?? undefined
      : undefined,
  );

  const [reduit, setReduit] = useState(() => window.localStorage.getItem(CLE_REPLI) === 'true');
  const [groupeOuvert, setGroupeOuvert] = useState<string | null>(null);
  const [groupesReplies, setGroupesReplies] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    window.localStorage.setItem(CLE_REPLI, String(reduit));
  }, [reduit]);

  useEffect(() => {
    setGroupeOuvert(null);
  }, [location.pathname]);

  if (!utilisateur) {
    return null;
  }

  const base = cheminTableauDeBord(utilisateur.role);
  const groupes = construireNavigation(utilisateur.role, base);
  const nomCompte = nomAffichageUtilisateur(utilisateur.email);
  const sousLibelle = sousLibellePied(utilisateur.role, etablissementCompte?.nom ?? utilisateur.etablissement_nom);

  function estActif(chemin: string): boolean {
    if (chemin === base) {
      return location.pathname === base;
    }
    return location.pathname.startsWith(chemin);
  }

  function basculerGroupe(cle: string) {
    if (reduit) {
      setReduit(false);
      setGroupeOuvert(cle);
      return;
    }
    setGroupeOuvert((courant) => (courant === cle ? null : cle));
  }

  function basculerCategorie(cle: string) {
    setGroupesReplies((courant) => {
      const suivant = new Set(courant);
      if (suivant.has(cle)) {
        suivant.delete(cle);
      } else {
        suivant.add(cle);
      }
      return suivant;
    });
  }

  const classeItem = (actif: boolean) =>
    cn(
      'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150',
      actif
        ? 'bg-[#282a36] text-[#00c853] ring-1 ring-inset ring-[#00c853]/30'
        : 'text-[#9ca3af] hover:bg-white/5 hover:text-white',
      reduit && 'justify-center px-0',
    );

  return (
    <motion.aside
      animate={{ width: reduit ? LargeurReduite : LargeurDeploye }}
      transition={{ duration: 0.18, ease: 'easeInOut' }}
      style={{ fontFamily: POLICE_SIDEBAR }}
      className="relative flex h-screen flex-shrink-0 flex-col overflow-visible bg-[#111827] text-[#9ca3af]"
    >
      <button
        type="button"
        onClick={() => setReduit((valeur) => !valeur)}
        aria-label={reduit ? 'Déplier la barre latérale' : 'Réduire la barre latérale'}
        className="absolute -right-3 top-7 z-10 grid h-6 w-6 place-items-center rounded-full border border-[#282a36] bg-[#111827] text-[#9ca3af] shadow-md hover:border-[#00c853] hover:text-[#00c853]"
      >
        {reduit ? <ChevronsRightLeft className="h-3 w-3" /> : <ChevronsLeftRight className="h-3 w-3" />}
      </button>

      {/* En-tête : logo carré émeraude, nom de l'application, sous-titre */}
      <div className={cn('flex flex-shrink-0 items-center gap-3 px-5 pb-5 pt-6', reduit && 'justify-center px-0')}>
        <div
          aria-hidden="true"
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-[#00c853] text-white shadow-[0_0_18px_rgba(0,200,83,0.35)]"
        >
          <Building2 className="h-5 w-5" />
        </div>
        {!reduit ? (
          <div className="min-w-0 leading-tight">
            <strong className="block truncate text-base font-bold text-white">Projets &amp; Partenariats</strong>
            <span className="block text-[11px] uppercase tracking-wider text-[#6b7280]">Tableau de bord</span>
          </div>
        ) : null}
      </div>

      {/* Navigation : défilement fin et discret si le menu est long */}
      <nav
        className="sidebar-sombre-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden px-3 pb-4"
      >
        {groupes.map((groupe) => {
          const replie = groupesReplies.has(groupe.cle);
          return (
            <div key={groupe.cle} className="flex flex-col gap-1">
              {!reduit ? (
                <button
                  type="button"
                  onClick={() => basculerCategorie(groupe.cle)}
                  aria-expanded={!replie}
                  className="flex items-center justify-between px-3 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-[#6b7280] hover:text-[#9ca3af]"
                >
                  {groupe.libelle}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn('h-3.5 w-3.5 transition-transform duration-150', replie && '-rotate-90')}
                  />
                </button>
              ) : null}

              {(!replie || reduit) &&
                groupe.items.map((item) => {
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
                          title={reduit ? item.libelle : undefined}
                          className={classeItem(actif && !reduit)}
                        >
                          <Icone className="h-[18px] w-[18px] flex-shrink-0" />
                          {!reduit ? (
                            <>
                              <span className="flex-1 truncate">{item.libelle}</span>
                              <ChevronRight
                                className={cn('h-3.5 w-3.5 flex-shrink-0 transition-transform', ouvert && 'rotate-90')}
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
                                    'block rounded-lg py-2 pl-11 pr-3 text-sm transition-colors hover:bg-white/5 hover:text-white',
                                    estActif(enfant.chemin) ? 'font-semibold text-[#00c853]' : 'text-[#9ca3af]',
                                  )}
                                >
                                  {enfant.libelle}
                                </Link>
                              ))}
                            </div>
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
                      aria-current={actif ? 'page' : undefined}
                      className={classeItem(actif)}
                    >
                      <Icone className={cn('h-[18px] w-[18px] flex-shrink-0', actif ? 'text-[#00c853]' : 'text-current')} />
                      {!reduit ? (
                        <>
                          <span className="flex-1 truncate">{item.libelle}</span>
                          {item.cle === 'notifications' ? <NotificationBadge /> : null}
                          {item.cle === 'messages' ? <MessagesNonLusBadge /> : null}
                        </>
                      ) : item.cle === 'notifications' ? (
                        <NotificationBadge className="absolute -right-1 -top-1" />
                      ) : item.cle === 'messages' ? (
                        <MessagesNonLusBadge className="absolute -right-1 -top-1" />
                      ) : null}
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Pied de page : profil, rôle et déconnexion à droite */}
      <div className="flex-shrink-0 border-t border-[#1f2937] p-3">
        <div className={cn('flex items-center gap-3 rounded-lg p-2', reduit && 'justify-center p-0')}>
          <div
            aria-hidden="true"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[#00c853] text-xs font-bold text-white"
            title={nomCompte}
          >
            {initialesDe(nomCompte)}
          </div>
          {!reduit ? (
            <>
              <div className="min-w-0 flex-1 leading-tight">
                <strong className="block truncate text-sm font-semibold text-white">{nomCompte}</strong>
                <span className="block truncate text-xs text-[#9ca3af]">{sousLibelle}</span>
              </div>
              <button
                type="button"
                onClick={deconnecter}
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-[#9ca3af] transition-colors hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>
        {reduit ? (
          <button
            type="button"
            onClick={deconnecter}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="mt-2 grid h-8 w-full place-items-center rounded-lg text-[#9ca3af] hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </motion.aside>
  );
}
