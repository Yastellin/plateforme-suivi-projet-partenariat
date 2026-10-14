// src/lib/roles.ts

import type { RoleUtilisateur } from '@/types/api';

/**
 * Préfixe d'URL de l'espace interne correspondant au rôle
 * (`/presidence`, `/etablissement`, `/decideur`).
 */
export function cheminBaseRole(role: RoleUtilisateur | null | undefined): string {
  if (role === 'ETABLISSEMENT') return '/etablissement';
  if (role === 'DECIDEUR') return '/decideur';
  return '/presidence';
}
