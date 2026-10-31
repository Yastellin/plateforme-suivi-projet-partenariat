import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PeriodeExportDto } from './dto/filtres-export.dto';
import { ModePeriodeExport } from './export.enums';

function debutJourUtc(dateIso: string): Date {
  return new Date(`${dateIso.slice(0, 10)}T00:00:00.000Z`);
}

function lendemainUtc(dateIso: string): Date {
  const lendemain = debutJourUtc(dateIso);
  lendemain.setUTCDate(lendemain.getUTCDate() + 1);
  return lendemain;
}

export function ajouterFiltrePeriodeExport<T extends ObjectLiteral>(
  requete: SelectQueryBuilder<T>,
  colonneDate: string,
  periode: PeriodeExportDto,
): void {
  switch (periode.mode) {
    case ModePeriodeExport.TOUT:
      return;
    case ModePeriodeExport.ANNEE: {
      const annee = periode.annee ?? new Date().getUTCFullYear();
      const debut = new Date(Date.UTC(annee, 0, 1));
      const fin = new Date(Date.UTC(annee + 1, 0, 1));
      requete.andWhere(
        `${colonneDate} >= :periodeDebut AND ${colonneDate} < :periodeFin`,
        { periodeDebut: debut, periodeFin: fin },
      );
      return;
    }
    case ModePeriodeExport.MOIS: {
      const annee = periode.annee ?? new Date().getUTCFullYear();
      const mois = periode.mois ?? 0;
      const debut = new Date(Date.UTC(annee, mois, 1));
      const fin = new Date(Date.UTC(annee, mois + 1, 1));
      requete.andWhere(
        `${colonneDate} >= :periodeDebut AND ${colonneDate} < :periodeFin`,
        { periodeDebut: debut, periodeFin: fin },
      );
      return;
    }
    case ModePeriodeExport.INTERVALLE:
      requete.andWhere(
        `${colonneDate} >= :periodeDebut AND ${colonneDate} < :periodeFin`,
        {
          periodeDebut: debutJourUtc(periode.du ?? ''),
          periodeFin: lendemainUtc(periode.au ?? ''),
        },
      );
  }
}
