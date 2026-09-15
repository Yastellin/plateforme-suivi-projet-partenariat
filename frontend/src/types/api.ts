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
  errors?: string[]
  signature: string
}