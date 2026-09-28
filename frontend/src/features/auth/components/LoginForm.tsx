// src/features/auth/components/LoginForm.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

<<<<<<< Updated upstream
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { schemaConnexion, type ConnexionFormValues } from "@/lib/validators/auth.schema"
import { useLogin } from "@/features/auth/api/useLogin"
import { useAuth } from "@/hooks/useAuth"
import { cheminTableauDeBord } from "@/router"
=======
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { connexionSchema, type ConnexionFormValues } from '@/lib/validators/auth.schema';
import { FloatingLabelInput } from '@/components/forms/inputs/FloatingLabelInput';
import { PasswordInput } from '@/components/forms/inputs/PasswordInput';
import { useLogin } from '../api/useLogin';
import { useAuth } from '@/hooks/useAuth';
import { cheminTableauDeBord } from '@/router';
>>>>>>> Stashed changes

const DUREE_BLOCAGE_SECONDES = 60;

export function LoginForm() {
<<<<<<< Updated upstream
  const [secousse, setSecousse] = useState(false)
  const navigate = useNavigate()
  const { connecter } = useAuth()
  const connexion = useLogin()
=======
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connecter } = useAuth();
  const { mutate, isPending } = useLogin();
  const [secondesRestantes, setSecondesRestantes] = useState(0);

  useEffect(() => {
    if (secondesRestantes <= 0) {
      return;
    }
    const intervalle = window.setInterval(() => {
      setSecondesRestantes((valeur) => Math.max(valeur - 1, 0));
    }, 1000);
    return () => window.clearInterval(intervalle);
  }, [secondesRestantes]);
>>>>>>> Stashed changes

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConnexionFormValues>({
    resolver: zodResolver(schemaConnexion),
    mode: "onChange",
    reValidateMode: "onChange",
  })

<<<<<<< Updated upstream
  const declencherSecousse = () => {
    setSecousse(true)
    setTimeout(() => setSecousse(false), 400)
  }

  const onSubmit = (valeurs: ConnexionFormValues) => {
    connexion.mutate(valeurs, {
      onSuccess: (reponse) => {
        connecter(reponse.utilisateur, reponse.access_token)
        navigate(cheminTableauDeBord(reponse.utilisateur.role))
=======
  function onSubmit(valeurs: ConnexionFormValues) {
    mutate(
      { email: valeurs.email, motDePasse: valeurs.motDePasse },
      {
        onSuccess: (reponse) => {
          connecter(reponse.utilisateur, reponse.access_token, reponse.refresh_token);
          const destination = searchParams.get('redirect') ?? cheminTableauDeBord(reponse.utilisateur.role);
          navigate(destination, { replace: true });
        },
        onError: (erreur) => {
          if (erreur.message.includes('Trop de requetes')) {
            setSecondesRestantes(DUREE_BLOCAGE_SECONDES);
            toast.error('Trop de tentatives', {
              description: `Veuillez patienter avant de réessayer.`,
            });
          } else {
            toast.error('Identifiant ou mot de passe incorrect', {
              description: 'Vérifiez vos informations et réessayez.',
            });
          }
        },
>>>>>>> Stashed changes
      },
      onError: (erreur) => {
        toast.error(erreur.message || "Email ou mot de passe incorrect")
        declencherSecousse()
      },
    })
  }

  const boutonBloque = isPending || secondesRestantes > 0;

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

<<<<<<< Updated upstream
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
=======
      <button
        type="submit"
        disabled={boutonBloque}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-[11px] text-[13.5px] font-semibold text-white transition-colors hover:border-[var(--color-brand-hover)] hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        {secondesRestantes > 0
          ? `Réessayez dans ${secondesRestantes}s`
          : isPending
            ? 'Connexion en cours…'
            : 'Se connecter'}
      </button>
    </form>
  );
>>>>>>> Stashed changes
}