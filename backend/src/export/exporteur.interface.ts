import { FiltresExportDto } from './dto/filtres-export.dto';
import { PorteeExport } from './export.enums';

export interface ColonneExport {
  cle: string;
  entete: string;
  largeur?: number;
}

export type ValeurExport = string | number | boolean | null;
export type LigneExport = Record<string, ValeurExport>;

export interface DonneesEntiteExport {
  portee: Exclude<PorteeExport, PorteeExport.TOUT>;
  libelle: string;
  nomFeuille: string;
  nomFichier: string;
  colonnes: ColonneExport[];
  lignes: LigneExport[];
}

export interface ExporteurEntite {
  readonly portee: Exclude<PorteeExport, PorteeExport.TOUT>;
  construireRequete(
    filtres: FiltresExportDto,
    maintenant: Date,
  ): Promise<DonneesEntiteExport>;
}
