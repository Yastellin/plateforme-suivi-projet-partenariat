import { LogoInstitutionnel } from '@/components/shared/LogoInstitutionnel';
import { cn } from '@/lib/utils';
import { initialesUtilisateur } from '@/lib/utilisateur-utils';
import type { RoleUtilisateur } from '@/types/api';

interface AvatarCompteProps {
  role: RoleUtilisateur;
  email: string;
  className?: string;
}

/**
 * Avatar du compte connecté. Un compte Présidence reprend l'identité
 * institutionnelle globale ; les autres rôles conservent leurs initiales.
 */
export function AvatarCompte({ role, email, className }: AvatarCompteProps) {
  if (role === 'PRESIDENCE') {
    return (
      <LogoInstitutionnel
        className={cn(
          'h-8 w-8 flex-shrink-0 rounded-full border border-[var(--color-border)] bg-white object-contain p-0.5 text-[11px]',
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        'grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[var(--color-brand)] text-[11.5px] font-bold text-white',
        className,
      )}
      aria-label={`Compte ${email}`}
    >
      {initialesUtilisateur(email)}
    </span>
  );
}
