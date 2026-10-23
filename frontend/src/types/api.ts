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
  actif?: boolean;
  derniere_connexion?: string | null;
  preferences?: PreferencesCompte;
}

export interface PreferencesCompte {
  theme?: 'CLAIR' | 'SOMBRE' | 'SYSTEME';
  densite?: 'CONFORTABLE' | 'COMPACTE';
  animations?: boolean;
  aide_contextuelle?: boolean;
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

export interface PublicationAccueil {
  id: string;
  titre: string;
  description_publique?: string | null;
  date_publication?: string | null;
}

export interface EtablissementAccueil {
  id: string;
  nom: string;
  sigle?: string | null;
  logo_url?: string | null;
}

export interface PartenaireAccueil {
  id: string;
  nom: string;
  logo_url?: string | null;
}

export interface CompteursAccueilPublic {
  nombre_etablissements: number;
  nombre_partenaires: number;
  nombre_pays_partenaires: number;
  nombre_projets_actifs: number;
  nombre_publications: number;
  nombre_conventions_actives?: number;
}

export interface AccueilPublic {
  statistiques?: StatistiquesPubliques;
  dernieres_publications?: PublicationPublique[];
  projets_a_la_une?: ProjetPublic[];
  etablissements_a_la_une?: EtablissementAccueil[];
  partenaires_a_la_une?: PartenairePublic[];
  compteurs?: CompteursAccueilPublic;
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
  partenaires?: number;
  projets?: number;
  conventions?: number;
}

export interface TableauDeBordReponse {
  compteurs: {
    partenaires: number;
    partenaires_actifs?: number;
    partenariats: number;
    cotutelles: number;
    projets: number;
    projets_en_cours?: number;
    conventions: number;
    conventions_signees?: number;
    conventions_actives?: number;
    conventions_a_echeance?: number;
    publications: number;
    repartition_conventions: Record<StatutConvention, number>;
  };
  projets_par_statut: Record<StatutProjet, number>;
  conventions_par_statut: {
    actives: number;
    expirees: number;
    bientot_expirees: number;
    en_attente_signature: number;
  };
  perimetre: 'GLOBAL' | 'ETABLISSEMENT';
}

export interface EcheanceProchaine {
  id: string;
  reference: string;
  titre?: string;
  objet?: string;
  date_fin: string;
  jours_restants?: number;
  etablissement_nom?: string;
  statut?: StatutConvention;
}

export interface ComparatifEtablissement {
  etablissement_id: string;
  etablissement_nom: string;
  etablissement_sigle?: string | null;
  partenaires?: number;
  partenaires_actifs?: number;
  projets?: number;
  projets_en_cours?: number;
  projets_actifs?: number;
  partenariats?: number;
  cotutelles?: number;
  conventions?: number;
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
  emails?: string[];
  telephones?: string[];
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
  telephones?: string[];
  emails?: string[];
  site_web: string | null;
  description: string | null;
  statut: StatutPartenaire;
  visibilite: VisibilitePartenaire;
  est_strategique: boolean;
  logo_url: string | null;
  archive: boolean;
  soumis_le: string | null;
  publie_le: string | null;
  cree_par_role: RoleUtilisateur | null;
  etablissement_id: string;
  created_at: string;
  updated_at: string;
  contacts: Contact[];
}

export interface PartenariatEtablissementRef {
  id: string;
  nom: string;
  sigle: string | null;
  logo_url: string | null;
}

export interface PartenariatPartenaireRef {
  id: string;
  nom: string;
  logo_url: string | null;
}
export interface Projet {
  id: string;
  nom: string;
  intitule_officiel: string | null;
  type: string;
  domaine: string | null;
  budget: number | null;
  date_debut: string;
  date_fin_prevue: string;
  statut: StatutProjet;
  archive: boolean;
  etablissement_id: string | null;
  partenariat_id: string | null;
  porteur_id: string | null;
  porteur?: import('./api-heritage').Porteur | null;
  etablissement?: Etablissement | null;
  partenariat?: Partenariat | null;
  etablissement_nom: string | null;
  etablissement_sigle: string | null;
  soumis_le: string | null;
  publie_le: string | null;
  cree_par_role: RoleUtilisateur | null;
  en_retard: boolean;
  created_at: string;
  updated_at: string;
  partenaires?: { partenaire_id: string; partenaire?: Partenaire }[];
  bailleurs?: { bailleur_id: string; bailleur?: import('./api-heritage').Bailleur }[];
  beneficiaires?: { beneficiaire_id: string; beneficiaire?: import('./api-heritage').Beneficiaire }[];
  sites?: { site_id: string; site?: import('./api-heritage').Site }[];
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
  soumis_le: string | null;
  publie_le: string | null;
  cree_par_role: RoleUtilisateur | null;
  created_at: string;
  updated_at: string;
  etablissements: PartenariatEtablissementRef[];
  partenaires: PartenariatPartenaireRef[];
}

// --- Synthèse annuelle (module synthese du backend) ---

/** Types d'éléments narratifs acceptés par POST /synthese/items. */
export type TypeItemSynthese = 'DOMAINE_PRINCIPAL' | 'DEFI_MAJEUR' | 'PRIORITE_FUTURE';

/** Compteurs consolidés d'un établissement pour une année (GET /synthese/:id). */
export interface SyntheseCompteurs {
  partenaires: number;
  conventions_actives: number;
  conventions_expirees: number;
  cotutelles: number;
  projets_actifs: number;
}

/** Élément narratif : une valeur par (établissement, année, type). */
export interface SyntheseItem {
  id: string;
  etablissement_id: string;
  annee: number;
  type: string;
  valeur: string;
  created_at?: string;
  updated_at?: string;
}

/** Partenaire désigné comme stratégique pour un établissement et une année. */
export interface SynthesePartenaireStrategique {
  id: string;
  etablissement_id?: string;
  annee?: number;
  partenaire_id: string;
  partenaire_nom?: string;
  partenaire_logo_url?: string | null;
  partenaire?: Partenaire;
}

/** Synthèse d'un établissement pour une année. */
export interface SyntheseEtablissement {
  etablissement_id: string;
  etablissement_nom: string;
  etablissement_logo_url?: string | null;
  annee: number;
  compteurs: SyntheseCompteurs;
  items: SyntheseItem[];
  partenaires_strategiques: SynthesePartenaireStrategique[];
}

/** Synthèse globale : tous les établissements pour une année (GET /synthese). */
export interface SyntheseGlobale {
  annee: number;
  etablissements: SyntheseEtablissement[];
}

/** Réponse de GET /synthese/items (liste non paginée). */
export interface ListeSyntheseItems {
  data: SyntheseItem[];
  total: number;
}

// Types hérités des modules pas encore reconstruits, à retirer au fur et à mesure
export * from './api-heritage';

/** Partenaire exposé publiquement (espace public). */
export interface PartenairePublic {
  id: string;
  nom: string;
  type: string;
  pays: string;
  description: string | null;
  logo_url: string | null;
  site_web: string | null;
  est_strategique: boolean;
}

/** Projet exposé publiquement (espace public). */
export interface EtablissementPublicRef {
  id: string;
  nom: string;
  sigle: string | null;
  logo_url: string | null;
}

export interface PartenairePublicRef {
  id: string;
  nom: string;
  type: string;
  pays: string;
  logo_url: string | null;
}

export interface ProjetPublic {
  id: string;
  nom: string;
  intitule_officiel: string | null;
  type: string;
  domaine: string | null;
  statut: StatutProjet;
  date_debut: string;
  date_fin_prevue: string;
  description: string | null;
  publication_id: string | null;
  etablissement: EtablissementPublicRef | null;
  partenaires: PartenairePublicRef[];
}

/** Publication exposée publiquement (espace public). */
export interface PhotoPublique {
  id: string;
  url_fichier: string;
  legende: string | null;
  ordre: number;
}

export interface PublicationPublique {
  id: string;
  titre: string;
  description_publique: string | null;
  date_publication: string | null;
  resultats: string | null;
  projet_id: string;
  projet: {
    id: string;
    nom: string;
    intitule_officiel: string | null;
    etablissement: EtablissementPublicRef | null;
  };
  photo_url: string | null;
  photos: PhotoPublique[];
}

/** Message envoyé via le formulaire de contact public. */
export interface MessageContact {
  id: string;
  reference: string;
  nom: string;
  email: string;
  telephone: string | null;
  sujet: string;
  message: string;
  etablissement_id: string | null;
  destinataire: { nom: string; sigle: string | null } | null;
  est_lu: boolean;
  date_lecture: string | null;
  date_creation: string;
}