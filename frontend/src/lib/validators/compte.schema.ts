import { z } from "zod"
import {
  LONGUEUR_MAX_MOT_DE_PASSE,
  LONGUEUR_MIN_MOT_DE_PASSE,
  MOTIF_MOT_DE_PASSE,
} from "@/lib/validators/mot-de-passe.schema"

const nouveauMotDePasseSchema = z
  .string()
  .min(
    LONGUEUR_MIN_MOT_DE_PASSE,
    `Le nouveau mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`,
  )
  .max(
    LONGUEUR_MAX_MOT_DE_PASSE,
    `Le nouveau mot de passe ne peut pas dépasser ${LONGUEUR_MAX_MOT_DE_PASSE} caractères.`,
  )
  .regex(
    MOTIF_MOT_DE_PASSE,
    "Le nouveau mot de passe doit contenir une majuscule, une minuscule et un chiffre.",
  )

export const schemaChangerMotDePasse = z
  .object({
    mot_de_passe_actuel: z
      .string()
      .min(1, "Le mot de passe actuel est requis."),
    nouveau_mot_de_passe: nouveauMotDePasseSchema,
    confirmation_mot_de_passe: z
      .string()
      .min(1, "Veuillez confirmer le nouveau mot de passe."),
  })
  .refine(
    (valeurs) =>
      valeurs.nouveau_mot_de_passe === valeurs.confirmation_mot_de_passe,
    {
      message: "Les deux mots de passe doivent être identiques.",
      path: ["confirmation_mot_de_passe"],
    },
  )

export type ChangerMotDePasseFormValues = z.infer<
  typeof schemaChangerMotDePasse
>

export function versPayloadChangerMotDePasse(
  valeurs: ChangerMotDePasseFormValues,
) {
  return {
    mot_de_passe_actuel: valeurs.mot_de_passe_actuel,
    nouveau_mot_de_passe: valeurs.nouveau_mot_de_passe,
  }
}
