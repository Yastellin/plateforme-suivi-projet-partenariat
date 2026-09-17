import { z } from "zod"

export const schemaChangerMotDePasse = z
  .object({
    mot_de_passe_actuel: z.string().min(1, "Le mot de passe actuel est requis"),
    nouveau_mot_de_passe: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caracteres"),
    confirmation_mot_de_passe: z.string().min(1, "Veuillez confirmer le nouveau mot de passe"),
  })
  .refine((valeurs) => valeurs.nouveau_mot_de_passe === valeurs.confirmation_mot_de_passe, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmation_mot_de_passe"],
  })

export type ChangerMotDePasseFormValues = z.infer<typeof schemaChangerMotDePasse>

export function versPayloadChangerMotDePasse(valeurs: ChangerMotDePasseFormValues) {
  return {
    mot_de_passe_actuel: valeurs.mot_de_passe_actuel,
    nouveau_mot_de_passe: valeurs.nouveau_mot_de_passe,
  }
}
