// src/lib/validators/cotutelle.schema.ts

import { z } from "zod"

import { validerDates } from "./regles-dates"

const schemaCotutelleBase = z.object({
  nom_doctorant: z.string().min(2, "Le nom du doctorant est requis"),
  specialite: z.string().optional(),
  directeur_these_local: z.string().optional(),
  directeur_these_partenaire: z.string().optional(),
  type: z.enum(["COTUTELLE", "COENCADREMENT"]),
  date_debut: z.string().min(1, "La date de début est requise"),
  date_prevue_soutenance: z.string().optional(),
  financement_bourse: z.string().optional(),
  etablissement_id: z.string().min(1, "L'établissement est requis"),
  partenaire_id: z.string().min(1, "Le partenaire (université) est requis"),
})

export interface OptionsSchemaCotutelle {
  // A l'ajout seulement : la date de debut ne peut pas etre anterieure au jour.
  exigerDateDebutFuture?: boolean
}

export function creerSchemaCotutelle({ exigerDateDebutFuture = false }: OptionsSchemaCotutelle = {}) {
  return schemaCotutelleBase.superRefine((valeurs, ctx) => {
    validerDates(ctx, {
      dateDebut: valeurs.date_debut,
      dateFin: valeurs.date_prevue_soutenance,
      champFin: "date_prevue_soutenance",
      libelleFin: "date prévue de soutenance",
      exigerDateDebutFuture,
    })
  })
}

export const schemaCotutelle = creerSchemaCotutelle()

export type CotutelleFormValues = z.infer<typeof schemaCotutelleBase>
