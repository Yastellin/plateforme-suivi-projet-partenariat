// src/hooks/usePermissions.ts

import { useAuth } from "@/hooks/useAuth"
import type { RoleUtilisateur } from "@/types/api"

export interface Permissions {
  role: RoleUtilisateur | null
  peutCreer: boolean
  peutModifier: boolean
  peutArchiver: boolean
  peutSoumettre: boolean
  peutTeleverser: boolean
  peutExporter: boolean
  /** Création / suppression des contenus de synthèse (Présidence uniquement). */
  peutGererSynthese: boolean
  estLectureSeule: boolean
  estPresidence: boolean
  estEtablissement: boolean
  estDecideur: boolean
}

const ROLES_ECRITURE: RoleUtilisateur[] = ["PRESIDENCE", "ETABLISSEMENT"]

/** Matrice de capacités centralisée, testable sans rendre un composant React. */
export function permissionsPourRole(role: RoleUtilisateur | null): Permissions {
  const peutEcrire = role !== null && ROLES_ECRITURE.includes(role)

  return {
    role,
    peutCreer: peutEcrire,
    peutModifier: peutEcrire,
    peutArchiver: role === "PRESIDENCE",
    // La soumission est une action d'établissement. La Présidence reçoit et
    // publie les données ; elle ne se les soumet jamais à elle-même.
    peutSoumettre: role === "ETABLISSEMENT",
    peutTeleverser: role === "PRESIDENCE",
    peutExporter: role === "PRESIDENCE",
    peutGererSynthese: role === "PRESIDENCE",
    estLectureSeule: role === "DECIDEUR",
    estPresidence: role === "PRESIDENCE",
    estEtablissement: role === "ETABLISSEMENT",
    estDecideur: role === "DECIDEUR",
  }
}

export function usePermissions(): Permissions {
  const { utilisateur } = useAuth()
  return permissionsPourRole(utilisateur?.role ?? null)
}
