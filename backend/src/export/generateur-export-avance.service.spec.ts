import ExcelJS from 'exceljs';
import { inflateRawSync } from 'zlib';
import {
  FormatExportAvance,
  PorteeExport,
  StatutFiltreExport,
} from './export.enums';
import { FiltresExportDto } from './dto/filtres-export.dto';
import { DonneesEntiteExport } from './exporteur.interface';
import { GenerateurExportAvanceService } from './generateur-export-avance.service';

const filtres = (): FiltresExportDto => ({
  portee: PorteeExport.PARTENAIRES,
  periode: {
    mode: 'TOUT' as FiltresExportDto['periode']['mode'],
    champ_date: 'DEBUT' as FiltresExportDto['periode']['champ_date'],
  },
  statuts: [StatutFiltreExport.EN_COURS],
  format: FormatExportAvance.XLSX,
});

const donnees: DonneesEntiteExport[] = [
  {
    portee: PorteeExport.PARTENAIRES,
    libelle: 'Partenaires',
    nomFeuille: 'Partenaires',
    nomFichier: 'partenaires.csv',
    colonnes: [
      { cle: 'nom', entete: 'Nom', largeur: 24 },
      { cle: 'statut', entete: 'Statut', largeur: 16 },
    ],
    lignes: [{ nom: '=1+1', statut: 'Actif' }],
  },
];

function extraireFichiersZip(zip: Buffer): Map<string, Buffer> {
  const fichiers = new Map<string, Buffer>();
  const signatureFin = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  const fin = zip.lastIndexOf(signatureFin);
  if (fin < 0) throw new Error('Fin de répertoire ZIP absente.');
  const nombreEntrees = zip.readUInt16LE(fin + 10);
  let curseur = zip.readUInt32LE(fin + 16);

  for (let index = 0; index < nombreEntrees; index += 1) {
    if (zip.readUInt32LE(curseur) !== 0x02014b50) {
      throw new Error('Entrée de répertoire ZIP invalide.');
    }
    const methode = zip.readUInt16LE(curseur + 10);
    const tailleCompressee = zip.readUInt32LE(curseur + 20);
    const longueurNom = zip.readUInt16LE(curseur + 28);
    const longueurExtra = zip.readUInt16LE(curseur + 30);
    const longueurCommentaire = zip.readUInt16LE(curseur + 32);
    const offsetLocal = zip.readUInt32LE(curseur + 42);
    const nom = zip
      .subarray(curseur + 46, curseur + 46 + longueurNom)
      .toString('utf8');
    const longueurNomLocal = zip.readUInt16LE(offsetLocal + 26);
    const longueurExtraLocal = zip.readUInt16LE(offsetLocal + 28);
    const debutContenu =
      offsetLocal + 30 + longueurNomLocal + longueurExtraLocal;
    const donneesCompressees = zip.subarray(
      debutContenu,
      debutContenu + tailleCompressee,
    );
    const contenu =
      methode === 8 ? inflateRawSync(donneesCompressees) : donneesCompressees;
    fichiers.set(nom, contenu);
    curseur += 46 + longueurNom + longueurExtra + longueurCommentaire;
  }
  return fichiers;
}

describe('GenerateurExportAvanceService', () => {
  const service = new GenerateurExportAvanceService();
  const informations = {
    filtres: filtres(),
    libelleUtilisateur: 'presidence@example.mg',
    dateGeneration: new Date('2026-06-15T09:30:00.000Z'),
  };

  it('génère un classeur avec la feuille d’informations en premier', async () => {
    const fichier = await service.generer(
      FormatExportAvance.XLSX,
      donnees,
      informations,
    );
    const classeur = new ExcelJS.Workbook();
    await classeur.xlsx.load(fichier.contenu);

    expect(classeur.worksheets.map((feuille) => feuille.name)).toEqual([
      'Informations',
      'Partenaires',
    ]);
    expect(
      classeur.getWorksheet('Partenaires')?.getRow(2).getCell(1).value,
    ).toBe("'=1+1");
    expect(fichier.typeMime).toContain('spreadsheetml');
  });

  it('génère un ZIP qui contient le fichier d’informations et un CSV par entité', async () => {
    const fichier = await service.generer(FormatExportAvance.CSV, donnees, {
      ...informations,
      filtres: { ...filtres(), format: FormatExportAvance.CSV },
    });
    const contenus = extraireFichiersZip(fichier.contenu);

    expect([...contenus.keys()]).toEqual([
      'Informations.csv',
      'partenaires.csv',
    ]);
    expect(contenus.get('Informations.csv')?.toString('utf8')).toContain(
      'Total des lignes',
    );
    expect(contenus.get('partenaires.csv')?.toString('utf8')).toContain(
      "'=1+1",
    );
    expect(fichier.contenu.subarray(0, 2).toString('hex')).toBe('504b');
  });

  it('génère un rapport PDF lisible', async () => {
    const fichier = await service.generer(FormatExportAvance.PDF, donnees, {
      ...informations,
      filtres: { ...filtres(), format: FormatExportAvance.PDF },
    });
    expect(fichier.contenu.subarray(0, 4).toString('ascii')).toBe('%PDF');
    expect(fichier.nom).toMatch(/\.pdf$/);
    expect(fichier.typeMime).toBe('application/pdf');
  });
});
