// src/lib/status-mappings.ts

import type { DomainePartenariat, StatutConvention, StatutPartenariat, StatutProjet } from '@/types/api';

export type ToneStatut = 'brouillon' | 'attente' | 'actif' | 'expire' | 'archive' | 'circuit';

interface InfoStatut {
  libelle: string;
  tonalite: ToneStatut;
}

export const LIBELLES_STATUT_CONVENTION: Record<StatutConvention, InfoStatut> = {
  BROUILLON: { libelle: 'Brouillon', tonalite: 'brouillon' },
  EN_ATTENTE_SIGNATURE: { libelle: 'En attente de signature', tonalite: 'attente' },
  SIGNEE: { libelle: 'Signée', tonalite: 'actif' },
  ACTIVE: { libelle: 'Active', tonalite: 'actif' },
  SUSPENDUE: { libelle: 'Suspendue', tonalite: 'attente' },
  EXPIREE: { libelle: 'Expirée', tonalite: 'expire' },
};

export const LIBELLES_STATUT_PROJET: Record<StatutProjet, InfoStatut> = {
  BROUILLON: { libelle: 'Brouillon', tonalite: 'brouillon' },
  EN_ATTENTE: { libelle: 'En attente', tonalite: 'attente' },
  EN_COURS: { libelle: 'En cours', tonalite: 'actif' },
  SUSPENDU: { libelle: 'Suspendu', tonalite: 'attente' },
  EXPIRE: { libelle: 'Expiré', tonalite: 'expire' },
  TERMINE: { libelle: 'Terminé', tonalite: 'archive' },
};

export const LIBELLES_STATUT_PARTENARIAT: Record<StatutPartenariat, InfoStatut> = {
  BROUILLON: { libelle: 'Brouillon', tonalite: 'brouillon' },
  EN_ATTENTE: { libelle: 'En attente', tonalite: 'attente' },
  EN_COURS: { libelle: 'En cours', tonalite: 'actif' },
  SUSPENDU: { libelle: 'Suspendu', tonalite: 'attente' },
  TERMINE: { libelle: 'Terminé', tonalite: 'archive' },
};

export const LIBELLES_DOMAINE_PARTENARIAT: Record<DomainePartenariat, string> = {
  RECHERCHE: 'Recherche',
  FORMATION: 'Formation',
  INNOVATION: 'Innovation',
  DEVELOPPEMENT: 'Développement',
  COOPERATION_INSTITUTIONNELLE: 'Coopération institutionnelle',
  AUTRE: 'Autre',
};

const MAPPE_TONALITE_PAR_STATUT: Record<string, ToneStatut> = {
  ACTIF: 'actif',
  SUSPENDU: 'attente',
  BROUILLON: 'brouillon',
  EN_ATTENTE: 'attente',
  EN_ATTENTE_SIGNATURE: 'attente',
  EN_COURS: 'actif',
  EN_CIRCUIT: 'circuit',
  SIGNEE: 'actif',
  ACTIVE: 'actif',
  SUSPENDUE: 'attente',
  EXPIRE: 'expire',
  EXPIREE: 'expire',
  TERMINE: 'archive',
  PUBLIEE: 'actif',
};

export function obtenirInfoStatut(statut: string): { libelle: string; tonalite: ToneStatut } {
  const tonalite = MAPPE_TONALITE_PAR_STATUT[statut] ?? 'brouillon';
  const libelle = statut
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
  return { libelle, tonalite };
}