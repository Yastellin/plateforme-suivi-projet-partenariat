// src/types/api-heritage.ts
export type RoleUtilisateur = "PRESIDENCE" | "ETABLISSEMENT" | "DECIDEUR";
export type TypeCotutelle = "COTUTELLE" | "COENCADREMENT";

export interface CotutelleThese {
  id: string;
  nom_doctorant: string;
  specialite?: string;
  directeur_these_local?: string;
  directeur_these_partenaire?: string;
  type: TypeCotutelle;
  date_debut: string;
  date_prevue_soutenance?: string;
  financement_bourse?: string;
  mobilite_realisee?: string;
  publications_produites?: string;
  etat_avancement?: string;
  difficultes_rencontrees?: string;
  perspectives?: string;
  archive: boolean;
  etablissement_id: string;
  partenaire_id: string;
  convention_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Utilisateur {
  id: string;
  email: string;
  role: RoleUtilisateur;
  etablissement_id?: string;
  etablissement_nom?: string;
}

export interface ReponseConnexion {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  utilisateur: Utilisateur;
}

export interface ReponseApi<T> {
  status: "success" | "error";
  message: string;
  data: T | null;
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

export type StatutPartenaire = "ACTIF" | "SUSPENDU";
export type Visibilite = "PUBLIC" | "PRIVE";

export type StatutPartenariat =
  "BROUILLON" | "EN_ATTENTE" | "EN_COURS" | "SUSPENDU" | "TERMINE";
export type StatutProjet =
  "BROUILLON" | "EN_ATTENTE" | "EN_COURS" | "SUSPENDU" | "EXPIRE" | "TERMINE";
export type TypePorteur = "PERSONNE" | "ETABLISSEMENT" | "AUTRE";

export interface Porteur {
  id: string;
  type_porteur: TypePorteur;
  nom: string | null;
  institution_rattachement: string | null;
  etablissement_id: string | null;
  etablissement_nom?: string | null;
  etablissement?: { id: string; nom: string; sigle: string | null } | null;
  created_at: string;
  updated_at: string;
}
export interface Bailleur {
  id: string;
  nom: string;
  description?: string;
}

export interface Beneficiaire {
  id: string;
  nom: string;
  categorie?: string;
}

export interface Site {
  id: string;
  nom: string;
  description?: string;
}

export interface Projet {
  id: string;
  nom: string;
  intitule_officiel?: string;
  type: string;
  domaine?: string;
  budget?: number;
  date_debut: string;
  date_fin_prevue: string;
  statut: StatutProjet;
  archive: boolean;
  etablissement_id: string;
  partenariat_id?: string;
  porteur_id?: string | null;
  porteur?: Porteur | null;
  bailleurs?: { bailleur_id: string; bailleur?: Bailleur }[];
  beneficiaires?: { beneficiaire_id: string; beneficiaire?: Beneficiaire }[];
  sites?: { site_id: string; site?: Site }[];
  created_at: string;
  updated_at: string;
}
export type StatutConvention =
  | "BROUILLON"
  | "EN_ATTENTE_SIGNATURE"
  | "SIGNEE"
  | "ACTIVE"
  | "SUSPENDUE"
  | "EXPIREE";
export interface Convention {
  id: string;
  reference: string;
  titre: string;
  etablissement_nom?: string;
  date_signature?: string;
  date_debut?: string;
  date_fin?: string;
  statut: StatutConvention;
  date_derniere_etape?: string;
  description?: string;
  archive: boolean;
  partenariat_id?: string;
  partenariat?: {
    id: string;
    libelle: string;
    complement?: string | null;
  } | null;
  projet?: {
    id: string;
    libelle: string;
    complement?: string | null;
  } | null;
  cotutelle_id?: string | null;
  cotutelle?: {
    id: string;
    libelle: string;
    complement?: string | null;
  } | null;
  projet_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  nom: string;
  fonction?: string;
  email?: string;
  telephone?: string;
}

export interface Partenaire {
  id: string;
  nom: string;
  type: string;
  pays: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  convention_id?: string;
  bailleur?: string;
  beneficiaire?: string;
  etablissement_nom?: string;
  description?: string;
  statut: StatutPartenaire;
  visibilite: Visibilite;
  est_strategique: boolean;
  logo_url?: string;
  archive: boolean;
  etablissement_id: string;
  contacts?: Contact[];
  created_at: string;
  updated_at: string;
}

export interface Etablissement {
  id: string;
  nom: string;
  sigle?: string;
  logo_url?: string;
  description?: string;
}
export type TypeDocument = "TDR" | "DESCRIPTION" | "CONVENTION" | "AUTRE";

export interface DocumentFichier {
  id: string;
  nom_fichier: string;
  url_fichier: string;
  type: TypeDocument;
  version: number;
  est_archive: boolean;
  projet_id?: string | null;
  convention_id?: string | null;
  cotutelle_id?: string | null;
  partenariat_id?: string | null;
  created_at: string;
  updated_at: string;
}
export type StatutPublication = "BROUILLON" | "PUBLIEE";

export interface PhotoPublication {
  id: string;
  url_fichier: string;
  legende?: string;
  ordre: number;
  publication_id: string;
}

export interface Publication {
  id: string;
  titre: string;
  description_publique?: string;
  date_publication?: string;
  statut: StatutPublication;
  resultats?: string;
  projet_id: string;
  photos?: PhotoPublication[];
  created_at: string;
  updated_at: string;
}
// à ajouter dans src/types/api.ts
export type TypeNotification =
  | "PROJET_SOUMIS"
  | "PARTENARIAT_SOUMIS"
  | "EXPIRATION_CONVENTION"
  | "CONVENTION_EXPIREE"
  | "ACTIVITE_ECHEANCE"
  | "ACTIVITE_RETARD"
  | "PROJET_RETARD"
  | "DOCUMENT_AJOUTE"
  | "DOCUMENT_MODIFIE"
  | "CHANGEMENT_STATUT";

export type PrioriteNotification = "BASSE" | "MOYENNE" | "HAUTE";

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: TypeNotification;
  priorite: PrioriteNotification;
  date_creation: string;
  est_lue: boolean;
  reference_type: string;
  reference_id: string;
}
// Types de la synthèse annuelle : déplacés dans src/types/api.ts
// (contrat réel du module `synthese` du backend).

export interface CompteursTableauDeBord {
  nombre_partenaires: number;
  nombre_partenariats: number;
  nombre_cotutelles: number;
  projets_par_statut: Record<string, number>;
  conventions_actives: number;
  conventions_expirees: number;
  conventions_bientot_expirees: number;
}

export interface EcheanceProchaine {
  id: string;
  type: "convention" | "activite" | "projet";
  titre: string;
  date_echeance: string;
}

export interface ComparatifEtablissement {
  etablissement_id: string;
  etablissement_nom: string;
  nombre_projets: number;
  nombre_partenaires: number;
  nombre_conventions: number;
}

export type TypeArchive =
  | "partenaires"
  | "partenariats"
  | "projets"
  | "conventions"
  | "cotutelles"
  | "documents";

export type ModeArchives = TypeArchive | "tous";

export type LigneArchive = Record<string, unknown> & { _type: TypeArchive };
export type DomainePartenariat =
  | "RECHERCHE"
  | "FORMATION"
  | "INNOVATION"
  | "DEVELOPPEMENT"
  | "COOPERATION_INSTITUTIONNELLE"
  | "AUTRE";

export interface Partenariat {
  id: string;
  intitule: string;
  nom?: string;
  type?: string;
  objet?: string;
  domaine: DomainePartenariat;
  date_debut: string;
  date_fin?: string;
  statut: StatutPartenariat;
  actions_realisees?: string;
  actions_en_cours?: string;
  actions_prevues?: string;
  resultats_obtenus?: string;
  difficultes_contraintes?: string;
  perspectives_recommandations?: string;
  archive: boolean;
  etablissements?: {
    etablissement_id: string;
    etablissement?: { id: string; nom: string };
  }[];
  partenaires?: { partenaire_id: string; partenaire?: Partenaire }[];
  created_at: string;
  updated_at: string;
}
