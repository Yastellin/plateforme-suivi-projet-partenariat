// src/hooks/usePermissions.ts

import { useAuth } from '@/hooks/useAuth';
import type { RoleUtilisateur } from '@/types/api';

interface Permissions {
  role: RoleUtilisateur | null;
  peutCreer: boolean;
  peutModifier: boolean;
  peutArchiver: boolean;
  peutSoumettre: boolean;
  peutTeleverser: boolean;
  peutExporter: boolean;
  /** Création / suppression des contenus de synthèse (Présidence uniquement). */
  peutGererSynthese: boolean;
  estLectureSeule: boolean;
  estPresidence: boolean;
  estEtablissement: boolean;
  estDecideur: boolean;
}

const ROLES_ECRITURE: RoleUtilisateur[] = ['PRESIDENCE', 'ETABLISSEMENT'];

export function usePermissions(): Permissions {
  const { utilisateur } = useAuth();
  const role = utilisateur?.role ?? null;

  const peutEcrire = role !== null && ROLES_ECRITURE.includes(role);

  return {
    role,
    peutCreer: peutEcrire,
    peutModifier: peutEcrire,
    peutArchiver: role === 'PRESIDENCE',
    // Seul un etablissement soumet ses creations a la Presidence.
    // La Presidence est le destinataire des soumissions, pas l'emetteur.
    peutSoumettre: role === 'ETABLISSEMENT',
    peutTeleverser: peutEcrire,
    peutExporter: role === 'PRESIDENCE',
    peutGererSynthese: role === 'PRESIDENCE',
    estLectureSeule: role === 'DECIDEUR',
    estPresidence: role === 'PRESIDENCE',
    estEtablissement: role === 'ETABLISSEMENT',
    estDecideur: role === 'DECIDEUR',
  };
}