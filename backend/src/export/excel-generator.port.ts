export interface ExcelGeneratorPort {
  genererTableau(
    nomFeuille: string,
    colonnes: { header: string; key: string; width?: number }[],
    lignes: Record<string, any>[],
  ): Promise<Buffer>;
}

export const EXCEL_GENERATOR_PORT = 'EXCEL_GENERATOR_PORT';