import { Injectable } from '@nestjs/common';
import archiver from 'archiver';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { FiltresExportDto } from './dto/filtres-export.dto';
import {
  FormatExportAvance,
  LIBELLES_PORTÉE_EXPORT,
  ModePeriodeExport,
  StatutFiltreExport,
} from './export.enums';
import { DonneesEntiteExport, LigneExport } from './exporteur.interface';
import { formaterDateHeureExport, valeurTexteExport } from './formatage-export';

export interface FichierExportGenere {
  contenu: Buffer;
  nom: string;
  typeMime: string;
}

export interface InformationsExport {
  filtres: FiltresExportDto;
  libelleUtilisateur: string;
  dateGeneration: Date;
}

const LIBELLES_STATUTS: Record<StatutFiltreExport, string> = {
  [StatutFiltreExport.EN_COURS]: 'En cours',
  [StatutFiltreExport.TERMINE]: 'Terminé',
  [StatutFiltreExport.EN_RETARD]: 'En retard',
  [StatutFiltreExport.SUSPENDU]: 'Suspendu',
  [StatutFiltreExport.EXPIRE]: 'Expiré',
};

const COULEUR_MARQUE = '047857';
const COULEUR_TEXTE = '052E1F';
const COULEUR_LIGNE = 'D6E5DC';

@Injectable()
export class GenerateurExportAvanceService {
  async generer(
    format: FormatExportAvance,
    donnees: DonneesEntiteExport[],
    informations: InformationsExport,
  ): Promise<FichierExportGenere> {
    switch (format) {
      case FormatExportAvance.XLSX:
        return this.genererXlsx(donnees, informations);
      case FormatExportAvance.CSV:
        return this.genererCsvZip(donnees, informations);
      case FormatExportAvance.PDF:
        return this.genererPdf(donnees, informations);
    }
  }

  private nomBase(informations: InformationsExport): string {
    return `export_${informations.filtres.portee.toLowerCase()}_${informations.dateGeneration
      .toISOString()
      .slice(0, 10)}`;
  }

  private lignesInformations(
    donnees: DonneesEntiteExport[],
    informations: InformationsExport,
  ): Array<{ cle: string; valeur: string }> {
    const { filtres } = informations;
    const periode = filtres.periode;
    const periodeTexte =
      periode.mode === ModePeriodeExport.TOUT
        ? 'Toutes les périodes'
        : periode.mode === ModePeriodeExport.ANNEE
          ? `Année ${periode.annee}`
          : periode.mode === ModePeriodeExport.MOIS
            ? `Mois ${String((periode.mois ?? 0) + 1).padStart(2, '0')}/${periode.annee}`
            : `Du ${periode.du} au ${periode.au}`;
    const statutsTexte =
      filtres.statuts.length === 0
        ? 'Aucun'
        : filtres.statuts.map((statut) => LIBELLES_STATUTS[statut]).join(', ');
    const champsDate: Record<string, string> = {
      SIGNATURE: 'Date de signature',
      DEBUT: 'Date de début',
      FIN: 'Date de fin',
    };
    const formats: Record<FormatExportAvance, string> = {
      [FormatExportAvance.XLSX]: 'Excel (.xlsx)',
      [FormatExportAvance.CSV]: 'CSV (archive ZIP)',
      [FormatExportAvance.PDF]: 'PDF (.pdf)',
    };

    return [
      {
        cle: 'Date de génération',
        valeur: formaterDateHeureExport(informations.dateGeneration),
      },
      { cle: 'Utilisateur', valeur: informations.libelleUtilisateur },
      { cle: 'Portée', valeur: LIBELLES_PORTÉE_EXPORT[filtres.portee] },
      { cle: 'Période', valeur: periodeTexte },
      {
        cle: 'Champ de date',
        valeur: periode.champ_date
          ? champsDate[periode.champ_date]
          : 'Sans filtre de date',
      },
      { cle: 'Statuts sélectionnés', valeur: statutsTexte },
      { cle: 'Format', valeur: formats[filtres.format] },
      ...donnees.map((entite) => ({
        cle: `Lignes — ${entite.libelle}`,
        valeur: String(entite.lignes.length),
      })),
      {
        cle: 'Total des lignes',
        valeur: String(
          donnees.reduce((total, entite) => total + entite.lignes.length, 0),
        ),
      },
    ];
  }

  private async genererXlsx(
    donnees: DonneesEntiteExport[],
    informations: InformationsExport,
  ): Promise<FichierExportGenere> {
    const classeur = new ExcelJS.Workbook();
    classeur.creator = 'Plateforme de suivi des projets et partenariats';
    classeur.created = informations.dateGeneration;

    const feuilleInformations = classeur.addWorksheet('Informations');
    feuilleInformations.columns = [
      { header: 'Information', key: 'cle', width: 28 },
      { header: 'Valeur', key: 'valeur', width: 64 },
    ];
    feuilleInformations.addRows(this.lignesInformations(donnees, informations));
    this.styliserFeuille(feuilleInformations);
    feuilleInformations.views = [{ state: 'frozen', ySplit: 1 }];

    for (const entite of donnees) {
      const feuille = classeur.addWorksheet(entite.nomFeuille.slice(0, 31));
      feuille.columns = entite.colonnes.map((colonne) => ({
        header: colonne.entete,
        key: colonne.cle,
        width: colonne.largeur ?? 24,
      }));
      feuille.addRows(entite.lignes.map((ligne) => this.ligneSure(ligne)));
      this.styliserFeuille(feuille);
      feuille.views = [{ state: 'frozen', ySplit: 1 }];
      feuille.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: entite.colonnes.length },
      };
    }

    const contenu = await classeur.xlsx.writeBuffer();
    return {
      contenu: Buffer.from(contenu),
      nom: `${this.nomBase(informations)}.xlsx`,
      typeMime:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private styliserFeuille(feuille: ExcelJS.Worksheet): void {
    const entete = feuille.getRow(1);
    entete.height = 24;
    entete.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    entete.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${COULEUR_MARQUE}` },
    };
    entete.alignment = { vertical: 'middle', wrapText: true };
    feuille.eachRow((ligne, numero) => {
      ligne.eachCell((cellule) => {
        cellule.border = {
          bottom: { style: 'thin', color: { argb: `FF${COULEUR_LIGNE}` } },
        };
        if (numero > 1) {
          cellule.font = { color: { argb: `FF${COULEUR_TEXTE}` } };
          cellule.alignment = { vertical: 'top', wrapText: true };
        }
      });
    });
  }

  private ligneSure(ligne: LigneExport): LigneExport {
    return Object.fromEntries(
      Object.entries(ligne).map(([cle, valeur]) => [
        cle,
        typeof valeur === 'string' && /^[\s]*[=+@-]/.test(valeur)
          ? `'${valeur}`
          : valeur,
      ]),
    );
  }

  private csvCellule(valeur: unknown): string {
    let texte = valeurTexteExport(valeur);
    if (/^[\s]*[=+@-]/.test(texte)) texte = `'${texte}`;
    return `"${texte.replace(/"/g, '""')}"`;
  }

  private csv(entetes: string[], lignes: Array<Array<unknown>>): string {
    const contenu = [entetes, ...lignes]
      .map((ligne) =>
        ligne.map((cellule) => this.csvCellule(cellule)).join(','),
      )
      .join('\r\n');
    return `\uFEFF${contenu}\r\n`;
  }

  private async genererCsvZip(
    donnees: DonneesEntiteExport[],
    informations: InformationsExport,
  ): Promise<FichierExportGenere> {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const sortie = new PassThrough();
    const morceaux: Buffer[] = [];
    const collecte = new Promise<void>((resolve, reject) => {
      sortie.on('data', (morceau: Buffer) =>
        morceaux.push(Buffer.from(morceau)),
      );
      sortie.once('end', resolve);
      sortie.once('error', reject);
      archive.once('error', reject);
      archive.once('warning', (erreur: NodeJS.ErrnoException) => {
        if (erreur.code === 'ENOENT') return;
        reject(erreur);
      });
    });
    archive.pipe(sortie);
    archive.append(
      this.csv(
        ['Information', 'Valeur'],
        this.lignesInformations(donnees, informations).map(
          ({ cle, valeur }) => [cle, valeur],
        ),
      ),
      { name: 'Informations.csv' },
    );

    for (const entite of donnees) {
      archive.append(
        this.csv(
          entite.colonnes.map((colonne) => colonne.entete),
          entite.lignes.map((ligne) =>
            entite.colonnes.map((colonne) => ligne[colonne.cle]),
          ),
        ),
        { name: entite.nomFichier },
      );
    }

    await archive.finalize();
    await collecte;
    return {
      contenu: Buffer.concat(morceaux),
      nom: `${this.nomBase(informations)}.zip`,
      typeMime: 'application/zip',
    };
  }

  private async genererPdf(
    donnees: DonneesEntiteExport[],
    informations: InformationsExport,
  ): Promise<FichierExportGenere> {
    const morceaux: Buffer[] = [];
    const document = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 34,
      info: {
        Title: 'Export des données — Présidence',
        Author: informations.libelleUtilisateur,
        Subject: 'Export des données de la plateforme',
      },
    });
    const sortie = new PassThrough();
    const collecte = new Promise<Buffer>((resolve, reject) => {
      sortie.on('data', (morceau: Buffer) =>
        morceaux.push(Buffer.from(morceau)),
      );
      sortie.once('end', () => resolve(Buffer.concat(morceaux)));
      sortie.once('error', reject);
      document.once('error', reject);
    });
    document.pipe(sortie);

    this.dessinerPageInformations(document, donnees, informations);
    for (const entite of donnees) {
      document.addPage({ size: 'A4', layout: 'landscape', margin: 34 });
      this.dessinerTableau(document, entite);
    }
    document.end();

    return {
      contenu: await collecte,
      nom: `${this.nomBase(informations)}.pdf`,
      typeMime: 'application/pdf',
    };
  }

  private dessinerPageInformations(
    document: PDFKit.PDFDocument,
    donnees: DonneesEntiteExport[],
    informations: InformationsExport,
  ): void {
    document
      .fillColor(`#${COULEUR_MARQUE}`)
      .font('Helvetica-Bold')
      .fontSize(19);
    document.text('Export des données', { continued: true });
    document.font('Helvetica').fontSize(10).fillColor(`#${COULEUR_TEXTE}`);
    document.text('  ·  Espace Présidence');
    document.moveDown(0.5);
    document
      .strokeColor(`#${COULEUR_LIGNE}`)
      .moveTo(document.page.margins.left, document.y)
      .lineTo(document.page.width - document.page.margins.right, document.y)
      .stroke();
    document.moveDown(1.1);

    for (const { cle, valeur } of this.lignesInformations(
      donnees,
      informations,
    )) {
      document
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(`#${COULEUR_TEXTE}`);
      document.text(`${cle} : `, { continued: true });
      document.font('Helvetica').text(valeur || '—');
      document.moveDown(0.4);
    }
  }

  private dessinerTableau(
    document: PDFKit.PDFDocument,
    entite: DonneesEntiteExport,
  ): void {
    const gauche = document.page.margins.left;
    const droite = document.page.width - document.page.margins.right;
    const largeurTotale = droite - gauche;
    const hauteurBas = document.page.height - document.page.margins.bottom;
    const largeurMax = entite.colonnes.reduce(
      (total, colonne) => total + (colonne.largeur ?? 24),
      0,
    );
    const largeurs = entite.colonnes.map(
      (colonne) =>
        (largeurTotale * (colonne.largeur ?? 24)) / Math.max(largeurMax, 1),
    );
    const hauteurLigne = 32;

    const dessinerEntete = (): number => {
      let x = gauche;
      const y = document.y;
      entite.colonnes.forEach((colonne, index) => {
        document
          .rect(x, y, largeurs[index], hauteurLigne)
          .fillAndStroke(`#${COULEUR_MARQUE}`, `#${COULEUR_LIGNE}`);
        document
          .fillColor('#FFFFFF')
          .font('Helvetica-Bold')
          .fontSize(7)
          .text(colonne.entete, x + 4, y + 5, {
            width: largeurs[index] - 8,
            height: hauteurLigne - 8,
            ellipsis: true,
          });
        x += largeurs[index];
      });
      document.y = y + hauteurLigne;
      return document.y;
    };

    document
      .fillColor(`#${COULEUR_MARQUE}`)
      .font('Helvetica-Bold')
      .fontSize(15);
    document.text(`${entite.libelle} (${entite.lignes.length})`);
    document.moveDown(0.65);
    dessinerEntete();

    for (const ligne of entite.lignes) {
      if (document.y + hauteurLigne > hauteurBas) {
        document.addPage({ size: 'A4', layout: 'landscape', margin: 34 });
        document
          .fillColor(`#${COULEUR_MARQUE}`)
          .font('Helvetica-Bold')
          .fontSize(11);
        document.text(`${entite.libelle} — suite`);
        document.moveDown(0.5);
        dessinerEntete();
      }

      const y = document.y;
      let x = gauche;
      entite.colonnes.forEach((colonne, index) => {
        document
          .rect(x, y, largeurs[index], hauteurLigne)
          .fillAndStroke('#FFFFFF', `#${COULEUR_LIGNE}`);
        document
          .fillColor(`#${COULEUR_TEXTE}`)
          .font('Helvetica')
          .fontSize(7)
          .text(valeurTexteExport(ligne[colonne.cle]), x + 4, y + 5, {
            width: largeurs[index] - 8,
            height: hauteurLigne - 8,
            ellipsis: true,
          });
        x += largeurs[index];
      });
      document.y = y + hauteurLigne;
    }

    if (entite.lignes.length === 0) {
      document.moveDown(1);
      document.font('Helvetica').fontSize(10).fillColor(`#${COULEUR_TEXTE}`);
      document.text('Aucune ligne ne correspond aux filtres sélectionnés.');
    }
  }
}
