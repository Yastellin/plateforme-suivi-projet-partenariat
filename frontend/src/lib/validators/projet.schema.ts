import { z } from "zod"

import { validerDates } from "./regles-dates"

// Forme du porteur saisi dans le formulaire. Union discriminee manuelle :
// Zod 4 impose des valeurs de discriminant uniques, ce que "mode: nouveau"
// (present sur trois branches) ne permet pas dans z.discriminatedUnion.
// Attendue identiquement par SelectionPorteur.tsx.
export type PorteurFormValue =
  | { mode: "existant"; porteur_id: string }
  | { mode: "nouveau"; type_porteur: "PERSONNE"; nom: string; institution_rattachement?: string }
  | { mode: "nouveau"; type_porteur: "ETABLISSEMENT"; etablissement_id: string }
  | { mode: "nouveau"; type_porteur: "AUTRE"; nom: string }

// Structure validee dans le superRefine de schemaProjetBase (messages precis
// et chemins imbriques porteur.nom / porteur.porteur_id). Le schema de champ
// reste permissif pour que les regles de dates du superRefine s'appliquent
// toujours, meme quand le porteur n'est pas encore valide.
const porteurSchema = z.custom<PorteurFormValue | null>(() => true)

const schemaProjetBase = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  intitule_officiel: z.string().optional(),
  type: z.string().min(1, "Le type est requis"),
  domaine: z.string().optional(),
  budget: z.coerce.number().nonnegative("Le budget doit etre positif").optional(),
  date_debut: z.string().min(1, "La date de debut est requise"),
  date_fin_prevue: z.string().min(1, "La date de fin prevue est requise"),
  statut: z.enum(["BROUILLON", "EN_ATTENTE", "EN_COURS", "SUSPENDU", "EXPIRE", "TERMINE"]),
  partenariat_id: z.string().optional(),
  etablissement_id: z.string().nullish(),
  porteur: porteurSchema,
  bailleurs_ids: z.array(z.string()).optional(),
  beneficiaires_ids: z.array(z.string()).optional(),
  sites_ids: z.array(z.string()).optional(),
})

export interface OptionsSchemaProjet {
  // A la creation seule : la date de debut ne peut pas etre anterieure au jour.
  exigerDateDebutFuture?: boolean
}

export function creerSchemaProjet({
  exigerDateDebutFuture = false,
}: OptionsSchemaProjet = {}) {
  return schemaProjetBase.superRefine((valeurs, ctx) => {
    // Le porteur est obligatoire : tout projet doit avoir une personne ou un
    // organisme responsable. L'etablissement, lui, reste facultatif (projet
    // transversal).
    validerPorteur(valeurs.porteur, ctx)

    validerDates(ctx, {
      dateDebut: valeurs.date_debut,
      dateFin: valeurs.date_fin_prevue,
      champFin: "date_fin_prevue",
      libelleFin: "date de fin prévue",
      exigerDateDebutFuture,
    })
  })
}

// Valide le porteur en entier : porteur existant selectionne, ou porteur
// nouveau completement renseigne. Un porteur absent bloque la creation.
function validerPorteur(
  porteur: PorteurFormValue | null | undefined,
  ctx: z.core.$RefinementCtx,
): void {
  if (!porteur || typeof porteur !== "object" || !("mode" in porteur)) {
    ctx.addIssue({
      code: "custom",
      path: ["porteur"],
      message: "Le porteur du projet est obligatoire.",
    })
    return
  }

  if (porteur.mode === "existant") {
    if (!porteur.porteur_id) {
      ctx.addIssue({
        code: "custom",
        path: ["porteur", "porteur_id"],
        message: "Selectionnez un porteur existant.",
      })
    }
    return
  }

  if (porteur.mode === "nouveau") {
    if (porteur.type_porteur === "ETABLISSEMENT") {
      if (!porteur.etablissement_id) {
        ctx.addIssue({
          code: "custom",
          path: ["porteur", "etablissement_id"],
          message: "Selectionnez un etablissement.",
        })
      }
      return
    }

    if (!porteur.nom || porteur.nom.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["porteur", "nom"],
        message: "Le nom est requis (2 caracteres minimum).",
      })
    }
    return
  }

  ctx.addIssue({
    code: "custom",
    path: ["porteur"],
    message: "Le porteur du projet est obligatoire.",
  })
}

export const schemaProjet = creerSchemaProjet()

export type ProjetFormValues = z.infer<typeof schemaProjetBase>

// Transforme la valeur du formulaire (porteur polymorphe) en payload attendu
// par le backend : soit { porteur_id }, soit { porteur: CreatePorteurDto }.
// Appelee par useCreateProjet et useUpdateProjet avant l'envoi.
export function preparerPayloadProjet(valeurs: ProjetFormValues) {
  const { porteur, ...reste } = valeurs

  if (!porteur) {
    return { ...reste, porteur_id: undefined }
  }

  if (porteur.mode === "existant") {
    return { ...reste, porteur_id: porteur.porteur_id }
  }

  if (porteur.type_porteur === "ETABLISSEMENT") {
    return {
      ...reste,
      porteur: {
        type_porteur: "ETABLISSEMENT" as const,
        etablissement_id: porteur.etablissement_id,
      },
    }
  }

  return {
    ...reste,
    porteur: {
      type_porteur: porteur.type_porteur,
      nom: porteur.nom,
      institution_rattachement:
        porteur.type_porteur === "PERSONNE" ? porteur.institution_rattachement : undefined,
    },
  }
}