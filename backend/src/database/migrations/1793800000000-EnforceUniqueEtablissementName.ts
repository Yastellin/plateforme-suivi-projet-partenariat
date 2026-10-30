import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Interdit les doublons de noms d'établissement sans tenir compte de la casse. */
export class EnforceUniqueEtablissementName1793800000000 implements MigrationInterface {
  name = 'EnforceUniqueEtablissementName1793800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const doublons = (await queryRunner.query(`
      SELECT array_agg("nom" ORDER BY "nom") AS noms
      FROM "Etablissement"
      GROUP BY LOWER(BTRIM(REGEXP_REPLACE("nom", '[[:space:]]+', ' ', 'g')))
      HAVING COUNT(*) > 1
      LIMIT 1
    `)) as { noms: string[] }[];

    if (doublons.length > 0) {
      throw new Error(
        `Impossible d'ajouter la contrainte d'unicité : noms d'établissement en double (${doublons[0].noms.join(', ')}).`,
      );
    }

    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_etablissement_nom_normalise"
      ON "Etablissement" (
        LOWER(BTRIM(REGEXP_REPLACE("nom", '[[:space:]]+', ' ', 'g')))
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "uq_etablissement_nom_normalise"`);
  }
}
