// src/types/api.ts

export type RoleUtilisateur = 'PRESIDENCE' | 'ETABLISSEMENT' | 'DECIDEUR';

export interface ReponseApi<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  errors?: string[] | null;
  signature: string;
}

export interface MetaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PageServeur<T> {
  data: T[];
  meta: MetaPagination;
}

export interface Utilisateur {
  id: string;
  email: string;
  role: RoleUtilisateur;
  etablissement_id: string | null;
  etablissement_nom: string | null;
}

export interface ConnexionReponse {
  access_token: string;
  refresh_token: string;
  utilisateur: Utilisateur;
}

export interface StatistiquesPubliques {
  partenaires_actifs: number;
  projets_en_cours: number;
  conventions_signees: number;
}

export interface AccueilPublic {
  statistiques: StatistiquesPubliques;
}

export type StatutConvention = 'BROUILLON' | 'EN_ATTENTE_SIGNATURE' | 'SIGNEE' | 'ACTIVE' | 'SUSPENDUE' | 'EXPIREE';

export type StatutProjet = 'BROUILLON' | 'EN_ATTENTE' | 'EN_COURS' | 'SUSPENDU' | 'EXPIRE' | 'TERMINE';

export type StatutPartenariat = 'BROUILLON' | 'EN_ATTENTE' | 'EN_COURS' | 'SUSPENDU' | 'TERMINE';

export type StatutPartenaire = 'ACTIF' | 'SUSPENDU';

export type VisibilitePartenaire = 'PUBLIC' | 'PRIVE';

export type DomainePartenariat =
  | 'RECHERCHE'
  | 'FORMATION'
  | 'INNOVATION'
  | 'DEVELOPPEMENT'
  | 'COOPERATION_INSTITUTIONNELLE'
  | 'AUTRE';

export interface CompteursTableauDeBord {
  partenaires_actifs: number;
  projets_en_cours: number;
  conventions_actives: number;
  conventions_a_echeance: number;
  repartition_conventions: Record<StatutConvention, number>;
}

export interface EcheanceProchaine {
  id: string;
  reference: string;
  etablissement_nom: string;
  objet: string;
  date_fin: string;
  statut: StatutConvention;
}

export interface ComparatifEtablissement {
  etablissement_id: string;
  etablissement_nom: string;
  partenaires_actifs: number;
  projets_en_cours: number;
  conventions_actives: number;
}

export interface Etablissement {
  id: string;
  nom: string;
  sigle: string | null;
  logo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  nom: string;
  fonction: string | null;
  email: string | null;
  telephone: string | null;
  partenaire_id: string;
  created_at: string;
  updated_at: string;
}

export interface Partenaire {
  id: string;
  nom: string;
  type: string;
  pays: string;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  site_web: string | null;
  description: string | null;
  statut: StatutPartenaire;
  visibilite: VisibilitePartenaire;
  est_strategique: boolean;
  logo_url: string | null;
  archive: boolean;
  etablissement_id: string;
  created_at: string;
  updated_at: string;
  contacts: Contact[];
}

export interface PartenariatEtablissementRef {
  id: string;
  nom: string;
  sigle: string | null;
}

export interface PartenariatPartenaireRef {
  id: string;
  nom: string;
}

export interface Partenariat {
  id: string;
  intitule: string;
  objet: string | null;
  domaine: DomainePartenariat;
  date_debut: string;
  date_fin: string | null;
  statut: StatutPartenariat;
  actions_realisees: string | null;
  actions_en_cours: string | null;
  actions_prevues: string | null;
  resultats_obtenus: string | null;
  difficultes_contraintes: string | null;
  perspectives_recommandations: string | null;
  archive: boolean;
  created_at: string;
  updated_at: string;
  etablissements: PartenariatEtablissementRef[];
  partenaires: PartenariatPartenaireRef[];
}

// Types hérités des modules pas encore reconstruits, à retirer au fur et à mesure
export * from './api-heritage';