// backend/src/conventions/convention-etablissement.ts
import type { FindOptionsRelations } from 'typeorm';
import type { Convention } from './entities/convention.entity';
import type { Etablissement } from '../etablissements/entities/etablissement.entity';

/** Relations nécessaires pour exposer l'établissement d'une convention (porteur du projet, sinon partenariat). */
export const CHARGEMENT_ETABLISSEMENT: FindOptionsRelations<Convention> = {
  partenariat: { etablissements: { etablissement: true } },
  projet: { etablissement: true },
  cotutelles: true,
};

/** Établissement de référence : celui du projet, sinon le premier établissement du partenariat. */
export function etablissementDeConvention(
  convention: Convention,
): Etablissement | null {
  return (
    convention.projet?.etablissement ??
    convention.partenariat?.etablissements?.[0]?.etablissement ??
    null
  );
}
