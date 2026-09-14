// src/features/auth/components/LoginForm.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
        connecter(reponse.utilisateur, reponse.access_token)
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mot_de_passe">Mot de passe</Label>
        <Input
          id="mot_de_passe"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.mot_de_passe}
          {...register("mot_de_passe")}
        />
        {errors.mot_de_passe && (
          <p className="text-sm text-destructive">{errors.mot_de_passe.message}</p>
        )}
      </div>

      <Button type="submit" disabled={connexion.isPending} className="mt-2">
        {connexion.isPending && <LoaderCircle className="animate-spin" />}
        Se connecter
      </Button>
    </motion.form>
  )
}