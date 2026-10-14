// src/features/auth/pages/LoginPage.tsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cheminTableauDeBord } from '@/router';
import { usePublicAccueil } from '@/features/espace-public/api/usePublicAccueil';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginForm } from '../components/LoginForm';

function StatistiqueAccueil({ valeur, libelle }: { valeur: number; libelle: string }) {
  return (
    <div>
      <strong className="block text-[22px] font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>
        {valeur}
      </strong>
      <span className="text-[11.5px] text-white/55">{libelle}</span>
    </div>
  );
}

function StatistiquesAccueil() {
  const { data, isLoading, isError } = usePublicAccueil();

  if (isLoading) {
    return (
      <div className="flex gap-7">
        <Skeleton className="h-10 w-16 bg-white/10" />
        <Skeleton className="h-10 w-16 bg-white/10" />
        <Skeleton className="h-10 w-16 bg-white/10" />
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const statistiques = data.statistiques ?? {
    partenaires_actifs: 0,
    projets_en_cours: 0,
    conventions_signees: 0,
  };

  return (
    <div className="flex gap-7">
      <StatistiqueAccueil valeur={statistiques.partenaires_actifs} libelle="Partenaires actifs" />
      <StatistiqueAccueil valeur={statistiques.projets_en_cours} libelle="Projets en cours" />
      <StatistiqueAccueil valeur={statistiques.conventions_signees} libelle="Conventions signées" />
    </div>
  );
}

export function LoginPage() {
  const { utilisateur, estCharge } = useAuth();

  if (estCharge) {
    return null;
  }

  if (utilisateur) {
    return <Navigate to={cheminTableauDeBord(utilisateur.role)} replace />;
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--color-brand-deep)] p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 2px, transparent 2px 26px)' }}
        />

        <div className="relative flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] border border-white/20 bg-white/10 text-base font-extrabold text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            UF
          </div>
          <div>
            <strong className="block text-sm font-bold text-white">Université de Fianarantsoa</strong>
            <span className="text-xs text-white/60">Projets &amp; Partenariats</span>
          </div>
        </div>

        <div className="relative max-w-[400px]">
          <h1 className="text-[27px] font-bold leading-[1.28] text-white">
            Suivi des projets et partenariats institutionnels
          </h1>
          <p className="mt-3.5 text-[13.5px] leading-relaxed text-white/70">
            Une plateforme unique pour consulter et gérer les collaborations de l'Université.
          </p>
        </div>

        <div className="relative">
          <StatistiquesAccueil />
        </div>
      </aside>

      <div className="flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-7 flex items-center gap-2.5 lg:hidden">
            <div
              className="grid h-[34px] w-[34px] place-items-center rounded-[var(--radius-sm)] bg-[var(--color-brand)] text-sm font-extrabold text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              UF
            </div>
            <div>
              <strong className="block text-[13px] font-bold">Université de Fianarantsoa</strong>
              <span className="block text-[11px] text-[var(--color-text-secondary)]">Projets &amp; Partenariats</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-[21px] font-bold">Connexion</h2>
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
              Connectez-vous avec votre compte institutionnel.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}