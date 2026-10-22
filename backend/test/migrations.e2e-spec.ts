import { DataSource, QueryRunner } from 'typeorm';
import { ENTITES } from '../src/database/entites';
import { InitSchema1791200000000 } from '../src/database/migrations/1791200000000-InitSchema';
import { AddDocumentCotutellePartenariat1792000000001 } from '../src/database/migrations/1792000000001-AddDocumentCotutellePartenariat';
import { AddSoumissionPublication1792000000002 } from '../src/database/migrations/1792000000002-AddSoumissionPublication';
import { NormalizeContactDetails1793200000000 } from '../src/database/migrations/1793200000000-NormalizeContactDetails';
import { EnforceDocumentParentAndBackfillPublication1793400000000 } from '../src/database/migrations/1793400000000-EnforceDocumentParentAndBackfillPublication';
import { demarrerBaseTest, type BaseTest } from './harness/base-postgres';

describe('Migrations avec données préexistantes', () => {
  let base: BaseTest;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    base = await demarrerBaseTest();
    dataSource = new DataSource({
      type: 'postgres',
      url: base.url,
      entities: ENTITES,
      migrations: [InitSchema1791200000000],
      migrationsTableName: 'migrations_typeorm',
      synchronize: false,
    });
    await dataSource.initialize();
    await dataSource.runMigrations();

    await dataSource.query(`
      INSERT INTO "Etablissement" (id, nom, sigle)
      VALUES ('10000000-0000-4000-8000-000000000001', 'Université de Fianarantsoa', 'UF')
    `);
    await dataSource.query(`
      INSERT INTO "Partenaire" (
        id, nom, type, pays, email, telephone, etablissement_id
      ) VALUES (
        '20000000-0000-4000-8000-000000000001',
        'Université de Toliara', 'Université', 'Madagascar',
        ' Contact@UNIV-TOLIARA.MG ', '034 12 345 67',
        '10000000-0000-4000-8000-000000000001'
      )
    `);
    await dataSource.query(`
      INSERT INTO "Contact" (
        id, nom, fonction, email, telephone, partenaire_id
      ) VALUES (
        '30000000-0000-4000-8000-000000000001',
        'Rakoto Soa', 'Responsable des partenariats',
        'soa.rakoto@univ-toliara.mg', '00 261 32 12 345 67',
        '20000000-0000-4000-8000-000000000001'
      )
    `);

    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await new NormalizeContactDetails1793200000000().up(queryRunner);
  }, 120000);

  afterAll(async () => {
    if (queryRunner?.isReleased === false) await queryRunner.release();
    if (dataSource?.isInitialized) await dataSource.destroy();
    await base?.arreter();
  });

  it('recrée toutes les coordonnées en conservant leur propriétaire', async () => {
    const coordonnees = await dataSource.query(`
      SELECT type, valeur, valeur_normalisee, partenaire_id, contact_id
      FROM "Coordonnee"
      ORDER BY type, valeur_normalisee
    `);

    expect(coordonnees).toHaveLength(4);
    expect(coordonnees).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'EMAIL',
          valeur_normalisee: 'contact@univ-toliara.mg',
          partenaire_id: '20000000-0000-4000-8000-000000000001',
          contact_id: null,
        }),
        expect.objectContaining({
          type: 'TELEPHONE',
          valeur_normalisee: '+261341234567',
          partenaire_id: '20000000-0000-4000-8000-000000000001',
          contact_id: null,
        }),
        expect.objectContaining({
          type: 'TELEPHONE',
          valeur_normalisee: '+261321234567',
          partenaire_id: null,
          contact_id: '30000000-0000-4000-8000-000000000001',
        }),
      ]),
    );
  });

  it("applique l'unicité globale des coordonnées normalisées", async () => {
    await expect(
      dataSource.query(`
        INSERT INTO "Coordonnee" (
          id, type, valeur, valeur_normalisee, contact_id
        ) VALUES (
          '40000000-0000-4000-8000-000000000001', 'EMAIL',
          'CONTACT@univ-toliara.mg', 'contact@univ-toliara.mg',
          '30000000-0000-4000-8000-000000000001'
        )
      `),
    ).rejects.toThrow();
  });

  it("applique l'unicité de l'identité d'un partenaire actif", async () => {
    await expect(
      dataSource.query(`
        INSERT INTO "Partenaire" (
          id, nom, type, pays, etablissement_id
        ) VALUES (
          '20000000-0000-4000-8000-000000000002',
          ' université DE TOLIARA ', 'Université', ' madagascar ',
          '10000000-0000-4000-8000-000000000001'
        )
      `),
    ).rejects.toThrow();
  });

  it('renforce les parents documentaires, rattrape les publications et reste réversible', async () => {
    await new AddDocumentCotutellePartenariat1792000000001().up(queryRunner);
    await new AddSoumissionPublication1792000000002().up(queryRunner);

    await dataSource.query(`
      UPDATE "Partenaire"
      SET visibilite = 'PUBLIC'
      WHERE id = '20000000-0000-4000-8000-000000000001'
    `);
    await dataSource.query(`
      INSERT INTO "Projet" (
        id, nom, type, date_debut, date_fin_prevue, statut, etablissement_id
      ) VALUES (
        '50000000-0000-4000-8000-000000000001',
        'Projet environnemental Atsimo-Andrefana', 'RECHERCHE',
        '2026-01-01', '2027-01-01', 'EN_COURS',
        '10000000-0000-4000-8000-000000000001'
      )
    `);
    await dataSource.query(`
      INSERT INTO "Document" (
        id, nom_fichier, url_fichier, type, projet_id
      ) VALUES (
        '60000000-0000-4000-8000-000000000001',
        'accord.pdf', '/documents/accord.pdf', 'CONVENTION',
        '50000000-0000-4000-8000-000000000001'
      )
    `);

    const migration =
      new EnforceDocumentParentAndBackfillPublication1793400000000();
    await migration.up(queryRunner);

    const [partenaire] = await dataSource.query(`
      SELECT publie_le FROM "Partenaire"
      WHERE id = '20000000-0000-4000-8000-000000000001'
    `);
    expect(partenaire.publie_le).not.toBeNull();
    await expect(
      dataSource.query(`
        UPDATE "Document" SET projet_id = NULL
        WHERE id = '60000000-0000-4000-8000-000000000001'
      `),
    ).rejects.toThrow();

    await migration.down(queryRunner);
    await expect(
      dataSource.query(`
        UPDATE "Document" SET projet_id = NULL
        WHERE id = '60000000-0000-4000-8000-000000000001'
      `),
    ).resolves.toBeDefined();
    await expect(migration.up(queryRunner)).rejects.toThrow(
      '60000000-0000-4000-8000-000000000001',
    );
  });
});
