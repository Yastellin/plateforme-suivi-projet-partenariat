import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { StatutFiltreExport, STATUTS_FILTRE_EXPORT } from './export.enums';

export type EntiteExportAvecStatut = 'CONVENTIONS' | 'PROJETS' | 'PARTENARIATS';

export const CORRESPONDANCES_STATUTS_EXPORT: Record<
  EntiteExportAvecStatut,
  Partial<Record<StatutFiltreExport, string[]>>
> = {
  CONVENTIONS: {
    [StatutFiltreExport.EN_COURS]: ['SIGNEE', 'ACTIVE'],
    [StatutFiltreExport.SUSPENDU]: ['SUSPENDUE'],
    [StatutFiltreExport.EXPIRE]: ['EXPIREE'],
  },
  PROJETS: {
    [StatutFiltreExport.EN_COURS]: ['EN_COURS'],
    [StatutFiltreExport.TERMINE]: ['TERMINE'],
    [StatutFiltreExport.SUSPENDU]: ['SUSPENDU'],
    [StatutFiltreExport.EXPIRE]: ['EXPIRE'],
  },
  PARTENARIATS: {
    [StatutFiltreExport.EN_COURS]: ['EN_COURS'],
    [StatutFiltreExport.TERMINE]: ['TERMINE'],
    [StatutFiltreExport.SUSPENDU]: ['SUSPENDU'],
  },
};

interface RegleRetardExport {
  statutToujoursEnRetard?: string;
  statutsExclus: string[];
  sansRegle: boolean;
}

/** Règles partagées par le prédicat de ligne et la clause SQL d’export. */
export const REGLES_RETARD_EXPORT: Record<
  EntiteExportAvecStatut,
  RegleRetardExport
> = {
  CONVENTIONS: {
    // Copie de backend/src/notifications/rules/convention-expiree.rule.ts.
    statutToujoursEnRetard: 'EXPIREE',
    statutsExclus: [],
    sansRegle: false,
  },
  PROJETS: {
    // Copie de backend/src/projets/projets.service.ts#enrichir, identique à backend/src/tableau-de-bord/tableau-de-bord.service.ts.
    statutsExclus: ['BROUILLON', 'TERMINE', 'EXPIRE'],
    sansRegle: false,
  },
  PARTENARIATS: {
    // Aucun indicateur de retard n’est défini dans backend/src/partenariats/partenariats.service.ts.
    statutsExclus: [],
    sansRegle: true,
  },
};

function clauseRetard(
  entite: EntiteExportAvecStatut,
  colonneStatut: string,
  colonneDateFin: string,
  maintenant: Date,
): { expression: string; parametres: Record<string, unknown> } | null {
  const regle = REGLES_RETARD_EXPORT[entite];
  if (regle.sansRegle) return null;

  const parametres: Record<string, unknown> = { dateRetard: maintenant };
  const dateDepassee = `${colonneDateFin} IS NOT NULL AND ${colonneDateFin} < :dateRetard`;
  const conditions = [dateDepassee];

  if (regle.statutToujoursEnRetard) {
    conditions.push(`${colonneStatut} = :statutToujoursEnRetard`);
    parametres.statutToujoursEnRetard = regle.statutToujoursEnRetard;
  }

  let expression = `(${conditions.join(' OR ')})`;
  if (regle.statutsExclus.length > 0) {
    expression = `(${dateDepassee} AND ${colonneStatut} NOT IN (:...statutsExclusRetard))`;
    parametres.statutsExclusRetard = regle.statutsExclus;
  }

  return { expression, parametres };
}

export function ajouterFiltreStatutsExport<T extends ObjectLiteral>(
  requete: SelectQueryBuilder<T>,
  entite: EntiteExportAvecStatut,
  colonneStatut: string,
  colonneDateFin: string,
  statuts: StatutFiltreExport[],
  maintenant: Date,
): void {
  const selection = new Set(statuts);

  // Tous les filtres sélectionnés signifient « tous les statuts », y compris
  // les statuts propres à une entité qui n'ont pas d'équivalent générique.
  if (STATUTS_FILTRE_EXPORT.every((statut) => selection.has(statut))) return;
  if (selection.size === 0) {
    requete.andWhere('1 = 0');
    return;
  }

  const statutsDirects = [...selection].flatMap(
    (statut) => CORRESPONDANCES_STATUTS_EXPORT[entite][statut] ?? [],
  );
  const conditions: string[] = [];
  const parametres: Record<string, unknown> = {};

  if (statutsDirects.length > 0) {
    conditions.push(`${colonneStatut} IN (:...statutsDirects)`);
    parametres.statutsDirects = statutsDirects;
  }

  if (selection.has(StatutFiltreExport.EN_RETARD)) {
    const clause = clauseRetard(
      entite,
      colonneStatut,
      colonneDateFin,
      maintenant,
    );
    if (clause) {
      conditions.push(clause.expression);
      Object.assign(parametres, clause.parametres);
    }
  }

  if (conditions.length === 0) {
    requete.andWhere('1 = 0');
    return;
  }

  // L’union en une seule clause OR évite de dupliquer une ligne qui satisfait
  // à la fois le statut Suspendu et la règle En retard.
  requete.andWhere(`(${conditions.join(' OR ')})`, parametres);
}

export function estEnRetardExport(
  entite: EntiteExportAvecStatut,
  statut: string,
  dateFin: Date | null | undefined,
  maintenant: Date,
): boolean {
  const regle = REGLES_RETARD_EXPORT[entite];
  if (regle.sansRegle) return false;
  if (statut === regle.statutToujoursEnRetard) return true;
  if (!dateFin || regle.statutsExclus.includes(statut)) return false;
  return dateFin.getTime() < maintenant.getTime();
}

const LIBELLES_STATUTS_REELS: Record<string, string> = {
  BROUILLON: 'Brouillon',
  EN_ATTENTE: 'En attente',
  EN_ATTENTE_SIGNATURE: 'En attente de signature',
  SIGNEE: 'Signée',
  ACTIVE: 'Active',
  SUSPENDUE: 'Suspendue',
  EXPIREE: 'Expirée',
  EN_COURS: 'En cours',
  SUSPENDU: 'Suspendu',
  EXPIRE: 'Expiré',
  TERMINE: 'Terminé',
  ACTIF: 'Actif',
};

export function libelleStatutExport(
  statut: string | null | undefined,
  enRetard = false,
): string {
  if (enRetard) return 'En retard';
  if (!statut) return '';
  return LIBELLES_STATUTS_REELS[statut] ?? statut;
}
