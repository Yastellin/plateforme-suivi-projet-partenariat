// src/types/api.ts
export type RoleUtilisateur = "PRESIDENCE" | "ETABLISSEMENT" | "DECIDEUR"
export type TypeCotutelle = "COTUTELLE" | "COENCADREMENT"


<<<<<<< Updated upstream
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
=======
export interface ReponseApi<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  errors?: string[] | null;
  signature: string;
>>>>>>> Stashed changes
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
  id: string
  email: string
  role: RoleUtilisateur
  etablissement_id?: string
  etablissement_nom?: string
}

export interface ReponseConnexion {
  access_token: string
  refresh_token: string
  expires_in: number
  utilisateur: Utilisateur
}

export interface ReponseApi<T> {
  status: "success" | "error"
  message: string
  data: T | null
  errors?: string[] | null
  signature: string
}

<<<<<<< Updated upstream
export interface MetaPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PageServeur<T> {
  data: T[]
  meta: MetaPagination
}

export type StatutPartenaire = "ACTIF" | "SUSPENDU"
export type Visibilite = "PUBLIC" | "PRIVE"

export type StatutPartenariat = "BROUILLON" | "EN_ATTENTE" | "EN_COURS" | "SUSPENDU" | "TERMINE"
export type StatutProjet = "BROUILLON" | "EN_ATTENTE" | "EN_COURS" | "SUSPENDU" | "EXPIRE" | "TERMINE"
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

export interface Activite {
  id: string
  intitule: string
  ordre: number
  terminee: boolean
  date_echeance?: string
  projet_id: string
}

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
  activites?: Activite[]
  created_at: string
  updated_at: string
}
export type StatutConvention = "BROUILLON"| "EN_ATTENTE_SIGNATURE"| "SIGNEE"| "ACTIVE"| "SUSPENDUE"| "EXPIREE"
export type EtapeCircuit = "REDACTION" | "TRANSMISSION" | "VERIFICATION_DAJ" | "ATTENTE_SIGNATURE" | "SIGNEE"
export interface Convention {
  id: string
  reference: string
  titre: string
  etablissement_nom?: string
  date_signature?: string
  date_debut?: string
  date_fin?: string
  statut: StatutConvention
  etape_circuit: EtapeCircuit
  date_derniere_etape?: string
  description?: string
  archive: boolean
  partenariat_id?: string
  projet_id?: string
  created_at: string
  updated_at: string
}

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
  convention_id?: string
  bailleur?: string
  beneficiaire?: string
  etablissement_nom?: string
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

export interface Etablissement {
  id: string
  nom: string
  sigle?: string
  logo_url?: string
  description?: string
}
export type TypeDocument = "TDR" | "DESCRIPTION" | "CONVENTION" | "AUTRE"

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
export type StatutPublication = "BROUILLON" | "PUBLIEE"

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
// à ajouter dans src/types/api.ts
export type TypeNotification =
  | "PROJET_SOUMIS" | "PARTENARIAT_SOUMIS" | "EXPIRATION_CONVENTION" | "CONVENTION_EXPIREE"
  | "ACTIVITE_ECHEANCE" | "ACTIVITE_RETARD" | "PROJET_RETARD" | "DOCUMENT_AJOUTE"
  | "DOCUMENT_MODIFIE" | "CHANGEMENT_STATUT"

export type PrioriteNotification = "BASSE" | "MOYENNE" | "HAUTE"

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
// à ajouter dans src/types/api.ts
export interface SyntheseItem {
  id: string
  etablissement_id: string
  annee: number
  type: string
  valeur: string
}

export interface SynthesePartenaireStrategique {
  id: string
  etablissement_id: string
  annee: number
  partenaire_id: string
  partenaire?: Partenaire
}

export interface SyntheseEtablissement {
  etablissement_id: string
  etablissement_nom: string
  annee: number
  nombre_partenaires: number
  conventions_actives: number
  conventions_expirees: number
  nombre_cotutelles: number
  projets_actifs: number
  items_narratifs: SyntheseItem[]
  partenaires_strategiques: SynthesePartenaireStrategique[]
}

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
  type: "convention" | "activite" | "projet"
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

export type TypeArchive = "partenaires" | "partenariats" | "projets" | "conventions" | "cotutelles"
export type DomainePartenariat =
  | "RECHERCHE" | "FORMATION" | "INNOVATION"
  | "DEVELOPPEMENT" | "COOPERATION_INSTITUTIONNELLE" | "AUTRE"

export interface Partenariat {
  id: string
  intitule: string
  nom?: string
  type?: string
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
  etablissements?: { etablissement_id: string; etablissement?: { id: string; nom: string } }[]
  partenaires?: { partenaire_id: string; partenaire?: Partenaire }[]
  created_at: string
  updated_at: string
=======
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
>>>>>>> Stashed changes
}