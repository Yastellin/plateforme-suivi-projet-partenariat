// src/features/auth/components/LoginForm.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { FloatingLabelInput } from "@/components/forms/inputs/FloatingLabelInput"
import { schemaConnexion, type ConnexionFormValues } from "@/lib/validators/auth.schema"
import { useLogin } from "@/features/auth/api/useLogin"
import { useAuth } from "@/hooks/useAuth"
import { cheminTableauDeBord } from "@/router"

export function LoginForm() {
  const [secousse, setSecousse] = useState(false)
  const navigate = useNavigate()
  const { connecter } = useAuth()
  const connexion = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnexionFormValues>({
    resolver: zodResolver(schemaConnexion),
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const declencherSecousse = () => {
    setSecousse(true)
    setTimeout(() => setSecousse(false), 400)
  }

  const onSubmit = (valeurs: ConnexionFormValues) => {
    connexion.mutate(valeurs, {
      onSuccess: (reponse) => {
        connecter(reponse.utilisateur, reponse.access_token, reponse.refresh_token)
        navigate(cheminTableauDeBord(reponse.utilisateur.role))
      },
      onError: (erreur) => {
        toast.error(erreur.message || "Email ou mot de passe incorrect")
        declencherSecousse()
      },
    })
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit, declencherSecousse)}
      animate={secousse ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
      noValidate
    >
      <FloatingLabelInput
        label="Adresse e-mail"
        type="email"
        autoComplete="username"
        erreur={errors.email?.message}
        {...register("email")}
      />

      <FloatingLabelInput
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        erreur={errors.mot_de_passe?.message}
        {...register("mot_de_passe")}
      />

      <Button type="submit" disabled={connexion.isPending} className="mt-2">
        {connexion.isPending && <LoaderCircle className="animate-spin" />}
        Se connecter
      </Button>
    </motion.form>
  )
}