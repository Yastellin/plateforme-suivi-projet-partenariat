// src/lib/validators/regles-dates.ts

import type { z } from "zod"

/*
 * Regles de dates partagees par les formulaires (projets, partenariats,
 * conventions, cotutelles) :
 * - une date de debut ne peut pas etre anterieure au jour courant a l'ajout ;
 * - une date d'echeance doit etre posterieure a la date de debut.
 *
 * Les comparaisons portent sur le jour (les champs de type date renvoient
 * AAAA-MM-JJ, l'API renvoie de l'ISO 8601).
 */

/** Jour courant du poste, au format AAAA-MM-JJ des champs de type date. */
export function jourCourant(): string {
  const maintenant = new Date()
  const mois = String(maintenant.getMonth() + 1).padStart(2, "0")
  const jour = String(maintenant.getDate()).padStart(2, "0")
  return `${maintenant.getFullYear()}-${mois}-${jour}`
}

/** Ramene une date (ISO 8601 ou AAAA-MM-JJ) a son jour. */
export function jourDe(valeur: string): string {
  return valeur.slice(0, 10)
}

interface ReglesDates {
  dateDebut?: string
  dateFin?: string
  champDebut?: string
  champFin?: string
  libelleDebut?: string
  libelleFin?: string
  exigerDateDebutFuture?: boolean
}

/** Ajoute au formulaire les erreurs de dates communes a tous les modules. */
export function validerDates(ctx: z.core.$RefinementCtx, regles: ReglesDates): void {
  const {
    dateDebut,
    dateFin,
    champDebut = "date_debut",
    champFin = "date_fin",
    libelleDebut = "date de début",
    libelleFin = "date de fin",
    exigerDateDebutFuture = false,
  } = regles

  if (exigerDateDebutFuture && dateDebut && jourDe(dateDebut) < jourCourant()) {
    ctx.addIssue({
      code: "custom",
      path: [champDebut],
      message: `La ${libelleDebut} doit être aujourd'hui ou postérieure.`,
    })
  }

  if (dateDebut && dateFin && jourDe(dateFin) <= jourDe(dateDebut)) {
    ctx.addIssue({
      code: "custom",
      path: [champFin],
      message: `La ${libelleFin} doit être postérieure à la ${libelleDebut}.`,
    })
  }
}
