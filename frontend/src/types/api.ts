// src/types/api.ts
export type RoleUtilisateur = "PRESIDENCE" | "ETABLISSEMENT" | "DECIDEUR"

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
export type StatutConvention =
  | "BROUILLON"
  | "EN_ATTENTE_SIGNATURE"
  | "SIGNEE"
  | "ACTIVE"
  | "SUSPENDUE"
  | "EXPIREE"
export type EtapeCircuit = "REDACTION" | "TRANSMISSION" | "VERIFICATION_DAJ" | "ATTENTE_SIGNATURE" | "SIGNEE"

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