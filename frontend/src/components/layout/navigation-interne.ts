import {
  Archive,
  Bell,
  Building2,
  ChartPie,
  Database,
  FileCheck2,
  FileText,
  FolderKanban,
  GraduationCap,
  Handshake,
  History,
  LayoutDashboard,
  Newspaper,
  Search,
  Settings,
  type LucideIcon,
} from 'lucide-react';

import type { RoleUtilisateur } from '@/types/api';

export interface SousItemNavigation {
  libelle: string;
  chemin: string;
}

export interface ItemNavigation {
  cle: string;
  libelle: string;
  icone: LucideIcon;
  chemin?: string;
  enfants?: SousItemNavigation[];
}

export interface GroupeNavigation {
  cle: string;
  libelle: string;
  items: ItemNavigation[];
}

export function construireNavigation(role: RoleUtilisateur, base: string): GroupeNavigation[] {
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
          { cle: 'historique', libelle: 'Historique', icone: History, chemin: `${base}/historique` },
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
          { cle: 'archives', libelle: 'Archives', icone: Archive, chemin: `${base}/archives` },
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
        { cle: 'archives', libelle: 'Archives', icone: Archive, chemin: `${base}/archives` },
        { cle: 'historique', libelle: 'Historique', icone: History, chemin: `${base}/historique` },
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
