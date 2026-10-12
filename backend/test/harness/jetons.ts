/**
 * Fabrication de jetons JWT pour les tests.
 *
 * Les jetons sont signes directement avec le secret de test afin de ne pas
 * dependre de la route /auth/login (limitee a 5 tentatives par minute).
 */
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET_TEST } from './application-test';
import type { Role } from '../../src/common/enums/role.enum';

export interface UtilisateurJeton {
  id: string;
  email: string;
  role: Role;
}

export function jetonAcces(utilisateur: UtilisateurJeton): string {
  return jwt.sign(
    { sub: utilisateur.id, email: utilisateur.email, role: utilisateur.role },
    JWT_SECRET_TEST,
    { expiresIn: '1h' },
  );
}

export function enteteBearer(utilisateur: UtilisateurJeton): [string, string] {
  return ['Authorization', `Bearer ${jetonAcces(utilisateur)}`];
}

/** Extrait le contenu utile de l'enveloppe ITDCMADA. */
export function donnees<T = any>(corps: any): T {
  return corps?.data as T;
}
