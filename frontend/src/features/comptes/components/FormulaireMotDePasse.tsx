// src/features/comptes/components/FormulaireMotDePasse.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { schemaChangerMotDePasse, type ChangerMotDePasseFormValues } from "@/lib/validators/compte.schema"
import { useChangerMotDePasse } from "@/features/comptes/api/useChangerMotDePasse"

export function FormulaireMotDePasse() {
  const [secousse, setSecousse] = useState(false)
  const changement = useChangerMotDePasse()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangerMotDePasseFormValues>({
    resolver: zodResolver(schemaChangerMotDePasse),
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const declencherSecousse = () => {
    setSecousse(true)
    setTimeout(() => setSecousse(false), 400)
  }

  const onSubmit = (valeurs: ChangerMotDePasseFormValues) => {
    changement.mutate(valeurs, {
      onSuccess: () => {
        toast.success("Mot de passe modifie avec succes")
        reset()
      },
      onError: (erreur) => {
        toast.error(erreur.message || "Le mot de passe actuel est incorrect")
        declencherSecousse()
      },
    })
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit, declencherSecousse)}
      animate={secousse ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex max-w-md flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mot_de_passe_actuel" requis>Mot de passe actuel</Label>
        <Input
          id="mot_de_passe_actuel"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.mot_de_passe_actuel}
          {...register("mot_de_passe_actuel")}
        />
        {errors.mot_de_passe_actuel && (
          <p className="text-sm text-destructive">{errors.mot_de_passe_actuel.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nouveau_mot_de_passe" requis>Nouveau mot de passe</Label>
        <Input
          id="nouveau_mot_de_passe"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.nouveau_mot_de_passe}
          {...register("nouveau_mot_de_passe")}
        />
        {errors.nouveau_mot_de_passe && (
          <p className="text-sm text-destructive">{errors.nouveau_mot_de_passe.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmation_mot_de_passe" requis>Confirmer le nouveau mot de passe</Label>
        <Input
          id="confirmation_mot_de_passe"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmation_mot_de_passe}
          {...register("confirmation_mot_de_passe")}
        />
        {errors.confirmation_mot_de_passe && (
          <p className="text-sm text-destructive">{errors.confirmation_mot_de_passe.message}</p>
        )}
      </div>

      <Button type="submit" disabled={changement.isPending} className="mt-2 self-start">
        {changement.isPending && <LoaderCircle className="animate-spin" />}
        Modifier le mot de passe
      </Button>
    </motion.form>
  )
}