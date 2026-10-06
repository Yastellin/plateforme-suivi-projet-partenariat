export interface ColonneTableau {
  header: string;
  key: string;
  width?: number;
}

export interface PdfGeneratorPort {
  genererTableau(
    titre: string,
    colonnes: ColonneTableau[],
    lignes: Record<string, any>[],
    sousTitre?: string,
  ): Promise<Buffer>;
}

export const PDF_GENERATOR_PORT = 'PDF_GENERATOR_PORT';