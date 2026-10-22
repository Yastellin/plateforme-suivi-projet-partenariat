// src/features/auth/components/LoginForm.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { connexionSchema, type ConnexionFormValues } from "@/lib/validators/auth.schema";
import { FloatingLabelInput } from "@/components/forms/inputs/FloatingLabelInput";
import { PasswordInput } from "@/components/forms/inputs/PasswordInput";
import { useBlocageTemporaire } from "@/hooks/useBlocageTemporaire";
import { useLogin } from "../api/useLogin";
import { useAuth } from "@/hooks/useAuth";
import { cheminTableauDeBord } from "@/router";

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connecter } = useAuth();
  const { mutate, isPending } = useLogin();
  const { secondesRestantes, bloque, bloquer, estTropDeRequetes } = useBlocageTemporaire();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ConnexionFormValues>({
    resolver: zodResolver(connexionSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { email: '', motDePasse: '', seSouvenir: false },
  });

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
          if (estTropDeRequetes(erreur.message)) {
            bloquer();
            toast.error('Trop de tentatives', {
              description: 'Veuillez patienter avant de réessayer.',
            });
            return;
          }
          toast.error('Identifiant ou mot de passe incorrect', {
            description: 'Vérifiez vos informations et réessayez.',
          });
        },
      },
    );
  }

  const boutonBloque = isPending || bloque || !isValid;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FloatingLabelInput
        label="Adresse e-mail"
        requis
        type="email"
        autoComplete="email"
        autoFocus
        icone={<Mail />}
        placeholder="prenom.nom@univ-fianarantsoa.mg"
        aide="Utilisez votre adresse institutionnelle @univ-fianarantsoa.mg"
        erreur={errors.email?.message}
        {...register('email')}
      />

      <PasswordInput
        requis
        aide="8 caractères minimum"
        erreur={errors.motDePasse?.message}
        {...register('motDePasse')}
      />

      <div className="mb-6 mt-1 flex items-center justify-between px-0.5">
        <label className="flex items-center gap-2 text-[12.5px] text-[var(--color-text-secondary)]">
          <input type="checkbox" className="h-[15px] w-[15px] accent-[var(--color-brand)]" {...register('seSouvenir')} />
          Se souvenir de moi
        </label>
        <Link
          to="/mot-de-passe-oublie"
          className="text-[12.5px] font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] hover:underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>

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
}
