// src/types/api.ts

// ---------- Enveloppe API ----------
export interface ReponseApi<T> {
  status: "success" | "error"
  message: string
  data: T | null
  errors?: string[]
  signature: string
}

export interface PageServeur<T> {
  data: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export type MetaPagination = PageServeur<unknown>["meta"]

// ---------- Enums backend (section 10.4) ----------
export type RoleUtilisateur = "PRESIDENCE" | "ETABLISSEMENT" | "DECIDEUR"
export type Visibilite = "PUBLIC" | "PRIVE"
export type StatutPartenaire = "ACTIF" | "SUSPENDU"
export type StatutPartenariat = "BROUILLON" | "EN_ATTENTE" | "EN_COURS" | "SUSPENDU" | "TERMINE"
export type StatutProjet = "BROUILLON" | "EN_ATTENTE" | "EN_COURS" | "SUSPENDU" | "EXPIRE" | "TERMINE"
export type StatutConvention = "BROUILLON" | "EN_ATTENTE_SIGNATURE" | "SIGNEE" | "ACTIVE" | "SUSPENDUE" | "EXPIREE"
export type DomainePartenariat =
  | "RECHERCHE" | "FORMATION" | "INNOVATION"
  | "DEVELOPPEMENT" | "COOPERATION_INSTITUTIONNELLE" | "AUTRE"
export type TypeCotutelle = "COTUTELLE" | "COENCADREMENT"
export type TypeDocument = "TDR" | "DESCRIPTION" | "CONVENTION" | "AUTRE"
export type StatutPublication = "BROUILLON" | "PUBLIEE"
export type TypeNotification =
  | "PROJET_SOUMIS" | "PARTENARIAT_SOUMIS" | "EXPIRATION_CONVENTION" | "CONVENTION_EXPIREE"
  | "PROJET_RETARD" | "DOCUMENT_AJOUTE" | "DOCUMENT_MODIFIE" | "CHANGEMENT_STATUT"
export type PrioriteNotification = "BASSE" | "MOYENNE" | "HAUTE"
export type TypeArchive = "partenaires" | "partenariats" | "projets" | "conventions" | "cotutelles"
// etape_circuit n'existe plus (section 10.3) — ne pas le recreer ici.

// ---------- Utilisateur ----------
export interface Utilisateur {
  id: string
  email: string
  role: RoleUtilisateur
  etablissement_id?: string
  etablissement_nom?: string
}

export interface ReponseConnexion {
  access_token: string
  refresh_token: string
  utilisateur: Utilisateur
}

// ---------- Etablissement ----------
export interface Etablissement {
  id: string
  nom: string
  sigle?: string
  logo_url?: string
  description?: string
}

// ---------- Referentiels ----------
export interface Porteur {
  id: string
  nom: string
  institution_rattachement?: string
}
export interface Bailleur {
  id: string
  nom: string
  description?: string
}
export interface Beneficiaire {
  id: string
  nom: string
  categorie?: string
}
export interface Site {
  id: string
  nom: string
  description?: string
}

// ---------- Partenaires ----------
export interface Contact {
  id: string
  nom: string
  fonction?: string
  email?: string
  telephone?: string
}

export interface Partenaire {
  id: string
  nom: string
  type: string
  pays: string
  adresse?: string
  telephone?: string
  email?: string
  site_web?: string
  description?: string
  statut: StatutPartenaire
  visibilite: Visibilite
  est_strategique: boolean
  logo_url?: string
  archive: boolean
  etablissement_id: string
  contacts?: Contact[]
  created_at: string
  updated_at: string
}

// ---------- Partenariats ----------
export interface Partenariat {
  id: string
  intitule: string
  objet?: string
  domaine: DomainePartenariat
  date_debut: string
  date_fin?: string
  statut: StatutPartenariat
  actions_realisees?: string
  actions_en_cours?: string
  actions_prevues?: string
  resultats_obtenus?: string
  difficultes_contraintes?: string
  perspectives_recommandations?: string
  archive: boolean
  etablissements?: { etablissement_id: string; etablissement?: Etablissement }[]
  partenaires?: { partenaire_id: string; partenaire?: Partenaire }[]
  created_at: string
  updated_at: string
}

// ---------- Projets (sans activites/chronogramme) ----------
export interface Projet {
  id: string
  nom: string
  intitule_officiel?: string
  type: string
  domaine?: string
  budget?: number
  date_debut: string
  date_fin_prevue: string
  statut: StatutProjet
  archive: boolean
  etablissement_id: string
  partenariat_id?: string
  porteur_id?: string
  porteur?: Porteur
  bailleurs?: { bailleur_id: string; bailleur?: Bailleur }[]
  beneficiaires?: { beneficiaire_id: string; beneficiaire?: Beneficiaire }[]
  sites?: { site_id: string; site?: Site }[]
  created_at: string
  updated_at: string
}

export interface AvancementProjet {
  pourcentage: number
  activites_terminees: number
  activites_total: number
}

// ---------- Cotutelles ----------
export interface CotutelleThese {
  id: string
  nom_doctorant: string
  specialite?: string
  directeur_these_local?: string
  directeur_these_partenaire?: string
  type: TypeCotutelle
  date_debut: string
  date_prevue_soutenance?: string
  financement_bourse?: string
  mobilite_realisee?: string
  publications_produites?: string
  etat_avancement?: string
  difficultes_rencontrees?: string
  perspectives?: string
  archive: boolean
  etablissement_id: string
  partenaire_id: string
  convention_id?: string
  created_at: string
  updated_at: string
}

// ---------- Conventions (etape_circuit retire) ----------
export interface Convention {
  id: string
  reference: string
  titre: string
  date_signature?: string
  date_debut?: string
  date_fin?: string
  statut: StatutConvention
  description?: string
  archive: boolean
  partenariat_id?: string
  projet_id?: string
  created_at: string
  updated_at: string
}

// ---------- Documents ----------
export interface DocumentFichier {
  id: string
  nom_fichier: string
  url_fichier: string
  type: TypeDocument
  version: number
  est_archive: boolean
  projet_id?: string
  convention_id?: string
  created_at: string
  updated_at: string
}

// ---------- Publications ----------
export interface PhotoPublication {
  id: string
  url_fichier: string
  legende?: string
  ordre: number
  publication_id: string
}

export interface Publication {
  id: string
  titre: string
  description_publique?: string
  date_publication?: string
  statut: StatutPublication
  resultats?: string
  projet_id: string
  photos?: PhotoPublication[]
  created_at: string
  updated_at: string
}

// ---------- Notifications ----------
export interface Notification {
  id: string
  titre: string
  message: string
  type: TypeNotification
  priorite: PrioriteNotification
  date_creation: string
  est_lue: boolean
  reference_type: string
  reference_id: string
}

// ---------- Tableau de bord / statistiques ----------
export interface CompteursTableauDeBord {
  nombre_partenaires: number
  nombre_partenariats: number
  nombre_cotutelles: number
  projets_par_statut: Record<string, number>
  conventions_actives: number
  conventions_expirees: number
  conventions_bientot_expirees: number
}

export interface EcheanceProchaine {
  id: string
  type: "convention" | "projet"
  titre: string
  date_echeance: string
}

export interface ComparatifEtablissement {
  etablissement_id: string
  etablissement_nom: string
  nombre_projets: number
  nombre_partenaires: number
  nombre_conventions: number
}

// ---------- Synthese (a venir — section 10.2) ----------
export interface SyntheseItem {
  id: string
  titre: string
  description?: string
  type: string
  valeur: string
  annee: number
  etablissement_id: string
}

export interface SyntheseEtablissement {
  etablissement_id: string
  etablissement_nom: string
  nombre_partenaires: number
  conventions_actives: number
  nombre_cotutelles: number
  projets_actifs: number
  items_narratifs: SyntheseItem[]
}

export interface SynthesePartenaireStrategique {
  id: string
  nom: string
  description?: string
  etablissement_id: string
}