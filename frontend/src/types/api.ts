// src/types/api.ts
export type RoleUtilisateur = "PRESIDENCE" | "ETABLISSEMENT" | "DECIDEUR"

export interface Utilisateur {
  id: string
  identifiant: string
  role: RoleUtilisateur
  etablissementId: string | null
}

export interface ReponseApi<T> {
  status: "success" | "error"
  message: string
  data: T | null
  errors?: string[]
  signature: string
}