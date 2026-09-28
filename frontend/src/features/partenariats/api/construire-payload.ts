// src/features/partenariats/api/construire-payload.ts

import { videsEnNull } from '@/lib/payload';
import { versIso } from '@/lib/format';
import type { PartenariatFormValues } from '@/lib/validators/partenariat.schema';

export function construirePayloadPartenariat(valeurs: PartenariatFormValues): Record<string, unknown> {
  const { date_debut, date_fin, partenaires_ids, etablissements_ids, ...reste } = valeurs;

  return {
    ...videsEnNull(reste),
    date_debut: versIso(date_debut),
    date_fin: date_fin ? versIso(date_fin) : null,
    partenaires_ids,
    ...(etablissements_ids.length > 0 ? { etablissements_ids } : {}),
  };
}