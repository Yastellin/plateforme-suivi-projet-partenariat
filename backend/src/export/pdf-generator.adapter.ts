import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit');
import { PdfGeneratorPort, ColonneTableau } from './pdf-generator.port';

@Injectable()
export class PdfkitGeneratorAdapter implements PdfGeneratorPort {
  async genererTableau(
    titre: string,
    colonnes: ColonneTableau[],
    lignes: Record<string, any>[],
    sousTitre?: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Titre
        doc.fontSize(18).font('Helvetica-Bold').text(titre, { align: 'center' });
        if (sousTitre) {
          doc.moveDown(0.3);
          doc.fontSize(11).font('Helvetica').text(sousTitre, { align: 'center' });
        }
        doc.moveDown(1);

        // Tableau
        const largeurUtile = doc.page.width - 80;
        const largeurCol = largeurUtile / colonnes.length;
        const hauteurLigne = 20;
        let y = doc.y;

        // En-têtes
        doc.fontSize(9).font('Helvetica-Bold');
        colonnes.forEach((col, i) => {
          doc.rect(40 + i * largeurCol, y, largeurCol, hauteurLigne).fillAndStroke('#e0e0e0', '#999999');
          doc.fillColor('#000000').text(col.header, 45 + i * largeurCol, y + 6, {
            width: largeurCol - 10,
            ellipsis: true,
          });
        });
        y += hauteurLigne;

        // Lignes
        doc.font('Helvetica').fontSize(8);
        for (const ligne of lignes) {
          if (y + hauteurLigne > doc.page.height - 60) {
            doc.addPage();
            y = 40;
          }
          colonnes.forEach((col, i) => {
            doc.rect(40 + i * largeurCol, y, largeurCol, hauteurLigne).stroke('#cccccc');
            const valeur = ligne[col.key] ?? '';
            doc.fillColor('#000000').text(String(valeur), 45 + i * largeurCol, y + 6, {
              width: largeurCol - 10,
              ellipsis: true,
            });
          });
          y += hauteurLigne;
        }

        // Pied de page
        doc.fontSize(8).fillColor('#666666');
        doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, 40, doc.page.height - 40, {
          align: 'center',
        });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}