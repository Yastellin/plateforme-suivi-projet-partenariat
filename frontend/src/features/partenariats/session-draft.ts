import type { PartenariatFormValues } from '@/lib/validators/partenariat.schema';

export const CLE_BROUILLON_PARTENARIAT_SESSION = 'partenariat-wizard-draft';

export interface BrouillonPartenariatSession {
  formulaire: PartenariatFormValues;
  libelles: Record<string, string>;
  etape: number;
  version: number;
  nomPartenaire?: string;
}

export function lireBrouillonPartenariatSession(): BrouillonPartenariatSession | null {
  const brouillonBrut = window.sessionStorage.getItem(CLE_BROUILLON_PARTENARIAT_SESSION);
  if (!brouillonBrut) return null;

  try {
    const brouillon = JSON.parse(brouillonBrut) as BrouillonPartenariatSession;
    if (!brouillon.formulaire || !Array.isArray(brouillon.formulaire.partenaires_ids)) {
      throw new Error('Brouillon de partenariat invalide');
    }
    return brouillon;
  } catch {
    window.sessionStorage.removeItem(CLE_BROUILLON_PARTENARIAT_SESSION);
    return null;
  }
}
