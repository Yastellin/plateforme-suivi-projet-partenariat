import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ExcelGeneratorPort } from './excel-generator.port';

@Injectable()
export class ExceljsGeneratorAdapter implements ExcelGeneratorPort {
  async genererTableau(
    nomFeuille: string,
    colonnes: { header: string; key: string; width?: number }[],
    lignes: Record<string, any>[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Plateforme UF';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(nomFeuille);

    worksheet.columns = colonnes.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width ?? 20,
    }));

    // Style en-têtes
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Lignes
    for (const ligne of lignes) {
      worksheet.addRow(ligne);
    }

    // Bordures sur toutes les cellules
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}